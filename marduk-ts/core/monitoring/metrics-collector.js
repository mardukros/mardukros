import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';
export class MetricsCollector extends EventEmitter {
    static instance;
    metrics = [];
    BATCH_SIZE = 100;
    FLUSH_INTERVAL = 60000; // 1 minute
    constructor() {
        super();
        this.setupPeriodicFlush();
    }
    static getInstance() {
        if (!MetricsCollector.instance) {
            MetricsCollector.instance = new MetricsCollector();
        }
        return MetricsCollector.instance;
    }
    record(name, value, tags = {}) {
        const metric = {
            name,
            value,
            tags,
            timestamp: new Date().toISOString()
        };
        this.metrics.push(metric);
        this.emit('metric', metric);
        if (this.metrics.length >= this.BATCH_SIZE) {
            this.flush();
        }
    }
    setupPeriodicFlush() {
        setInterval(() => {
            if (this.metrics.length > 0) {
                this.flush();
            }
        }, this.FLUSH_INTERVAL);
    }
    flush() {
        try {
            const batch = {
                metrics: [...this.metrics],
                timestamp: new Date().toISOString()
            };
            this.emit('flush', batch);
            logger.debug('Metrics flushed', {
                count: batch.metrics.length
            });
            this.metrics = [];
        }
        catch (error) {
            logger.error('Error flushing metrics:', error);
        }
    }
    getMetrics() {
        return [...this.metrics];
    }
}
export const metricsCollector = MetricsCollector.getInstance();
//# sourceMappingURL=metrics-collector.js.map