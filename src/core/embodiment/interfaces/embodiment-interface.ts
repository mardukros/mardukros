/**
 * Core embodiment interfaces for sensorimotor data integration
 */

import { 
  SensorData, 
  MotorCommand, 
  EmbodimentConfig,
  SensorimotorDiagnostics,
  SensorimotorMemoryEntry 
} from '../types/sensorimotor-types.js';

/**
 * Base interface for all embodiment components
 */
export interface EmbodimentComponent {
  readonly id: string;
  readonly type: string;
  isEnabled: boolean;
  
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  getHealth(): Promise<any>;
  configure(config: any): Promise<void>;
}

/**
 * Sensor interface for data ingestion
 */
export interface SensorInterface extends EmbodimentComponent {
  readonly sensorType: string;
  
  startSensing(): Promise<void>;
  stopSensing(): Promise<void>;
  readSensor(): Promise<SensorData>;
  calibrate(): Promise<boolean>;
  
  // Event-based data streaming
  onDataReceived(callback: (data: SensorData) => void): void;
  onError(callback: (error: Error) => void): void;
}

/**
 * Motor interface for action output
 */
export interface MotorInterface extends EmbodimentComponent {
  readonly motorType: string;
  
  executeCommand(command: MotorCommand): Promise<boolean>;
  getStatus(): Promise<any>;
  stop(): Promise<void>;
  setConstraints(constraints: any): Promise<void>;
  
  // Event-based command feedback
  onCommandComplete(callback: (commandId: string) => void): void;
  onCommandFailed(callback: (commandId: string, error: Error) => void): void;
}

/**
 * P-System integration interface for cognitive grounding
 */
export interface PSytemIntegrator {
  integratePerception(sensorData: SensorData[]): Promise<SensorimotorMemoryEntry>;
  generateAction(context: string, goal: string): Promise<MotorCommand[]>;
  updateMemory(entry: SensorimotorMemoryEntry): Promise<void>;
  queryMemory(context: string): Promise<SensorimotorMemoryEntry[]>;
  
  // Cognitive mapping
  mapSensorToMemory(data: SensorData): Promise<any>;
  mapMemoryToMotor(memoryEntry: any): Promise<MotorCommand[]>;
}

/**
 * Meta-cognitive monitoring interface
 */
export interface MetaCognitiveMonitor {
  startMonitoring(): Promise<void>;
  stopMonitoring(): Promise<void>;
  getDiagnostics(): Promise<SensorimotorDiagnostics>;
  
  // Self-diagnosis capabilities
  detectLatencyIssues(): Promise<boolean>;
  detectDataLoss(): Promise<boolean>;
  detectIntegrationErrors(): Promise<boolean>;
  
  // Self-repair capabilities
  attemptCalibration(sensorId: string): Promise<boolean>;
  attemptReconnection(componentId: string): Promise<boolean>;
  optimizeDataFlow(): Promise<void>;
  
  // Component registration
  registerComponent(component: any): void;
  unregisterComponent(componentId: string): void;
}

/**
 * Embodiment manager interface - orchestrates all components
 */
export interface EmbodimentManager {
  readonly config: EmbodimentConfig;
  
  initialize(config: EmbodimentConfig): Promise<void>;
  shutdown(): Promise<void>;
  
  // Component management
  registerSensor(sensor: SensorInterface): Promise<void>;
  registerMotor(motor: MotorInterface): Promise<void>;
  unregisterComponent(componentId: string): Promise<void>;
  
  // Data processing
  startProcessing(): Promise<void>;
  stopProcessing(): Promise<void>;
  processPerceptionCycle(): Promise<void>;
  processActionCycle(): Promise<void>;
  
  // Integration
  setPSystemIntegrator(integrator: PSytemIntegrator): void;
  setMetaCognitiveMonitor(monitor: MetaCognitiveMonitor): void;
  
  // Status and diagnostics
  getSystemHealth(): Promise<SensorimotorDiagnostics>;
  getActiveComponents(): Promise<EmbodimentComponent[]>;
  
  // Event handlers
  onPerceptionUpdate(callback: (data: SensorData[]) => void): void;
  onActionRequired(callback: (commands: MotorCommand[]) => void): void;
  onSystemError(callback: (error: Error) => void): void;
}

/**
 * Simulation interface for testing
 */
export interface SimulationInterface {
  createVirtualEnvironment(config: any): Promise<void>;
  addVirtualSensor(type: string, config: any): Promise<SensorInterface>;
  addVirtualMotor(type: string, config: any): Promise<MotorInterface>;
  
  startSimulation(): Promise<void>;
  stopSimulation(): Promise<void>;
  stepSimulation(deltaTime: number): Promise<void>;
  
  // Scenario testing
  loadScenario(scenarioId: string): Promise<void>;
  generateRandomStimuli(): Promise<SensorData[]>;
  validateBehavior(expected: any, actual: any): Promise<boolean>;
}