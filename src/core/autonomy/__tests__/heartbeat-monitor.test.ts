import { HeartbeatMonitor } from '../heartbeat/heartbeat-monitor.js';
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

describe('HeartbeatMonitor', () => {
  let monitor: HeartbeatMonitor;
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

  beforeEach(() => {
    monitor = new HeartbeatMonitor();
  });
// Consider extracting this duplicated code into a shared function

  describe('Heartbeat Detection', () => {
    it('should track regular heartbeats', () => {
      monitor.beat();
      const stats = monitor.getStats();
      
      expect(stats.status).toBe('healthy');
      expect(stats.missedBeats).toBe(0);
    });

    it('should detect missed beats', () => {
      jest.useFakeTimers();
      
      monitor.beat();
      jest.advanceTimersByTime(2000); // Skip 2 seconds
      monitor.beat();
      
      const stats = monitor.getStats();
      expect(stats.missedBeats).toBeGreaterThan(0);
    });

    it('should calculate average interval', () => {
      monitor.beat();
      jest.advanceTimersByTime(1000);
      monitor.beat();
      
      const stats = monitor.getStats();
      expect(stats.averageInterval).toBeCloseTo(1000, -2);
    });
  });

  describe('Health Status', () => {
    it('should report healthy status for regular beats', () => {
      for (let i = 0; i < 5; i++) {
        monitor.beat();
        jest.advanceTimersByTime(1000);
      }
      
      expect(monitor.getStats().status).toBe('healthy');
    });

    it('should report irregular status for varying intervals', () => {
      monitor.beat();
      jest.advanceTimersByTime(800);
      monitor.beat();
      jest.advanceTimersByTime(1200);
      monitor.beat();
      
      expect(monitor.getStats().status).toBe('irregular');
    });

    it('should report critical status for too many missed beats', () => {
      monitor.beat();
      jest.advanceTimersByTime(5000); // Skip 5 seconds
      monitor.beat();
      
      expect(monitor.getStats().status).toBe('critical');
    });
  });

  describe('Event Emission', () => {
    it('should emit missed beat events', (done) => {
      monitor.on('missed_beat', ({ interval, expected }) => {
        expect(interval).toBeGreaterThan(expected);
        done();
      });

      monitor.beat();
      jest.advanceTimersByTime(2000);
      monitor.beat();
    });

    it('should emit health check events', (done) => {
      monitor.on('health_check', ({ status, stats }) => {
        expect(status).toBeDefined();
        expect(stats).toBeDefined();
        done();
      });

      monitor.beat();
    });
  });
});