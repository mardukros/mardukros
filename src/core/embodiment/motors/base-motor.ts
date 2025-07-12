/**
 * Base motor implementation with common functionality
 */

import { EventEmitter } from 'events';
import { 
  MotorInterface, 
  EmbodimentComponent 
} from '../interfaces/embodiment-interface';
import { 
  MotorCommand, 
  MotorType, 
  MotorConstraints,
  DataQuality 
} from '../types/sensorimotor-types';

export abstract class BaseMotor extends EventEmitter implements MotorInterface {
  public readonly id: string;
  public readonly type: string = 'motor';
  public readonly motorType: string;
  public isEnabled: boolean = false;
  
  protected constraints?: MotorConstraints;
  protected currentCommand?: MotorCommand;
  protected commandQueue: MotorCommand[] = [];
  protected errorCount: number = 0;
  protected isExecuting: boolean = false;
  
  constructor(id: string, motorType: MotorType) {
    super();
    this.id = id;
    this.motorType = motorType;
  }

  async initialize(): Promise<void> {
    try {
      await this.initializeMotor();
      this.isEnabled = true;
      this.emit('initialized', this.id);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    try {
      if (this.isExecuting) {
        await this.stop();
      }
      await this.shutdownMotor();
      this.isEnabled = false;
      this.emit('shutdown', this.id);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async executeCommand(command: MotorCommand): Promise<boolean> {
    if (!this.isEnabled) {
      throw new Error(`Motor ${this.id} is not initialized`);
    }
    
    // Validate command against constraints
    if (!this.validateCommand(command)) {
      this.emit('commandFailed', command.source, new Error('Command violates safety constraints'));
      return false;
    }
    
    try {
      // Add quality metrics to command
      const enhancedCommand: MotorCommand = {
        ...command,
        quality: this.calculateCommandQuality(command)
      };
      
      this.currentCommand = enhancedCommand;
      this.isExecuting = true;
      
      const success = await this.executeMotorCommand(enhancedCommand);
      
      if (success) {
        this.emit('commandComplete', command.source);
      } else {
        this.emit('commandFailed', command.source, new Error('Command execution failed'));
      }
      
      this.isExecuting = false;
      this.currentCommand = undefined;
      
      return success;
    } catch (error) {
      this.errorCount++;
      this.isExecuting = false;
      this.currentCommand = undefined;
      this.emit('commandFailed', command.source, error);
      throw error;
    }
  }

  async getStatus(): Promise<any> {
    return {
      id: this.id,
      type: this.motorType,
      isEnabled: this.isEnabled,
      isExecuting: this.isExecuting,
      currentCommand: this.currentCommand,
      queueLength: this.commandQueue.length,
      errorCount: this.errorCount,
      position: await this.getCurrentPosition(),
      velocity: await this.getCurrentVelocity(),
      constraints: this.constraints
    };
  }

  async stop(): Promise<void> {
    try {
      await this.emergencyStop();
      this.isExecuting = false;
      this.currentCommand = undefined;
      this.commandQueue = [];
      this.emit('stopped', this.id);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async setConstraints(constraints: MotorConstraints): Promise<void> {
    this.constraints = constraints;
    await this.applyConstraints(constraints);
    this.emit('constraintsSet', this.id);
  }

  async getHealth(): Promise<any> {
    return {
      id: this.id,
      type: this.motorType,
      isEnabled: this.isEnabled,
      isExecuting: this.isExecuting,
      errorCount: this.errorCount,
      lastCommand: this.currentCommand?.timestamp,
      safetyStatus: this.getSafetyStatus(),
      temperature: await this.getTemperature(),
      position: await this.getCurrentPosition()
    };
  }

  async configure(config: any): Promise<void> {
    await this.applyMotorConfig(config);
    this.emit('configured', this.id);
  }

  onCommandComplete(callback: (commandId: string) => void): void {
    this.on('commandComplete', callback);
  }

  onCommandFailed(callback: (commandId: string, error: Error) => void): void {
    this.on('commandFailed', callback);
  }

  // Protected methods to be implemented by specific motors
  protected abstract initializeMotor(): Promise<void>;
  protected abstract shutdownMotor(): Promise<void>;
  protected abstract executeMotorCommand(command: MotorCommand): Promise<boolean>;
  protected abstract emergencyStop(): Promise<void>;
  protected abstract getCurrentPosition(): Promise<number | number[]>;
  protected abstract getCurrentVelocity(): Promise<number | number[]>;
  protected abstract getTemperature(): Promise<number>;
  protected abstract applyConstraints(constraints: MotorConstraints): Promise<void>;
  protected abstract applyMotorConfig(config: any): Promise<void>;

  private validateCommand(command: MotorCommand): boolean {
    if (!this.constraints) {
      return true; // No constraints set
    }
    
    // Check velocity constraints
    if (this.constraints.maxVelocity && command.target.velocity) {
      const velocity = Array.isArray(command.target.velocity) 
        ? Math.max(...command.target.velocity) 
        : command.target.velocity;
      if (velocity > this.constraints.maxVelocity) {
        return false;
      }
    }
    
    // Check force constraints
    if (this.constraints.maxForce && command.target.force) {
      const force = Array.isArray(command.target.force) 
        ? Math.max(...command.target.force) 
        : command.target.force;
      if (force > this.constraints.maxForce) {
        return false;
      }
    }
    
    // Check joint limits
    if (this.constraints.jointLimits && command.target.position) {
      const position = Array.isArray(command.target.position) 
        ? command.target.position[0] 
        : command.target.position;
      const [min, max] = this.constraints.jointLimits;
      if (position < min || position > max) {
        return false;
      }
    }
    
    return true;
  }

  private calculateCommandQuality(command: MotorCommand): DataQuality {
    const now = Date.now();
    const commandAge = now - command.timestamp;
    
    return {
      reliability: Math.max(0, 1 - (this.errorCount / 100)),
      latency: commandAge,
      completeness: 1.0, // Assume complete command
      errorFlags: this.errorCount > 0 ? [`${this.errorCount} errors`] : []
    };
  }

  private getSafetyStatus(): 'safe' | 'warning' | 'error' {
    if (this.errorCount > 10) {
      return 'error';
    } else if (this.errorCount > 5) {
      return 'warning';
    }
    return 'safe';
  }
}