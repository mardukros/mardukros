/**
 * Meta-cognitive monitoring for sensorimotor systems
 * Provides self-diagnosis and optimization capabilities
 */

import { EventEmitter } from 'events';
import { MetaCognitiveMonitor } from '../interfaces/embodiment-interface';
import { 
  SensorimotorDiagnostics,
  SensorHealth,
  MotorHealth,
  IntegrationHealth,
  IntegrationError 
} from '../types/sensorimotor-types';

export class SensorimotorMetaMonitor extends EventEmitter implements MetaCognitiveMonitor {
  private isMonitoring: boolean = false;
  private monitoringInterval?: NodeJS.Timeout;
  private diagnosticsHistory: SensorimotorDiagnostics[] = [];
  private componentRegistry: Map<string, any> = new Map();
  private errorHistory: IntegrationError[] = [];
  private performanceMetrics: Map<string, number[]> = new Map();
  
  private readonly MONITORING_INTERVAL = 1000; // 1 second
  private readonly HISTORY_SIZE = 100;
  private readonly LATENCY_THRESHOLD = 100; // ms
  private readonly DATA_LOSS_THRESHOLD = 0.05; // 5%
  
  constructor() {
    super();
  }

  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      return;
    }
    
    this.isMonitoring = true;
    this.monitoringInterval = setInterval(
      () => this.performMonitoringCycle(),
      this.MONITORING_INTERVAL
    );
    
    this.emit('monitoringStarted');
  }

  async stopMonitoring(): Promise<void> {
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    
    this.emit('monitoringStopped');
  }

  async getDiagnostics(): Promise<SensorimotorDiagnostics> {
    const currentDiagnostics = await this.generateDiagnostics();
    
    // Store in history
    this.diagnosticsHistory.push(currentDiagnostics);
    if (this.diagnosticsHistory.length > this.HISTORY_SIZE) {
      this.diagnosticsHistory = this.diagnosticsHistory.slice(-this.HISTORY_SIZE);
    }
    
    return currentDiagnostics;
  }

  async detectLatencyIssues(): Promise<boolean> {
    const sensors = this.getSensorComponents();
    const motors = this.getMotorComponents();
    
    // Check sensor latencies
    for (const sensor of sensors) {
      try {
        const health = await sensor.getHealth();
        if (health.dataQuality?.latency > this.LATENCY_THRESHOLD) {
          this.recordError({
            type: 'sensor_timeout',
            message: `High latency detected in sensor ${sensor.id}: ${health.dataQuality.latency}ms`,
            timestamp: Date.now(),
            severity: 'medium',
            component: sensor.id
          });
          return true;
        }
      } catch (error) {
        // Sensor health check failed
        continue;
      }
    }
    
    // Check motor response times
    for (const motor of motors) {
      try {
        const health = await motor.getHealth();
        const avgResponseTime = this.getAverageResponseTime(motor.id);
        if (avgResponseTime > this.LATENCY_THRESHOLD) {
          this.recordError({
            type: 'processing_delay',
            message: `High response time detected in motor ${motor.id}: ${avgResponseTime}ms`,
            timestamp: Date.now(),
            severity: 'medium',
            component: motor.id
          });
          return true;
        }
      } catch (error) {
        // Motor health check failed
        continue;
      }
    }
    
    return false;
  }

  async detectDataLoss(): Promise<boolean> {
    const sensors = this.getSensorComponents();
    
    for (const sensor of sensors) {
      try {
        const health = await sensor.getHealth();
        const expectedRate = this.getExpectedDataRate(sensor.id);
        const actualRate = health.dataRate || 0;
        const lossRate = (expectedRate - actualRate) / expectedRate;
        
        if (lossRate > this.DATA_LOSS_THRESHOLD) {
          this.recordError({
            type: 'sensor_timeout',
            message: `Data loss detected in sensor ${sensor.id}: ${(lossRate * 100).toFixed(1)}%`,
            timestamp: Date.now(),
            severity: lossRate > 0.2 ? 'high' : 'medium',
            component: sensor.id
          });
          return true;
        }
      } catch (error) {
        // Sensor unavailable - this is data loss
        this.recordError({
          type: 'sensor_timeout',
          message: `Sensor ${sensor.id} unavailable`,
          timestamp: Date.now(),
          severity: 'high',
          component: sensor.id
        });
        return true;
      }
    }
    
    return false;
  }

  async detectIntegrationErrors(): Promise<boolean> {
    // Check for integration-specific issues
    const recentErrors = this.errorHistory.filter(
      error => Date.now() - error.timestamp < 60000 // Last minute
    );
    
    // High error rate indicates integration problems
    if (recentErrors.length > 10) {
      this.recordError({
        type: 'memory_overflow',
        message: `High error rate detected: ${recentErrors.length} errors in the last minute`,
        timestamp: Date.now(),
        severity: 'high',
        component: 'integration_system'
      });
      return true;
    }
    
    // Check for specific integration error types
    const integrationErrors = recentErrors.filter(
      error => error.type === 'memory_overflow' || error.type === 'processing_delay'
    );
    
    if (integrationErrors.length > 3) {
      this.recordError({
        type: 'memory_overflow',
        message: `Integration system showing instability: ${integrationErrors.length} integration errors`,
        timestamp: Date.now(),
        severity: 'medium',
        component: 'integration_system'
      });
      return true;
    }
    
    return false;
  }

  async attemptCalibration(sensorId: string): Promise<boolean> {
    const sensor = this.componentRegistry.get(sensorId);
    if (!sensor || sensor.type !== 'sensor') {
      return false;
    }
    
    try {
      this.emit('calibrationStarted', sensorId);
      const success = await sensor.calibrate();
      
      if (success) {
        this.emit('calibrationSucceeded', sensorId);
        this.recordPerformanceMetric(`${sensorId}_calibration`, 1);
      } else {
        this.emit('calibrationFailed', sensorId);
        this.recordPerformanceMetric(`${sensorId}_calibration`, 0);
      }
      
      return success;
    } catch (error) {
      this.emit('calibrationError', sensorId, error);
      this.recordError({
        type: 'calibration_error',
        message: `Calibration failed for sensor ${sensorId}: ${error}`,
        timestamp: Date.now(),
        severity: 'medium',
        component: sensorId
      });
      return false;
    }
  }

  async attemptReconnection(componentId: string): Promise<boolean> {
    const component = this.componentRegistry.get(componentId);
    if (!component) {
      return false;
    }
    
    try {
      this.emit('reconnectionStarted', componentId);
      
      // Try to shutdown and reinitialize
      await component.shutdown();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      await component.initialize();
      
      this.emit('reconnectionSucceeded', componentId);
      this.recordPerformanceMetric(`${componentId}_reconnection`, 1);
      return true;
    } catch (error) {
      this.emit('reconnectionFailed', componentId, error);
      this.recordError({
        type: 'motor_failure',
        message: `Reconnection failed for component ${componentId}: ${error}`,
        timestamp: Date.now(),
        severity: 'high',
        component: componentId
      });
      return false;
    }
  }

  async optimizeDataFlow(): Promise<void> {
    // Analyze current performance metrics
    const sensors = this.getSensorComponents();
    const motors = this.getMotorComponents();
    
    // Optimize sensor reading frequencies
    for (const sensor of sensors) {
      try {
        const health = await sensor.getHealth();
        const errorRate = health.errorCount / (Date.now() - (health.lastReading || Date.now()));
        
        if (errorRate > 0.01) { // More than 1% error rate
          // Reduce reading frequency
          await sensor.configure({ frequency: 5 }); // 5 Hz
          this.emit('optimizationApplied', sensor.id, 'reduced_frequency');
        } else if (errorRate < 0.001) { // Less than 0.1% error rate
          // Can increase frequency for better responsiveness
          await sensor.configure({ frequency: 20 }); // 20 Hz
          this.emit('optimizationApplied', sensor.id, 'increased_frequency');
        }
      } catch (error) {
        // Ignore optimization errors
        continue;
      }
    }
    
    // Optimize motor command queuing
    for (const motor of motors) {
      try {
        const status = await motor.getStatus();
        if (status.queueLength > 10) {
          // Clear old commands
          await motor.stop();
          this.emit('optimizationApplied', motor.id, 'queue_cleared');
        }
      } catch (error) {
        // Ignore optimization errors
        continue;
      }
    }
    
    this.emit('dataFlowOptimized');
  }

  // Component registration methods
  registerComponent(component: any): void {
    this.componentRegistry.set(component.id, component);
  }

  unregisterComponent(componentId: string): void {
    this.componentRegistry.delete(componentId);
  }

  // Private helper methods
  private async performMonitoringCycle(): Promise<void> {
    try {
      const diagnostics = await this.generateDiagnostics();
      
      // Check for issues
      const hasLatencyIssues = await this.detectLatencyIssues();
      const hasDataLoss = await this.detectDataLoss();
      const hasIntegrationErrors = await this.detectIntegrationErrors();
      
      if (hasLatencyIssues || hasDataLoss || hasIntegrationErrors) {
        this.emit('issuesDetected', { hasLatencyIssues, hasDataLoss, hasIntegrationErrors });
        
        // Attempt automatic recovery
        await this.attemptAutomaticRecovery();
      }
      
      this.emit('monitoringCycle', diagnostics);
    } catch (error) {
      this.emit('monitoringError', error);
    }
  }

  private async generateDiagnostics(): Promise<SensorimotorDiagnostics> {
    const sensorHealth: Record<string, SensorHealth> = {};
    const motorHealth: Record<string, MotorHealth> = {};
    
    // Collect sensor health
    const sensors = this.getSensorComponents();
    for (const sensor of sensors) {
      try {
        const health = await sensor.getHealth();
        sensorHealth[sensor.id] = {
          isOnline: sensor.isEnabled,
          dataRate: health.dataQuality?.reliability || 0,
          errorRate: health.errorCount / Math.max(1, Date.now() - (health.lastReading || Date.now())),
          averageLatency: health.dataQuality?.latency || 0,
          lastReading: health.lastReading || 0,
          calibrationStatus: health.calibrationStatus || 'invalid'
        };
      } catch (error) {
        sensorHealth[sensor.id] = {
          isOnline: false,
          dataRate: 0,
          errorRate: 1,
          averageLatency: 0,
          lastReading: 0,
          calibrationStatus: 'invalid'
        };
      }
    }
    
    // Collect motor health
    const motors = this.getMotorComponents();
    for (const motor of motors) {
      try {
        const health = await motor.getHealth();
        motorHealth[motor.id] = {
          isOnline: motor.isEnabled,
          commandRate: this.getAverageCommandRate(motor.id),
          errorRate: health.errorCount / Math.max(1, Date.now() - (health.lastCommand || Date.now())),
          averageResponseTime: this.getAverageResponseTime(motor.id),
          lastCommand: health.lastCommand || 0,
          safetyStatus: health.safetyStatus || 'error'
        };
      } catch (error) {
        motorHealth[motor.id] = {
          isOnline: false,
          commandRate: 0,
          errorRate: 1,
          averageResponseTime: 0,
          lastCommand: 0,
          safetyStatus: 'error'
        };
      }
    }
    
    // Calculate integration health
    const integrationHealth: IntegrationHealth = {
      memoryIntegrationRate: this.calculateMemoryIntegrationRate(),
      processingLatency: this.calculateProcessingLatency(),
      dataLossRate: this.calculateDataLossRate(),
      cognitiveLoad: this.calculateCognitiveLoad(),
      errors: this.errorHistory.slice(-10) // Last 10 errors
    };
    
    // Calculate overall health
    const sensorHealthValues = Object.values(sensorHealth).map(h => h.isOnline ? 1 : 0);
    const motorHealthValues = Object.values(motorHealth).map(h => h.isOnline ? 1 : 0);
    const overallHealth = (
      sensorHealthValues.reduce((sum: number, val) => sum + val, 0) / Math.max(1, sensorHealthValues.length) +
      motorHealthValues.reduce((sum: number, val) => sum + val, 0) / Math.max(1, motorHealthValues.length) +
      (1 - integrationHealth.dataLossRate)
    ) / 3;
    
    return {
      overallHealth,
      sensorHealth,
      motorHealth,
      integrationHealth,
      lastUpdate: Date.now()
    };
  }

  private getSensorComponents(): any[] {
    return Array.from(this.componentRegistry.values()).filter(c => c.type === 'sensor');
  }

  private getMotorComponents(): any[] {
    return Array.from(this.componentRegistry.values()).filter(c => c.type === 'motor');
  }

  private recordError(error: IntegrationError): void {
    this.errorHistory.push(error);
    if (this.errorHistory.length > 1000) {
      this.errorHistory = this.errorHistory.slice(-1000);
    }
    this.emit('errorRecorded', error);
  }

  private recordPerformanceMetric(key: string, value: number): void {
    const metrics = this.performanceMetrics.get(key) || [];
    metrics.push(value);
    if (metrics.length > 100) {
      metrics.splice(0, 1);
    }
    this.performanceMetrics.set(key, metrics);
  }

  private getExpectedDataRate(sensorId: string): number {
    // Default expected rate, should be configurable
    return 10; // 10 Hz
  }

  private getAverageResponseTime(motorId: string): number {
    const metrics = this.performanceMetrics.get(`${motorId}_response_time`) || [];
    return metrics.length > 0 ? metrics.reduce((sum, val) => sum + val, 0) / metrics.length : 0;
  }

  private getAverageCommandRate(motorId: string): number {
    const metrics = this.performanceMetrics.get(`${motorId}_command_rate`) || [];
    return metrics.length > 0 ? metrics.reduce((sum, val) => sum + val, 0) / metrics.length : 0;
  }

  private calculateMemoryIntegrationRate(): number {
    const metrics = this.performanceMetrics.get('memory_integration') || [];
    return metrics.length > 0 ? metrics.reduce((sum, val) => sum + val, 0) / metrics.length : 0;
  }

  private calculateProcessingLatency(): number {
    const metrics = this.performanceMetrics.get('processing_latency') || [];
    return metrics.length > 0 ? metrics.reduce((sum, val) => sum + val, 0) / metrics.length : 0;
  }

  private calculateDataLossRate(): number {
    const totalSensors = this.getSensorComponents().length;
    const onlineSensors = this.getSensorComponents().filter(s => s.isEnabled).length;
    return totalSensors > 0 ? (totalSensors - onlineSensors) / totalSensors : 0;
  }

  private calculateCognitiveLoad(): number {
    // Simple cognitive load calculation
    const errorRate = this.errorHistory.filter(e => Date.now() - e.timestamp < 60000).length / 60;
    return Math.min(1.0, errorRate / 10); // Normalize to 0-1
  }

  private async attemptAutomaticRecovery(): Promise<void> {
    // Try to optimize data flow
    await this.optimizeDataFlow();
    
    // Try to recalibrate problematic sensors
    const sensors = this.getSensorComponents();
    for (const sensor of sensors) {
      try {
        const health = await sensor.getHealth();
        if (health.calibrationStatus === 'expired' || health.calibrationStatus === 'invalid') {
          await this.attemptCalibration(sensor.id);
        }
      } catch (error) {
        // Ignore recovery errors
      }
    }
    
    this.emit('automaticRecoveryAttempted');
  }
}