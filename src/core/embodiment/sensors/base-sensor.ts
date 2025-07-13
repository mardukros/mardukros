/**
 * Base sensor implementation with common functionality
 */

import { EventEmitter } from 'events';
import { 
  SensorInterface, 
  EmbodimentComponent 
} from '../interfaces/embodiment-interface';
import { 
  SensorData, 
  SensorType, 
  DataQuality,
  CalibrationData 
} from '../types/sensorimotor-types';

export abstract class BaseSensor extends EventEmitter implements SensorInterface {
  public readonly id: string;
  public readonly type: string = 'sensor';
  public readonly sensorType: string;
  public isEnabled: boolean = false;
  
  protected calibrationData?: CalibrationData;
  protected lastReading?: SensorData;
  protected errorCount: number = 0;
  protected isReading: boolean = false;
  
  constructor(id: string, sensorType: SensorType) {
    super();
    this.id = id;
    this.sensorType = sensorType;
  }

  async initialize(): Promise<void> {
    try {
      await this.initializeSensor();
      this.isEnabled = true;
      this.emit('initialized', this.id);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    try {
      if (this.isReading) {
        await this.stopSensing();
      }
      await this.shutdownSensor();
      this.isEnabled = false;
      this.emit('shutdown', this.id);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async startSensing(): Promise<void> {
    if (!this.isEnabled) {
      throw new Error(`Sensor ${this.id} is not initialized`);
    }
    
    if (this.isReading) {
      return; // Already reading
    }
    
    this.isReading = true;
    await this.startReadingLoop();
    this.emit('sensing_started', this.id);
  }

  async stopSensing(): Promise<void> {
    this.isReading = false;
    await this.stopReadingLoop();
    this.emit('sensing_stopped', this.id);
  }

  async readSensor(): Promise<SensorData> {
    if (!this.isEnabled) {
      throw new Error(`Sensor ${this.id} is not initialized`);
    }
    
    try {
      const rawValue = await this.readRawValue();
      const processedValue = this.processValue(rawValue);
      
      const sensorData: SensorData = {
        timestamp: Date.now(),
        source: this.id,
        type: this.sensorType as SensorType,
        value: processedValue,
        quality: this.calculateDataQuality(),
        calibration: this.calibrationData,
        metadata: await this.getMetadata()
      };
      
      this.lastReading = sensorData;
      return sensorData;
    } catch (error) {
      this.errorCount++;
      this.emit('error', error);
      throw error;
    }
  }

  async calibrate(): Promise<boolean> {
    try {
      const calibrationResult = await this.performCalibration();
      if (calibrationResult) {
        this.calibrationData = {
          ...calibrationResult,
          lastCalibrated: Date.now(),
          isValid: true
        };
        this.emit('calibrated', this.id);
        return true;
      }
      return false;
    } catch (error) {
      this.emit('error', error);
      return false;
    }
  }

  async getHealth(): Promise<any> {
    return {
      id: this.id,
      type: this.sensorType,
      isEnabled: this.isEnabled,
      isReading: this.isReading,
      errorCount: this.errorCount,
      lastReading: this.lastReading?.timestamp,
      calibrationStatus: this.calibrationData?.isValid ? 'valid' : 'invalid',
      dataQuality: this.lastReading?.quality
    };
  }

  async configure(config: any): Promise<void> {
    await this.applySensorConfig(config);
    this.emit('configured', this.id);
  }

  onDataReceived(callback: (data: SensorData) => void): void {
    this.on('data', callback);
  }

  onError(callback: (error: Error) => void): void {
    this.on('error', callback);
  }

  // Protected methods to be implemented by specific sensors
  protected abstract initializeSensor(): Promise<void>;
  protected abstract shutdownSensor(): Promise<void>;
  protected abstract readRawValue(): Promise<any>;
  protected abstract processValue(rawValue: any): any;
  protected abstract performCalibration(): Promise<CalibrationData | null>;
  protected abstract applySensorConfig(config: any): Promise<void>;
  protected abstract getMetadata(): Promise<Record<string, any>>;

  private async startReadingLoop(): Promise<void> {
    while (this.isReading) {
      try {
        const data = await this.readSensor();
        this.emit('data', data);
        
        // Wait for next reading cycle
        await new Promise(resolve => setTimeout(resolve, this.getReadingInterval()));
      } catch (error) {
        this.emit('error', error);
        // Continue reading on error, but with exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, this.errorCount), 10000)));
      }
    }
  }

  private async stopReadingLoop(): Promise<void> {
    // Implementation depends on specific sensor type
    // Base implementation just sets the flag
  }

  private calculateDataQuality(): DataQuality {
    const now = Date.now();
    const lastTimestamp = this.lastReading?.timestamp || now;
    const latency = now - lastTimestamp;
    
    return {
      reliability: Math.max(0, 1 - (this.errorCount / 100)), // Reduce reliability with errors
      latency: latency,
      completeness: 1.0, // Assume complete data for base implementation
      errorFlags: this.errorCount > 0 ? [`${this.errorCount} errors`] : []
    };
  }

  private getReadingInterval(): number {
    // Default to 100ms, should be configurable per sensor
    return 100;
  }
}