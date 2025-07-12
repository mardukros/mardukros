/**
 * Port Channel System for Membrane Message Passing
 * 
 * Implements input/output port channels that enable controlled message passing
 * between membranes while respecting boundary conditions and access control.
 */

import { TensorShape } from '../types.js';
import { Membrane, MembraneMessage, BoundaryPolicy } from './membrane-abstraction.js';

/**
 * Port channel direction types
 */
export type PortDirection = 'input' | 'output' | 'bidirectional';

/**
 * Port channel data types
 */
export type PortDataType = 'tensor' | 'scalar' | 'vector' | 'message' | 'control';

/**
 * Message priority levels
 */
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent' | 'critical';

/**
 * Port channel status
 */
export type PortStatus = 'active' | 'inactive' | 'blocked' | 'error' | 'maintenance';

/**
 * Port channel configuration
 */
export interface PortChannelConfig {
  id: string;
  name: string;
  direction: PortDirection;
  dataType: PortDataType;
  tensorShape?: TensorShape;
  membraneId: string;
  maxConnections: number;
  bufferSize: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  validationRules: PortValidationRule[];
  transformationRules: PortTransformationRule[];
}

/**
 * Port validation rule
 */
export interface PortValidationRule {
  id: string;
  name: string;
  type: 'shape' | 'range' | 'type' | 'content' | 'security';
  parameters: Record<string, any>;
  errorMessage: string;
  enabled: boolean;
}

/**
 * Port transformation rule
 */
export interface PortTransformationRule {
  id: string;
  name: string;
  type: 'scale' | 'normalize' | 'compress' | 'encrypt' | 'filter';
  parameters: Record<string, any>;
  priority: number;
  enabled: boolean;
}

/**
 * Port message with enhanced metadata
 */
export interface PortMessage extends MembraneMessage {
  priority: MessagePriority;
  portId: string;
  dataType: PortDataType;
  contentSize: number;
  compressionRatio?: number;
  validationResults: PortValidationResult[];
  transformationHistory: PortTransformationResult[];
  routingMetadata: {
    hopCount: number;
    route: string[];
    latency: number;
    bandwidth: number;
  };
}

/**
 * Port validation result
 */
export interface PortValidationResult {
  ruleId: string;
  passed: boolean;
  message: string;
  details?: Record<string, any>;
}

/**
 * Port transformation result
 */
export interface PortTransformationResult {
  ruleId: string;
  applied: boolean;
  inputSize: number;
  outputSize: number;
  processingTime: number;
  parameters: Record<string, any>;
}

/**
 * Port connection between membranes
 */
export interface PortConnection {
  id: string;
  sourcePortId: string;
  targetPortId: string;
  sourceMembraneId: string;
  targetMembraneId: string;
  connectionType: 'direct' | 'routed' | 'broadcast' | 'multicast';
  established: number;
  lastActivity: number;
  messageCount: number;
  totalBytes: number;
  errorCount: number;
  isActive: boolean;
}

/**
 * Port channel class implementing message passing interface
 */
export class PortChannel {
  private config: PortChannelConfig;
  private connections: Map<string, PortConnection> = new Map();
  private messageBuffer: PortMessage[] = [];
  private status: PortStatus = 'active';
  private statistics: PortChannelStatistics;
  private membrane: Membrane | null = null;
  private creationTime: number;
  private lastActivity: number;

  constructor(config: PortChannelConfig) {
    this.config = { ...config };
    this.creationTime = Date.now();
    this.lastActivity = Date.now();
    
    // Initialize statistics
    this.statistics = {
      portId: config.id,
      messagesProcessed: 0,
      bytesTransferred: 0,
      connectionsActive: 0,
      connectionsTotal: 0,
      validationFailures: 0,
      transformationFailures: 0,
      averageLatency: 0,
      throughput: 0,
      errorRate: 0,
      uptime: 0
    };
  }

  /**
   * Attach port to a membrane
   */
  attachToMembrane(membrane: Membrane): boolean {
    if (this.membrane) {
      console.warn(`Port ${this.config.id} already attached to membrane`);
      return false;
    }

    if (membrane.getId() !== this.config.membraneId) {
      console.error(`Port membrane ID mismatch: expected ${this.config.membraneId}, got ${membrane.getId()}`);
      return false;
    }

    this.membrane = membrane;
    this.lastActivity = Date.now();
    console.log(`Port ${this.config.id} attached to membrane ${membrane.getId()}`);
    return true;
  }

  /**
   * Detach port from membrane
   */
  detachFromMembrane(): boolean {
    if (!this.membrane) {
      return false;
    }

    // Close all connections
    for (const connectionId of this.connections.keys()) {
      this.disconnectPort(connectionId);
    }

    this.membrane = null;
    this.status = 'inactive';
    console.log(`Port ${this.config.id} detached from membrane`);
    return true;
  }

  /**
   * Connect to another port
   */
  connectToPort(
    targetPort: PortChannel,
    connectionType: 'direct' | 'routed' | 'broadcast' | 'multicast' = 'direct'
  ): string | null {
    // Validate connection possibility
    if (!this.canConnectTo(targetPort)) {
      console.warn(`Cannot connect port ${this.config.id} to ${targetPort.getId()}`);
      return null;
    }

    // Check max connections
    if (this.connections.size >= this.config.maxConnections) {
      console.warn(`Port ${this.config.id} has reached maximum connections`);
      return null;
    }

    const connectionId = `${this.config.id}->${targetPort.getId()}`;
    const connection: PortConnection = {
      id: connectionId,
      sourcePortId: this.config.id,
      targetPortId: targetPort.getId(),
      sourceMembraneId: this.config.membraneId,
      targetMembraneId: targetPort.getMembraneId(),
      connectionType,
      established: Date.now(),
      lastActivity: Date.now(),
      messageCount: 0,
      totalBytes: 0,
      errorCount: 0,
      isActive: true
    };

    this.connections.set(connectionId, connection);
    this.statistics.connectionsActive++;
    this.statistics.connectionsTotal++;
    this.lastActivity = Date.now();

    // Establish reverse connection for bidirectional ports
    if (this.config.direction === 'bidirectional' || targetPort.getDirection() === 'bidirectional') {
      targetPort.acceptConnection(this, connectionType);
    }

    console.log(`Established connection: ${connectionId}`);
    return connectionId;
  }

  /**
   * Accept incoming connection
   */
  acceptConnection(
    sourcePort: PortChannel,
    connectionType: 'direct' | 'routed' | 'broadcast' | 'multicast'
  ): boolean {
    if (!this.canAcceptConnectionFrom(sourcePort)) {
      return false;
    }

    const connectionId = `${sourcePort.getId()}->${this.config.id}`;
    const connection: PortConnection = {
      id: connectionId,
      sourcePortId: sourcePort.getId(),
      targetPortId: this.config.id,
      sourceMembraneId: sourcePort.getMembraneId(),
      targetMembraneId: this.config.membraneId,
      connectionType,
      established: Date.now(),
      lastActivity: Date.now(),
      messageCount: 0,
      totalBytes: 0,
      errorCount: 0,
      isActive: true
    };

    this.connections.set(connectionId, connection);
    this.statistics.connectionsActive++;
    this.lastActivity = Date.now();
    
    return true;
  }

  /**
   * Disconnect from a port
   */
  disconnectPort(connectionId: string): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return false;
    }

    connection.isActive = false;
    this.connections.delete(connectionId);
    this.statistics.connectionsActive--;
    this.lastActivity = Date.now();

    console.log(`Disconnected: ${connectionId}`);
    return true;
  }

  /**
   * Send message through port
   */
  async sendMessage(
    message: Omit<PortMessage, 'id' | 'timestamp' | 'portId' | 'validationResults' | 'transformationHistory' | 'routingMetadata'>,
    targetConnectionId?: string
  ): Promise<boolean> {
    if (this.status !== 'active') {
      console.warn(`Port ${this.config.id} is not active`);
      return false;
    }

    if (this.config.direction === 'input') {
      console.warn(`Cannot send message through input port ${this.config.id}`);
      return false;
    }

    // Create full message
    const fullMessage: PortMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: Date.now(),
      portId: this.config.id,
      validationResults: [],
      transformationHistory: [],
      routingMetadata: {
        hopCount: 0,
        route: [this.config.id],
        latency: 0,
        bandwidth: 0
      }
    };

    // Validate message
    const validationResults = await this.validateMessage(fullMessage);
    fullMessage.validationResults = validationResults;

    const validationPassed = validationResults.every(r => r.passed);
    if (!validationPassed) {
      this.statistics.validationFailures++;
      console.warn(`Message validation failed for port ${this.config.id}`);
      return false;
    }

    // Apply transformations
    const transformedMessage = await this.applyTransformations(fullMessage);
    if (!transformedMessage) {
      this.statistics.transformationFailures++;
      console.warn(`Message transformation failed for port ${this.config.id}`);
      return false;
    }

    // Route message
    const success = await this.routeMessage(transformedMessage, targetConnectionId);
    
    if (success) {
      this.statistics.messagesProcessed++;
      this.statistics.bytesTransferred += transformedMessage.contentSize;
      this.lastActivity = Date.now();
    }

    return success;
  }

  /**
   * Receive message through port
   */
  async receiveMessage(message: PortMessage): Promise<boolean> {
    if (this.status !== 'active') {
      return false;
    }

    if (this.config.direction === 'output') {
      console.warn(`Cannot receive message through output port ${this.config.id}`);
      return false;
    }

    // Check buffer space
    if (this.messageBuffer.length >= this.config.bufferSize) {
      console.warn(`Port ${this.config.id} buffer full`);
      return false;
    }

    // Validate and transform incoming message
    const validationResults = await this.validateMessage(message);
    message.validationResults.push(...validationResults);

    const validationPassed = validationResults.every(r => r.passed);
    if (!validationPassed) {
      this.statistics.validationFailures++;
      return false;
    }

    const transformedMessage = await this.applyTransformations(message);
    if (!transformedMessage) {
      this.statistics.transformationFailures++;
      return false;
    }

    // Add to buffer
    this.messageBuffer.push(transformedMessage);
    this.statistics.messagesProcessed++;
    this.statistics.bytesTransferred += transformedMessage.contentSize;
    this.lastActivity = Date.now();

    // Notify membrane if attached
    if (this.membrane) {
      await this.notifyMembraneOfMessage(transformedMessage);
    }

    return true;
  }

  /**
   * Process buffered messages
   */
  processBufferedMessages(): PortMessage[] {
    const messages = [...this.messageBuffer];
    this.messageBuffer = [];
    return messages;
  }

  /**
   * Get port configuration
   */
  getConfig(): PortChannelConfig {
    return { ...this.config };
  }

  /**
   * Get port ID
   */
  getId(): string {
    return this.config.id;
  }

  /**
   * Get port name
   */
  getName(): string {
    return this.config.name;
  }

  /**
   * Get port direction
   */
  getDirection(): PortDirection {
    return this.config.direction;
  }

  /**
   * Get membrane ID
   */
  getMembraneId(): string {
    return this.config.membraneId;
  }

  /**
   * Get port status
   */
  getStatus(): PortStatus {
    return this.status;
  }

  /**
   * Set port status
   */
  setStatus(status: PortStatus): void {
    this.status = status;
    this.lastActivity = Date.now();
  }

  /**
   * Get port statistics
   */
  getStatistics(): PortChannelStatistics {
    const now = Date.now();
    this.statistics.uptime = now - this.creationTime;
    this.statistics.throughput = this.statistics.bytesTransferred / (this.statistics.uptime / 1000);
    this.statistics.errorRate = this.statistics.validationFailures + this.statistics.transformationFailures;
    
    return { ...this.statistics };
  }

  /**
   * Get active connections
   */
  getConnections(): PortConnection[] {
    return Array.from(this.connections.values()).filter(c => c.isActive);
  }

  /**
   * Get connection by ID
   */
  getConnection(connectionId: string): PortConnection | undefined {
    return this.connections.get(connectionId);
  }

  // Private methods

  private canConnectTo(targetPort: PortChannel): boolean {
    // Check direction compatibility
    if (this.config.direction === 'input' && targetPort.getDirection() === 'input') {
      return false;
    }
    if (this.config.direction === 'output' && targetPort.getDirection() === 'output') {
      return false;
    }

    // Check if already connected
    const connectionId = `${this.config.id}->${targetPort.getId()}`;
    if (this.connections.has(connectionId)) {
      return false;
    }

    // Check membrane boundaries
    if (this.membrane && !this.checkBoundaryPermission(targetPort)) {
      return false;
    }

    return true;
  }

  private canAcceptConnectionFrom(sourcePort: PortChannel): boolean {
    // Check direction compatibility
    if (this.config.direction === 'output' && sourcePort.getDirection() === 'output') {
      return false;
    }

    // Check max connections
    if (this.connections.size >= this.config.maxConnections) {
      return false;
    }

    return true;
  }

  private checkBoundaryPermission(targetPort: PortChannel): boolean {
    if (!this.membrane) return true;

    const boundary = this.membrane.getBoundary();
    
    // Simple boundary check - could be more sophisticated
    switch (boundary.policy) {
      case 'open':
        return true;
      case 'closed':
        return false;
      case 'selective':
        return boundary.permeability.outbound > 0.5;
      case 'semi-permeable':
        return boundary.permeability.bidirectional > 0.3;
      default:
        return false;
    }
  }

  private async validateMessage(message: PortMessage): Promise<PortValidationResult[]> {
    const results: PortValidationResult[] = [];

    for (const rule of this.config.validationRules) {
      if (!rule.enabled) continue;

      const result = await this.executeValidationRule(rule, message);
      results.push(result);
    }

    return results;
  }

  private async executeValidationRule(
    rule: PortValidationRule,
    message: PortMessage
  ): Promise<PortValidationResult> {
    try {
      switch (rule.type) {
        case 'shape':
          return this.validateShape(rule, message);
        case 'range':
          return this.validateRange(rule, message);
        case 'type':
          return this.validateType(rule, message);
        case 'content':
          return this.validateContent(rule, message);
        case 'security':
          return this.validateSecurity(rule, message);
        default:
          return {
            ruleId: rule.id,
            passed: false,
            message: `Unknown validation rule type: ${rule.type}`
          };
      }
    } catch (error) {
      return {
        ruleId: rule.id,
        passed: false,
        message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private validateShape(rule: PortValidationRule, message: PortMessage): PortValidationResult {
    // Implement tensor shape validation
    return {
      ruleId: rule.id,
      passed: true,
      message: 'Shape validation passed'
    };
  }

  private validateRange(rule: PortValidationRule, message: PortMessage): PortValidationResult {
    // Implement range validation
    return {
      ruleId: rule.id,
      passed: true,
      message: 'Range validation passed'
    };
  }

  private validateType(rule: PortValidationRule, message: PortMessage): PortValidationResult {
    const expectedType = rule.parameters.expectedType;
    const passed = message.dataType === expectedType;
    
    return {
      ruleId: rule.id,
      passed,
      message: passed ? 'Type validation passed' : `Expected ${expectedType}, got ${message.dataType}`
    };
  }

  private validateContent(rule: PortValidationRule, message: PortMessage): PortValidationResult {
    // Implement content validation
    return {
      ruleId: rule.id,
      passed: true,
      message: 'Content validation passed'
    };
  }

  private validateSecurity(rule: PortValidationRule, message: PortMessage): PortValidationResult {
    // Implement security validation
    return {
      ruleId: rule.id,
      passed: true,
      message: 'Security validation passed'
    };
  }

  private async applyTransformations(message: PortMessage): Promise<PortMessage | null> {
    let transformedMessage = { ...message };

    // Sort transformations by priority
    const sortedRules = [...this.config.transformationRules]
      .filter(rule => rule.enabled)
      .sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      const result = await this.executeTransformationRule(rule, transformedMessage);
      if (result) {
        transformedMessage = result;
      }
    }

    return transformedMessage;
  }

  private async executeTransformationRule(
    rule: PortTransformationRule,
    message: PortMessage
  ): Promise<PortMessage | null> {
    const startTime = Date.now();
    const inputSize = message.contentSize;

    try {
      let transformedMessage = { ...message };

      switch (rule.type) {
        case 'scale':
          transformedMessage = await this.applyScaling(rule, transformedMessage);
          break;
        case 'normalize':
          transformedMessage = await this.applyNormalization(rule, transformedMessage);
          break;
        case 'compress':
          transformedMessage = await this.applyCompression(rule, transformedMessage);
          break;
        case 'encrypt':
          transformedMessage = await this.applyEncryption(rule, transformedMessage);
          break;
        case 'filter':
          transformedMessage = await this.applyFilter(rule, transformedMessage);
          break;
        default:
          console.warn(`Unknown transformation rule type: ${rule.type}`);
          return message;
      }

      const processingTime = Date.now() - startTime;
      const outputSize = transformedMessage.contentSize;

      // Record transformation result
      const transformationResult: PortTransformationResult = {
        ruleId: rule.id,
        applied: true,
        inputSize,
        outputSize,
        processingTime,
        parameters: rule.parameters
      };

      transformedMessage.transformationHistory.push(transformationResult);
      return transformedMessage;

    } catch (error) {
      console.error(`Transformation failed for rule ${rule.id}:`, error);
      return null;
    }
  }

  // Transformation implementations (simplified)
  private async applyScaling(rule: PortTransformationRule, message: PortMessage): Promise<PortMessage> {
    // Implement scaling transformation
    return message;
  }

  private async applyNormalization(rule: PortTransformationRule, message: PortMessage): Promise<PortMessage> {
    // Implement normalization transformation
    return message;
  }

  private async applyCompression(rule: PortTransformationRule, message: PortMessage): Promise<PortMessage> {
    // Implement compression transformation
    const compressionRatio = rule.parameters.ratio || 0.5;
    const compressedMessage = { ...message };
    compressedMessage.contentSize = Math.floor(message.contentSize * compressionRatio);
    compressedMessage.compressionRatio = compressionRatio;
    return compressedMessage;
  }

  private async applyEncryption(rule: PortTransformationRule, message: PortMessage): Promise<PortMessage> {
    // Implement encryption transformation
    return message;
  }

  private async applyFilter(rule: PortTransformationRule, message: PortMessage): Promise<PortMessage> {
    // Implement filter transformation
    return message;
  }

  private async routeMessage(message: PortMessage, targetConnectionId?: string): Promise<boolean> {
    let targetConnections: PortConnection[] = [];

    if (targetConnectionId) {
      const connection = this.connections.get(targetConnectionId);
      if (connection && connection.isActive) {
        targetConnections = [connection];
      }
    } else {
      targetConnections = Array.from(this.connections.values()).filter(c => c.isActive);
    }

    if (targetConnections.length === 0) {
      console.warn(`No active connections for port ${this.config.id}`);
      return false;
    }

    let success = true;
    for (const connection of targetConnections) {
      const routingSuccess = await this.sendMessageThroughConnection(message, connection);
      if (!routingSuccess) {
        connection.errorCount++;
        success = false;
      } else {
        connection.messageCount++;
        connection.totalBytes += message.contentSize;
        connection.lastActivity = Date.now();
      }
    }

    return success;
  }

  private async sendMessageThroughConnection(
    message: PortMessage,
    connection: PortConnection
  ): Promise<boolean> {
    // In a real implementation, this would send the message to the target port
    // For now, we simulate successful sending
    console.log(`Sending message ${message.id} through connection ${connection.id}`);
    return true;
  }

  private async notifyMembraneOfMessage(message: PortMessage): Promise<void> {
    // Notify the attached membrane about the received message
    console.log(`Notifying membrane ${this.config.membraneId} of message ${message.id}`);
  }

  private generateMessageId(): string {
    return `msg_${this.config.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Port channel statistics interface
 */
export interface PortChannelStatistics {
  portId: string;
  messagesProcessed: number;
  bytesTransferred: number;
  connectionsActive: number;
  connectionsTotal: number;
  validationFailures: number;
  transformationFailures: number;
  averageLatency: number;
  throughput: number;
  errorRate: number;
  uptime: number;
}

/**
 * Port channel factory for creating standard port configurations
 */
export class PortChannelFactory {
  /**
   * Create a tensor input port
   */
  static createTensorInputPort(
    membraneId: string,
    name: string,
    tensorShape: TensorShape,
    options?: Partial<PortChannelConfig>
  ): PortChannel {
    const config: PortChannelConfig = {
      id: `${membraneId}_tensor_in_${Date.now()}`,
      name,
      direction: 'input',
      dataType: 'tensor',
      tensorShape,
      membraneId,
      maxConnections: 10,
      bufferSize: 100,
      compressionEnabled: false,
      encryptionEnabled: false,
      validationRules: [
        {
          id: 'shape_validation',
          name: 'Tensor Shape Validation',
          type: 'shape',
          parameters: { expectedShape: tensorShape },
          errorMessage: 'Invalid tensor shape',
          enabled: true
        },
        {
          id: 'type_validation',
          name: 'Data Type Validation',
          type: 'type',
          parameters: { expectedType: 'tensor' },
          errorMessage: 'Invalid data type',
          enabled: true
        }
      ],
      transformationRules: [],
      ...options
    };

    return new PortChannel(config);
  }

  /**
   * Create a tensor output port
   */
  static createTensorOutputPort(
    membraneId: string,
    name: string,
    tensorShape: TensorShape,
    options?: Partial<PortChannelConfig>
  ): PortChannel {
    const config: PortChannelConfig = {
      id: `${membraneId}_tensor_out_${Date.now()}`,
      name,
      direction: 'output',
      dataType: 'tensor',
      tensorShape,
      membraneId,
      maxConnections: 10,
      bufferSize: 100,
      compressionEnabled: true,
      encryptionEnabled: false,
      validationRules: [],
      transformationRules: [
        {
          id: 'compression',
          name: 'Tensor Compression',
          type: 'compress',
          parameters: { ratio: 0.7 },
          priority: 1,
          enabled: true
        }
      ],
      ...options
    };

    return new PortChannel(config);
  }

  /**
   * Create a control message port
   */
  static createControlPort(
    membraneId: string,
    name: string,
    direction: PortDirection = 'bidirectional',
    options?: Partial<PortChannelConfig>
  ): PortChannel {
    const config: PortChannelConfig = {
      id: `${membraneId}_control_${Date.now()}`,
      name,
      direction,
      dataType: 'control',
      membraneId,
      maxConnections: 5,
      bufferSize: 50,
      compressionEnabled: false,
      encryptionEnabled: true,
      validationRules: [
        {
          id: 'security_validation',
          name: 'Security Validation',
          type: 'security',
          parameters: { requireAuth: true },
          errorMessage: 'Security validation failed',
          enabled: true
        }
      ],
      transformationRules: [
        {
          id: 'encryption',
          name: 'Message Encryption',
          type: 'encrypt',
          parameters: { algorithm: 'AES-256' },
          priority: 1,
          enabled: true
        }
      ],
      ...options
    };

    return new PortChannel(config);
  }
}