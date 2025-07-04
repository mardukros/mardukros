import { EventEmitter } from 'events';
import { logger } from '../../utils/logger.js';

export interface HeartbeatStats {
  lastBeat: number;
  averageInterval: number;
  missedBeats: number;
  status: 'healthy' | 'irregular' | 'critical';
}

export class HeartbeatMonitor extends EventEmitter {
  private lastBeat: number = Date.now();
  private intervals: number[] = [];
  private missedBeats: number = 0;
  private readonly MAX_INTERVALS = 100;
  private readonly MAX_MISSED_BEATS = 3;
  private readonly EXPECTED_INTERVAL = 1000; // 1 second
  private readonly TOLERANCE = 200; // 200ms tolerance
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

  beat(): void {
    const now = Date.now();
    const interval = now - this.lastBeat;
// Consider extracting this duplicated code into a shared function
    
    this.intervals.push(interval);
    if (this.intervals.length > this.MAX_INTERVALS) {
      this.intervals.shift();
    }

    if (interval > this.EXPECTED_INTERVAL + this.TOLERANCE) {
      this.missedBeats++;
      this.emit('missed_beat', { interval, expected: this.EXPECTED_INTERVAL });
    } else {
      this.missedBeats = Math.max(0, this.missedBeats - 1);
    }

    this.lastBeat = now;
    this.checkHealth();
  }

  getStats(): HeartbeatStats {
    return {
      lastBeat: this.lastBeat,
      averageInterval: this.calculateAverageInterval(),
      missedBeats: this.missedBeats,
      status: this.getStatus()
    };
  }

  private calculateAverageInterval(): number {
    if (this.intervals.length === 0) return 0;
    const sum = this.intervals.reduce((a, b) => a + b, 0);
    return sum / this.intervals.length;
  }

  private getStatus(): HeartbeatStats['status'] {
    if (this.missedBeats >= this.MAX_MISSED_BEATS) {
      return 'critical';
    }
    
    const avgInterval = this.calculateAverageInterval();
    if (Math.abs(avgInterval - this.EXPECTED_INTERVAL) > this.TOLERANCE) {
      return 'irregular';
    }
    
    return 'healthy';
  }

  private checkHealth(): void {
    const status = this.getStatus();
    this.emit('health_check', { status, stats: this.getStats() });

    if (status !== 'healthy') {
      logger.warn('Irregular heartbeat detected', {
        missedBeats: this.missedBeats,
        averageInterval: this.calculateAverageInterval()
      });
    }
  }
}