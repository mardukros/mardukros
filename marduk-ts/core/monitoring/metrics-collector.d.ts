import { EventEmitter } from 'events';
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
export declare class MetricsCollector extends EventEmitter {
    private static instance;
    private metrics;
    private readonly BATCH_SIZE;
    private readonly FLUSH_INTERVAL;
    private constructor();
    static getInstance(): MetricsCollector;
    record(name: string, value: number, tags?: Record<string, string>): void;
    private setupPeriodicFlush;
    private flush;
    getMetrics(): Metric[];
}
export declare const metricsCollector: MetricsCollector;
//# sourceMappingURL=metrics-collector.d.ts.map