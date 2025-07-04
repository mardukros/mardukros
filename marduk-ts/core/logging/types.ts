export interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface LogConfig {
  level: string;
  file: string;
  maxSize: number;
  maxFiles: number;
  format?: string;
}

export interface LogRotationConfig {
  maxSize: number;
  maxFiles: number;
  compress: boolean;
}