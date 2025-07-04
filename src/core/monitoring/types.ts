
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: Record<string, 'healthy' | 'degraded' | 'unhealthy'>;
  details?: Record<string, any>;
  timestamp: string;
}

export interface MetricRecord {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp: string;
}
