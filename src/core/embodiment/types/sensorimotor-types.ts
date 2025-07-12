/**
 * Sensorimotor data types for embodiment integration
 * Defines interfaces for sensor data input and motor control output
 */

// Base interface for all sensorimotor data
export interface SensorimotorData {
  timestamp: number;
  source: string;
  quality: DataQuality;
  metadata?: Record<string, any>;
}

// Data quality metrics for self-diagnosis
export interface DataQuality {
  reliability: number; // 0-1 scale
  latency: number; // milliseconds
  completeness: number; // 0-1 scale, percentage of expected data received
  errorFlags: string[];
}

// Sensor data interfaces
export interface SensorData extends SensorimotorData {
  type: SensorType;
  value: SensorValue;
  calibration?: CalibrationData;
}

export type SensorType = 
  | 'visual'
  | 'auditory' 
  | 'tactile'
  | 'proprioceptive'
  | 'vestibular'
  | 'temperature'
  | 'pressure'
  | 'position'
  | 'orientation'
  | 'velocity'
  | 'acceleration'
  | 'force'
  | 'proximity'
  | 'chemical'
  | 'custom';

export type SensorValue = 
  | number
  | number[]
  | string
  | boolean
  | ImageData
  | AudioData
  | PointCloud
  | Transform3D;

// Specialized sensor data types
export interface ImageData {
  width: number;
  height: number;
  channels: number;
  data: Uint8Array | Float32Array;
  format: 'rgb' | 'rgba' | 'grayscale' | 'depth';
}

export interface AudioData {
  sampleRate: number;
  channels: number;
  samples: Float32Array;
  duration: number;
}

export interface PointCloud {
  points: Float32Array; // x,y,z coordinates
  colors?: Uint8Array; // r,g,b values
  normals?: Float32Array; // normal vectors
  count: number;
}

export interface Transform3D {
  position: [number, number, number];
  rotation: [number, number, number, number]; // quaternion
  scale?: [number, number, number];
}

// Motor control interfaces
export interface MotorCommand extends SensorimotorData {
  type: MotorType;
  target: MotorTarget;
  priority: number; // 0-1 scale
  duration?: number; // milliseconds
  constraints?: MotorConstraints;
}

export type MotorType =
  | 'joint'
  | 'linear'
  | 'rotational'
  | 'gripper'
  | 'locomotion'
  | 'expression'
  | 'voice'
  | 'display'
  | 'custom';

export interface MotorTarget {
  position?: number | number[];
  velocity?: number | number[];
  force?: number | number[];
  torque?: number | number[];
  angle?: number | number[];
  expression?: ExpressionData;
  speech?: SpeechData;
  display?: DisplayData;
}

export interface MotorConstraints {
  maxVelocity?: number;
  maxAcceleration?: number;
  maxForce?: number;
  jointLimits?: [number, number];
  collisionAvoidance?: boolean;
}

// Specialized motor data types
export interface ExpressionData {
  type: 'facial' | 'gestural' | 'postural';
  parameters: Record<string, number>;
  intensity: number; // 0-1 scale
}

export interface SpeechData {
  text?: string;
  phonemes?: string[];
  pitch?: number;
  volume?: number;
  rate?: number;
  emotion?: string;
}

export interface DisplayData {
  content: string | ImageData;
  position?: [number, number];
  size?: [number, number];
  style?: Record<string, any>;
}

// Calibration and configuration
export interface CalibrationData {
  offset: number | number[];
  scale: number | number[];
  matrix?: number[][];
  lastCalibrated: number;
  isValid: boolean;
}

// Embodiment configuration
export interface EmbodimentConfig {
  sensors: SensorConfig[];
  motors: MotorConfig[];
  updateRate: number; // Hz
  bufferSize: number;
  timeout: number; // milliseconds
  errorHandling: ErrorHandlingConfig;
}

export interface SensorConfig {
  id: string;
  type: SensorType;
  enabled: boolean;
  frequency: number; // Hz
  precision: number;
  range?: [number, number];
  calibration?: CalibrationData;
}

export interface MotorConfig {
  id: string;
  type: MotorType;
  enabled: boolean;
  maxSpeed: number;
  maxForce: number;
  range?: [number, number];
  safetyLimits: MotorConstraints;
}

export interface ErrorHandlingConfig {
  retryAttempts: number;
  timeoutHandling: 'ignore' | 'interpolate' | 'error';
  dataLossThreshold: number; // percentage
  latencyThreshold: number; // milliseconds
}

// Integration with P-System
export interface SensorimotorMemoryEntry {
  id: string;
  timestamp: number;
  sensorData?: SensorData[];
  motorCommands?: MotorCommand[];
  context: string;
  significance: number; // 0-1 scale for memory importance
  associations: string[]; // links to other memory entries
}

// Meta-cognitive monitoring
export interface SensorimotorDiagnostics {
  overallHealth: number; // 0-1 scale
  sensorHealth: Record<string, SensorHealth>;
  motorHealth: Record<string, MotorHealth>;
  integrationHealth: IntegrationHealth;
  lastUpdate: number;
}

export interface SensorHealth {
  isOnline: boolean;
  dataRate: number; // actual vs expected
  errorRate: number;
  averageLatency: number;
  lastReading: number;
  calibrationStatus: 'valid' | 'expired' | 'invalid';
}

export interface MotorHealth {
  isOnline: boolean;
  commandRate: number;
  errorRate: number;
  averageResponseTime: number;
  lastCommand: number;
  safetyStatus: 'safe' | 'warning' | 'error';
}

export interface IntegrationHealth {
  memoryIntegrationRate: number;
  processingLatency: number;
  dataLossRate: number;
  cognitiveLoad: number; // 0-1 scale
  errors: IntegrationError[];
}

export interface IntegrationError {
  type: 'sensor_timeout' | 'motor_failure' | 'memory_overflow' | 'processing_delay' | 'calibration_error';
  message: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
}