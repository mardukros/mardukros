import { AutonomyCoordinator } from '../coordinator.js';
import { HeartbeatRegulator } from '../heartbeat/heartbeat-regulator.js';
import { AutonomyScheduler } from '../scheduler.js';
import { AutonomyMonitor } from '../monitoring/autonomy-monitor.js';

describe('Autonomy System Integration', () => {
  let scheduler: AutonomyScheduler;
  let coordinator: AutonomyCoordinator;
  let heartbeat: HeartbeatRegulator;
  let monitor: AutonomyMonitor;

  beforeEach(() => {
    coordinator = new AutonomyCoordinator();
    heartbeat = new HeartbeatRegulator(coordinator);
    monitor = new AutonomyMonitor();
    scheduler = new AutonomyScheduler();
  });

  afterEach(() => {
    scheduler.stop();
  });

  describe('System Startup', () => {
    it('should initialize and start all components', () => {
      scheduler.start();
      
      expect(heartbeat.getStats().status).toBe('healthy');
      expect(monitor.getStats().healthStatus).toBe('healthy');
    });

    it('should handle multiple start calls gracefully', () => {
      scheduler.start();
      scheduler.start(); // Second call should be ignored
      
      expect(scheduler['isRunning']).toBe(true);
    });
  });

  describe('Health Monitoring', () => {
    it('should detect and respond to irregular heartbeats', async () => {
      scheduler.start();
      
      // Simulate irregular heartbeat
      const stats = heartbeat.getStats();
      stats.status = 'irregular';
      
      // Verify system response
      expect(coordinator['optimizationFrequency']).toBeGreaterThan(1);
    });

    it('should pause optimizations on critical health', async () => {
      scheduler.start();
      
      // Simulate critical health
      const stats = heartbeat.getStats();
      stats.status = 'critical';
      
      await coordinator.stabilize();
      expect(coordinator['paused']).toBe(true);
    });
  });

  describe('System Recovery', () => {
    it('should attempt recovery when health degrades', async () => {
      scheduler.start();
      
      // Simulate health degradation
      monitor.getStats().healthStatus = 'degraded';
      
      await coordinator.stabilize();
      expect(monitor.getStats().healthStatus).toBe('healthy');
    });

    it('should gradually restore normal operation', async () => {
      scheduler.start();
      coordinator['optimizationFrequency'] = 4;
      
      await coordinator.stabilize();
      expect(coordinator['optimizationFrequency']).toBe(3);
    });
  });
});