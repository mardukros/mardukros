/**
 * Central embodiment manager that orchestrates all sensorimotor components
 */

import { EventEmitter } from 'events';
import { 
  EmbodimentManager,
  SensorInterface,
  MotorInterface,
  PSytemIntegrator,
  MetaCognitiveMonitor,
  EmbodimentComponent 
} from './interfaces/embodiment-interface';
import { 
  EmbodimentConfig,
  SensorData,
  MotorCommand,
  SensorimotorDiagnostics 
} from './types/sensorimotor-types';

export class SensorimotorManager extends EventEmitter implements EmbodimentManager {
  public readonly config: EmbodimentConfig;
  
  private sensors: Map<string, SensorInterface> = new Map();
  private motors: Map<string, MotorInterface> = new Map();
  private psystemIntegrator?: PSytemIntegrator;
  private metaMonitor?: MetaCognitiveMonitor;
  
  private isProcessing: boolean = false;
  private processingInterval?: NodeJS.Timeout;
  private perceptionBuffer: SensorData[] = [];
  private actionQueue: MotorCommand[] = [];
  
  private readonly PROCESSING_INTERVAL = 100; // 10 Hz processing rate
  private readonly BUFFER_SIZE = 1000;

  constructor(config: EmbodimentConfig) {
    super();
    this.config = config;
  }

  async initialize(config: EmbodimentConfig): Promise<void> {
    try {
      // Initialize all configured sensors
      for (const sensorConfig of config.sensors) {
        if (sensorConfig.enabled) {
          // Create sensor from config (would need sensor factory)
          const sensor = await this.createSensorFromConfig(sensorConfig);
          await this.registerSensor(sensor);
        }
      }

      // Initialize all configured motors
      for (const motorConfig of config.motors) {
        if (motorConfig.enabled) {
          // Create motor from config (would need motor factory)
          const motor = await this.createMotorFromConfig(motorConfig);
          await this.registerMotor(motor);
        }
      }

      // Register all components with meta monitor
      if (this.metaMonitor) {
        for (const sensor of Array.from(this.sensors.values())) {
          this.metaMonitor.registerComponent(sensor);
        }
        for (const motor of Array.from(this.motors.values())) {
          this.metaMonitor.registerComponent(motor);
        }
      }

      this.emit('initialized');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    try {
      // Stop processing
      if (this.isProcessing) {
        await this.stopProcessing();
      }

      // Shutdown all sensors
      for (const sensor of Array.from(this.sensors.values())) {
        await sensor.shutdown();
      }

      // Shutdown all motors
      for (const motor of Array.from(this.motors.values())) {
        await motor.shutdown();
      }

      // Stop meta monitoring
      if (this.metaMonitor) {
        await this.metaMonitor.stopMonitoring();
      }

      this.sensors.clear();
      this.motors.clear();
      this.perceptionBuffer = [];
      this.actionQueue = [];

      this.emit('shutdown');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async registerSensor(sensor: SensorInterface): Promise<void> {
    try {
      await sensor.initialize();
      this.sensors.set(sensor.id, sensor);

      // Set up event handlers
      sensor.onDataReceived((data: SensorData) => {
        this.handleSensorData(data);
      });

      sensor.onError((error: Error) => {
        this.emit('sensorError', sensor.id, error);
      });

      // Register with meta monitor
      if (this.metaMonitor) {
        this.metaMonitor.registerComponent(sensor);
      }

      this.emit('sensorRegistered', sensor.id);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async registerMotor(motor: MotorInterface): Promise<void> {
    try {
      await motor.initialize();
      this.motors.set(motor.id, motor);

      // Set up event handlers
      motor.onCommandComplete((commandId: string) => {
        this.emit('actionCompleted', motor.id, commandId);
      });

      motor.onCommandFailed((commandId: string, error: Error) => {
        this.emit('actionFailed', motor.id, commandId, error);
      });

      // Register with meta monitor
      if (this.metaMonitor) {
        this.metaMonitor.registerComponent(motor);
      }

      this.emit('motorRegistered', motor.id);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async unregisterComponent(componentId: string): Promise<void> {
    const sensor = this.sensors.get(componentId);
    const motor = this.motors.get(componentId);

    if (sensor) {
      await sensor.shutdown();
      this.sensors.delete(componentId);
      if (this.metaMonitor) {
        this.metaMonitor.unregisterComponent(componentId);
      }
      this.emit('sensorUnregistered', componentId);
    } else if (motor) {
      await motor.shutdown();
      this.motors.delete(componentId);
      if (this.metaMonitor) {
        this.metaMonitor.unregisterComponent(componentId);
      }
      this.emit('motorUnregistered', componentId);
    }
  }

  async startProcessing(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    // Start all sensors
    for (const sensor of Array.from(this.sensors.values())) {
      await sensor.startSensing();
    }

    // Start processing loop
    this.processingInterval = setInterval(
      () => this.performProcessingCycle(),
      this.PROCESSING_INTERVAL
    );

    // Start meta monitoring
    if (this.metaMonitor) {
      await this.metaMonitor.startMonitoring();
    }

    this.emit('processingStarted');
  }

  async stopProcessing(): Promise<void> {
    this.isProcessing = false;

    // Stop processing loop
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = undefined;
    }

    // Stop all sensors
    for (const sensor of Array.from(this.sensors.values())) {
      await sensor.stopSensing();
    }

    // Stop all motors
    for (const motor of Array.from(this.motors.values())) {
      await motor.stop();
    }

    // Stop meta monitoring
    if (this.metaMonitor) {
      await this.metaMonitor.stopMonitoring();
    }

    this.emit('processingStopped');
  }

  async processPerceptionCycle(): Promise<void> {
    if (this.perceptionBuffer.length === 0) {
      return;
    }

    try {
      // Get current sensor data from buffer
      const currentPerceptions = [...this.perceptionBuffer];
      this.perceptionBuffer = []; // Clear buffer

      // Integrate with P-System if available
      if (this.psystemIntegrator) {
        const memoryEntry = await this.psystemIntegrator.integratePerception(currentPerceptions);
        this.emit('perceptionIntegrated', memoryEntry);
      }

      this.emit('perceptionProcessed', currentPerceptions);
    } catch (error) {
      this.emit('error', error);
    }
  }

  async processActionCycle(): Promise<void> {
    if (this.actionQueue.length === 0) {
      return;
    }

    try {
      // Execute queued actions
      const actionsToExecute = this.actionQueue.splice(0, 10); // Execute up to 10 actions per cycle

      for (const action of actionsToExecute) {
        const motor = this.findMotorForAction(action);
        if (motor) {
          await motor.executeCommand(action);
          this.emit('actionExecuted', action);
        } else {
          this.emit('actionFailed', action, new Error(`No motor available for action type: ${action.type}`));
        }
      }
    } catch (error) {
      this.emit('error', error);
    }
  }

  setPSystemIntegrator(integrator: PSytemIntegrator): void {
    this.psystemIntegrator = integrator;
    this.emit('psystemIntegratorSet');
  }

  setMetaCognitiveMonitor(monitor: MetaCognitiveMonitor): void {
    this.metaMonitor = monitor;
    
    // Register existing components
    for (const sensor of Array.from(this.sensors.values())) {
      monitor.registerComponent(sensor);
    }
    for (const motor of Array.from(this.motors.values())) {
      monitor.registerComponent(motor);
    }
    
    this.emit('metaMonitorSet');
  }

  async getSystemHealth(): Promise<SensorimotorDiagnostics> {
    if (this.metaMonitor) {
      return await this.metaMonitor.getDiagnostics();
    }

    // Fallback: simple health calculation
    const sensorHealth: any = {};
    const motorHealth: any = {};

    for (const [id, sensor] of Array.from(this.sensors.entries())) {
      try {
        const health = await sensor.getHealth();
        sensorHealth[id] = {
          isOnline: sensor.isEnabled,
          dataRate: 1.0,
          errorRate: 0,
          averageLatency: 0,
          lastReading: Date.now(),
          calibrationStatus: 'valid'
        };
      } catch (error) {
        sensorHealth[id] = {
          isOnline: false,
          dataRate: 0,
          errorRate: 1,
          averageLatency: 0,
          lastReading: 0,
          calibrationStatus: 'invalid'
        };
      }
    }

    for (const [id, motor] of Array.from(this.motors.entries())) {
      try {
        const health = await motor.getHealth();
        motorHealth[id] = {
          isOnline: motor.isEnabled,
          commandRate: 1.0,
          errorRate: 0,
          averageResponseTime: 0,
          lastCommand: Date.now(),
          safetyStatus: 'safe'
        };
      } catch (error) {
        motorHealth[id] = {
          isOnline: false,
          commandRate: 0,
          errorRate: 1,
          averageResponseTime: 0,
          lastCommand: 0,
          safetyStatus: 'error'
        };
      }
    }

    return {
      overallHealth: 0.8, // Default health
      sensorHealth,
      motorHealth,
      integrationHealth: {
        memoryIntegrationRate: 0.9,
        processingLatency: 50,
        dataLossRate: 0.02,
        cognitiveLoad: 0.3,
        errors: []
      },
      lastUpdate: Date.now()
    };
  }

  async getActiveComponents(): Promise<EmbodimentComponent[]> {
    const components: EmbodimentComponent[] = [];
    components.push(...Array.from(this.sensors.values()));
    components.push(...Array.from(this.motors.values()));
    return components;
  }

  onPerceptionUpdate(callback: (data: SensorData[]) => void): void {
    this.on('perceptionUpdate', callback);
  }

  onActionRequired(callback: (commands: MotorCommand[]) => void): void {
    this.on('actionRequired', callback);
  }

  onSystemError(callback: (error: Error) => void): void {
    this.on('error', callback);
  }

  // Add action to queue for execution
  queueAction(command: MotorCommand): void {
    this.actionQueue.push(command);
    
    // Maintain queue size
    if (this.actionQueue.length > this.BUFFER_SIZE) {
      this.actionQueue = this.actionQueue.slice(-this.BUFFER_SIZE);
    }
    
    this.emit('actionQueued', command);
  }

  // Generate actions based on current context
  async generateContextualActions(context: string, goal: string): Promise<MotorCommand[]> {
    if (this.psystemIntegrator) {
      const actions = await this.psystemIntegrator.generateAction(context, goal);
      
      // Queue the generated actions
      for (const action of actions) {
        this.queueAction(action);
      }
      
      this.emit('actionsGenerated', actions);
      return actions;
    }
    
    return [];
  }

  // Private helper methods

  private async performProcessingCycle(): Promise<void> {
    try {
      await this.processPerceptionCycle();
      await this.processActionCycle();
    } catch (error) {
      this.emit('error', error);
    }
  }

  private handleSensorData(data: SensorData): void {
    // Add to perception buffer
    this.perceptionBuffer.push(data);
    
    // Maintain buffer size
    if (this.perceptionBuffer.length > this.BUFFER_SIZE) {
      this.perceptionBuffer = this.perceptionBuffer.slice(-this.BUFFER_SIZE);
    }
    
    this.emit('sensorDataReceived', data);
    
    // Trigger perception update event periodically
    if (this.perceptionBuffer.length % 10 === 0) {
      this.emit('perceptionUpdate', [...this.perceptionBuffer]);
    }
  }

  private findMotorForAction(action: MotorCommand): MotorInterface | undefined {
    // Find a motor that can handle this action type
    for (const motor of Array.from(this.motors.values())) {
      if (motor.motorType === action.type) {
        return motor;
      }
    }
    
    // Fallback: find any enabled motor
    for (const motor of Array.from(this.motors.values())) {
      if (motor.isEnabled) {
        return motor;
      }
    }
    
    return undefined;
  }

  private async createSensorFromConfig(config: any): Promise<SensorInterface> {
    // This would be implemented with a sensor factory
    // For now, return a mock sensor interface
    throw new Error('Sensor factory not implemented');
  }

  private async createMotorFromConfig(config: any): Promise<MotorInterface> {
    // This would be implemented with a motor factory
    // For now, return a mock motor interface
    throw new Error('Motor factory not implemented');
  }
}