/**
 * P-System integration for sensorimotor data
 * Handles mapping between sensorimotor data and cognitive memory systems
 */

import { EventEmitter } from 'events';
import { PSytemIntegrator } from '../interfaces/embodiment-interface';
import { 
  SensorData, 
  MotorCommand, 
  SensorimotorMemoryEntry,
  SensorType,
  MotorType 
} from '../types/sensorimotor-types';

export class PSytemIntegrationEngine extends EventEmitter implements PSytemIntegrator {
  private memoryBuffer: SensorimotorMemoryEntry[] = [];
  private associationMap: Map<string, string[]> = new Map();
  private contextHistory: string[] = [];
  private significanceThreshold: number = 0.1;
  
  constructor() {
    super();
  }

  async integratePerception(sensorData: SensorData[]): Promise<SensorimotorMemoryEntry> {
    const entry: SensorimotorMemoryEntry = {
      id: this.generateEntryId(),
      timestamp: Date.now(),
      sensorData: sensorData,
      context: this.deriveContext(sensorData),
      significance: this.calculateSignificance(sensorData),
      associations: this.findAssociations(sensorData)
    };
    
    // Store in memory buffer
    this.memoryBuffer.push(entry);
    
    // Maintain buffer size
    if (this.memoryBuffer.length > 1000) {
      this.memoryBuffer = this.memoryBuffer.slice(-1000);
    }
    
    // Update associations
    this.updateAssociations(entry);
    
    // Emit integration event
    this.emit('perceptionIntegrated', entry);
    
    return entry;
  }

  async generateAction(context: string, goal: string): Promise<MotorCommand[]> {
    // Find relevant memory entries
    const relevantMemories = await this.queryMemory(context);
    
    // Extract motor patterns from memories
    const motorPatterns = this.extractMotorPatterns(relevantMemories, goal);
    
    // Generate new motor commands based on patterns
    const commands = this.synthesizeMotorCommands(motorPatterns, goal);
    
    this.emit('actionGenerated', { context, goal, commands });
    
    return commands;
  }

  async updateMemory(entry: SensorimotorMemoryEntry): Promise<void> {
    // Find existing entry
    const existingIndex = this.memoryBuffer.findIndex(e => e.id === entry.id);
    
    if (existingIndex >= 0) {
      this.memoryBuffer[existingIndex] = entry;
    } else {
      this.memoryBuffer.push(entry);
    }
    
    // Update associations
    this.updateAssociations(entry);
    
    this.emit('memoryUpdated', entry);
  }

  async queryMemory(context: string): Promise<SensorimotorMemoryEntry[]> {
    const contextWords = context.toLowerCase().split(/\s+/);
    
    return this.memoryBuffer.filter(entry => {
      // Exact context match
      if (entry.context.toLowerCase().includes(context.toLowerCase())) {
        return true;
      }
      
      // Partial context match
      const entryWords = entry.context.toLowerCase().split(/\s+/);
      const overlap = contextWords.filter(word => entryWords.includes(word));
      return overlap.length > 0;
    }).sort((a, b) => {
      // Sort by significance and recency
      const aScore = a.significance * (1 + (Date.now() - a.timestamp) / (1000 * 60 * 60 * 24));
      const bScore = b.significance * (1 + (Date.now() - b.timestamp) / (1000 * 60 * 60 * 24));
      return bScore - aScore;
    });
  }

  async mapSensorToMemory(data: SensorData): Promise<any> {
    // Convert sensor data to cognitive representation
    const cognitiveRepresentation = {
      sensoryModality: data.type,
      intensity: this.extractIntensity(data),
      spatialLocation: this.extractSpatialInfo(data),
      temporalPattern: this.extractTemporalPattern(data),
      features: this.extractFeatures(data),
      semanticTags: this.generateSemanticTags(data)
    };
    
    return cognitiveRepresentation;
  }

  async mapMemoryToMotor(memoryEntry: any): Promise<MotorCommand[]> {
    // Extract motor-relevant information from memory
    const motorRelevantInfo = this.extractMotorRelevantInfo(memoryEntry);
    
    // Generate motor commands
    const commands: MotorCommand[] = [];
    
    for (const info of motorRelevantInfo) {
      const command: MotorCommand = {
        timestamp: Date.now(),
        source: 'p-system-integrator',
        type: info.motorType,
        target: info.target,
        priority: info.priority || 0.5,
        quality: {
          reliability: 0.8,
          latency: 0,
          completeness: 1.0,
          errorFlags: []
        }
      };
      
      commands.push(command);
    }
    
    return commands;
  }

  // Private helper methods

  private generateEntryId(): string {
    return `psys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private deriveContext(sensorData: SensorData[]): string {
    // Analyze sensor data to derive contextual meaning
    const contexts: string[] = [];
    
    for (const data of sensorData) {
      switch (data.type) {
        case 'visual':
          contexts.push('visual_perception');
          break;
        case 'auditory':
          contexts.push('auditory_perception');
          break;
        case 'tactile':
          contexts.push('tactile_interaction');
          break;
        case 'position':
          contexts.push('spatial_awareness');
          break;
        case 'velocity':
          contexts.push('motion_detection');
          break;
        default:
          contexts.push(`${data.type}_sensing`);
      }
    }
    
    return contexts.join(', ');
  }

  private calculateSignificance(sensorData: SensorData[]): number {
    let significance = 0;
    
    for (const data of sensorData) {
      // Base significance on data quality and novelty
      const qualityFactor = data.quality.reliability * data.quality.completeness;
      const noveltyFactor = this.calculateNovelty(data);
      const intensityFactor = this.extractIntensity(data);
      
      significance += qualityFactor * noveltyFactor * intensityFactor;
    }
    
    return Math.min(1.0, significance / sensorData.length);
  }

  private findAssociations(sensorData: SensorData[]): string[] {
    const associations: string[] = [];
    
    // Find temporal associations (recent memories)
    const recentMemories = this.memoryBuffer
      .filter(entry => Date.now() - entry.timestamp < 60000) // Last minute
      .slice(-10); // Last 10 entries
    
    associations.push(...recentMemories.map(entry => entry.id));
    
    // Find semantic associations based on sensor types
    const sensorTypes = sensorData.map(data => data.type);
    const semanticMatches = this.memoryBuffer.filter(entry => 
      entry.sensorData?.some(sensor => sensorTypes.includes(sensor.type))
    );
    
    associations.push(...semanticMatches.map(entry => entry.id));
    
    return Array.from(new Set(associations)); // Remove duplicates
  }

  private updateAssociations(entry: SensorimotorMemoryEntry): void {
    this.associationMap.set(entry.id, entry.associations);
    
    // Update bidirectional associations
    for (const associatedId of entry.associations) {
      const existing = this.associationMap.get(associatedId) || [];
      if (!existing.includes(entry.id)) {
        existing.push(entry.id);
        this.associationMap.set(associatedId, existing);
      }
    }
  }

  private extractMotorPatterns(memories: SensorimotorMemoryEntry[], goal: string): any[] {
    const patterns: any[] = [];
    
    for (const memory of memories) {
      if (memory.motorCommands) {
        for (const command of memory.motorCommands) {
          patterns.push({
            type: command.type,
            target: command.target,
            context: memory.context,
            success: true // Assume successful if stored in memory
          });
        }
      }
    }
    
    return patterns;
  }

  private synthesizeMotorCommands(patterns: any[], goal: string): MotorCommand[] {
    // Simple synthesis based on most common patterns
    const commandCounts = new Map<string, number>();
    
    for (const pattern of patterns) {
      const key = `${pattern.type}_${JSON.stringify(pattern.target)}`;
      commandCounts.set(key, (commandCounts.get(key) || 0) + 1);
    }
    
    // Select most frequent patterns
    const sortedPatterns = Array.from(commandCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3); // Top 3 patterns
    
    return sortedPatterns.map(([key, count]) => {
      const pattern = patterns.find(p => `${p.type}_${JSON.stringify(p.target)}` === key);
      return {
        timestamp: Date.now(),
        source: 'p-system-synthesis',
        type: pattern.type,
        target: pattern.target,
        priority: count / patterns.length,
        quality: {
          reliability: 0.7,
          latency: 0,
          completeness: 1.0,
          errorFlags: []
        }
      };
    });
  }

  private calculateNovelty(data: SensorData): number {
    // Simple novelty calculation based on recent similar data
    const similar = this.memoryBuffer.filter(entry => 
      entry.sensorData?.some(sensor => 
        sensor.type === data.type && 
        Date.now() - sensor.timestamp < 300000 // Last 5 minutes
      )
    );
    
    return Math.max(0.1, 1.0 - (similar.length / 10)); // More similar = less novel
  }

  private extractIntensity(data: SensorData): number {
    // Extract intensity/magnitude from sensor value
    if (typeof data.value === 'number') {
      return Math.min(1.0, Math.abs(data.value) / 100); // Normalize
    } else if (Array.isArray(data.value)) {
      const magnitude = Math.sqrt(data.value.reduce((sum, val) => sum + val * val, 0));
      return Math.min(1.0, magnitude / 100);
    }
    return 0.5; // Default intensity for non-numeric values
  }

  private extractSpatialInfo(data: SensorData): any {
    if (data.type === 'position' || data.type === 'orientation') {
      return data.value;
    }
    return null;
  }

  private extractTemporalPattern(data: SensorData): any {
    // Extract temporal patterns (would need more sophisticated analysis)
    return {
      timestamp: data.timestamp,
      frequency: data.quality.latency > 0 ? 1000 / data.quality.latency : 0
    };
  }

  private extractFeatures(data: SensorData): any {
    // Extract relevant features based on sensor type
    const features: any = {
      type: data.type,
      quality: data.quality,
      source: data.source
    };
    
    if (data.type === 'visual' && typeof data.value === 'object') {
      // Extract visual features (simplified)
      features.visualFeatures = 'detected';
    } else if (data.type === 'auditory' && typeof data.value === 'object') {
      // Extract auditory features (simplified)
      features.audioFeatures = 'detected';
    }
    
    return features;
  }

  private generateSemanticTags(data: SensorData): string[] {
    const tags: string[] = [data.type];
    
    // Add quality-based tags
    if (data.quality.reliability > 0.8) {
      tags.push('high_quality');
    }
    if (data.quality.latency < 50) {
      tags.push('low_latency');
    }
    
    // Add value-based tags
    if (typeof data.value === 'number') {
      if (data.value > 0) tags.push('positive');
      if (data.value < 0) tags.push('negative');
      if (Math.abs(data.value) > 50) tags.push('high_magnitude');
    }
    
    return tags;
  }

  private extractMotorRelevantInfo(memoryEntry: any): any[] {
    // Extract information relevant for motor commands
    const motorInfo: any[] = [];
    
    if (memoryEntry.spatialLocation) {
      motorInfo.push({
        motorType: 'position' as MotorType,
        target: { position: memoryEntry.spatialLocation },
        priority: 0.7
      });
    }
    
    if (memoryEntry.features?.visualFeatures) {
      motorInfo.push({
        motorType: 'display' as MotorType,
        target: { display: { content: 'visual_response' } },
        priority: 0.5
      });
    }
    
    return motorInfo;
  }
}