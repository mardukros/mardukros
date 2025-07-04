import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';

export interface Metric {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp: string;
}

export interface MetricsBatch {
  metrics: Metric[];
  timestamp: string;
}

export class MetricsCollector extends EventEmitter {
  private static instance: MetricsCollector;
  private metrics: Metric[] = [];
  private readonly BATCH_SIZE = 100;
  private readonly FLUSH_INTERVAL = 60000; // 1 minute

  private constructor() {
    super();
    this.setupPeriodicFlush();
  }

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  record(
    name: string,
    value: number,
    tags: Record<string, string> = {}
  ): void {
    const metric: Metric = {
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

  private setupPeriodicFlush(): void {
    setInterval(() => {
      if (this.metrics.length > 0) {
        this.flush();
      }
    }, this.FLUSH_INTERVAL);
  }

  private flush(): void {
    try {
      const batch: MetricsBatch = {
        metrics: [...this.metrics],
        timestamp: new Date().toISOString()
      };

      this.emit('flush', batch);
      logger.debug('Metrics flushed', { 
        count: batch.metrics.length 
      });

      this.metrics = [];
    } catch (error) {
      logger.error('Error flushing metrics:', error as Error);
    }
  }

  getMetrics(): Metric[] {
    return [...this.metrics];
  }
}

export const metricsCollector = MetricsCollector.getInstance();