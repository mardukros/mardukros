/**
 * Visualization Types and Interfaces
 * 
 * Defines all types, interfaces, and data structures used throughout
 * the dynamic visualization system for MAD9ML.
 */

// ========== Core Visualization Types ==========

export interface VisualizationConfig {
  // Display settings
  theme: 'light' | 'dark' | 'high-contrast';
  colorScheme: ColorScheme;
  
  // Layout options
  layout: LayoutConfig;
  
  // Performance settings
  maxNodes: number;
  maxEdges: number;
  refreshRate: number; // milliseconds
  
  // Interactive features
  enableDrillDown: boolean;
  enableTimeTravel: boolean;
  enableExport: boolean;
  enableRealTime: boolean;
}

export interface ColorScheme {
  // Node colors by type
  memoryNode: string;
  conceptNode: string;
  agentNode: string;
  kernelNode: string;
  
  // Edge colors by relationship
  semanticEdge: string;
  causalEdge: string;
  temporalEdge: string;
  hierarchicalEdge: string;
  
  // Membrane colors
  membrane: string;
  membraneBoundary: string;
  activePort: string;
  inactivePort: string;
  
  // System state colors
  healthy: string;
  warning: string;
  critical: string;
  unknown: string;
}

export interface LayoutConfig {
  algorithm: 'force-directed' | 'hierarchical' | 'circular' | 'grid';
  spacing: number;
  clustering: boolean;
  layering: boolean;
}

// ========== System State Visualization ==========

export interface SystemStateSnapshot {
  timestamp: string;
  id: string;
  
  // Core system metrics
  memoryUsage: MemoryUsageMetrics;
  taskExecution: TaskExecutionMetrics;
  aiActivity: AIActivityMetrics;
  autonomyStatus: AutonomyStatusMetrics;
  
  // Meta-cognitive state
  metaCognitive: MetaCognitiveState;
  
  // Health indicators
  health: SystemHealthIndicators;
}

export interface MemoryUsageMetrics {
  totalItems: number;
  subsystemBreakdown: {
    declarative: number;
    episodic: number;
    procedural: number;
    semantic: number;
  };
  accessPatterns: AccessPattern[];
  efficiency: number;
  remainingCapacity: string;
}

export interface TaskExecutionMetrics {
  scheduledTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageExecutionTime: number;
  throughput: number;
  priorityDistribution: Record<number, number>;
}

export interface AIActivityMetrics {
  availableModels: string[];
  tokenUsage: number;
  averageResponseTime: number;
  successRate: number;
  activeContexts: number;
}

export interface AutonomyStatusMetrics {
  selfImprovementActive: boolean;
  improvementsImplemented: number;
  lastImprovement: string;
  detectedPatterns: number;
  optimizationCycles: number;
}

export interface MetaCognitiveState {
  reflectionDepth: number;
  awarenessLevel: number;
  selfMonitoringActive: boolean;
  cognitiveLoad: number;
  adaptationRate: number;
}

export interface SystemHealthIndicators {
  overall: 'healthy' | 'warning' | 'critical' | 'unknown';
  components: {
    memory: HealthStatus;
    tasks: HealthStatus;
    ai: HealthStatus;
    autonomy: HealthStatus;
  };
}

export interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  details: string;
  metrics: Record<string, number>;
}

export interface AccessPattern {
  subsystem: string;
  frequency: number;
  recentAccess: string;
  pattern: 'sequential' | 'random' | 'clustered';
}

// ========== Hypergraph Visualization ==========

export interface VisualizationNode {
  id: string;
  type: 'memory' | 'concept' | 'agent' | 'kernel' | 'goal' | 'pattern';
  position: Point3D;
  size: number;
  color: string;
  label: string;
  metadata: Record<string, any>;
  
  // State information
  state: TensorVisualization;
  activation: number;
  lastUpdated: string;
}

export interface VisualizationEdge {
  id: string;
  source: string;
  target: string;
  type: 'semantic' | 'causal' | 'temporal' | 'hierarchical' | 'association';
  weight: number;
  color: string;
  label?: string;
  metadata: Record<string, any>;
  
  // Dynamic properties
  flow: number; // Information flow indicator
  strength: number;
  lastActive: string;
}

export interface TensorVisualization {
  shape: number[];
  data: number[];
  visualization: 'heatmap' | 'surface' | 'vector' | 'matrix';
  summary: {
    mean: number;
    std: number;
    min: number;
    max: number;
  };
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

// ========== Membrane Visualization ==========

export interface MembraneVisualization {
  id: string;
  type: string;
  boundary: MembraneBoundaryVisualization;
  ports: PortVisualization[];
  contents: VisualizationNode[];
  nestedMembranes: MembraneVisualization[];
  
  // Visual properties
  position: Point3D;
  size: Point3D;
  opacity: number;
  color: string;
  
  // State information
  activity: number;
  messageCount: number;
  lastActivity: string;
}

export interface MembraneBoundaryVisualization {
  permeability: number;
  thickness: number;
  pattern: 'solid' | 'dashed' | 'dotted' | 'gradient';
  color: string;
  activeRegions: BoundaryRegion[];
}

export interface BoundaryRegion {
  position: Point3D;
  size: number;
  activity: number;
  type: 'input' | 'output' | 'bidirectional';
}

export interface PortVisualization {
  id: string;
  type: string;
  position: Point3D;
  status: 'active' | 'inactive' | 'blocked';
  direction: 'input' | 'output' | 'bidirectional';
  connections: PortConnection[];
  throughput: number;
  
  // Visual properties
  size: number;
  color: string;
  animation: 'pulse' | 'flow' | 'static';
}

export interface PortConnection {
  targetPortId: string;
  targetMembraneId: string;
  messageFlow: number;
  latency: number;
  reliability: number;
}

// ========== Time Travel & History ==========

export interface TimelineEvent {
  timestamp: string;
  type: 'state_change' | 'memory_update' | 'task_execution' | 'ai_interaction' | 'system_event';
  description: string;
  affected: string[]; // IDs of affected components
  data: Record<string, any>;
  importance: number; // 0-1 scale
}

export interface TimeTravelState {
  currentTime: string;
  availableSnapshots: string[];
  timeRange: {
    start: string;
    end: string;
  };
  playbackSpeed: number;
  isPlaying: boolean;
}

// ========== Drill-Down & Navigation ==========

export interface DrillDownContext {
  currentFocus: string; // ID of focused element
  path: string[]; // Navigation path
  availableDetails: DetailLevel[];
  currentDetail: DetailLevel;
}

export type DetailLevel = 
  | 'overview'
  | 'component'
  | 'detailed'
  | 'internal'
  | 'tensor'
  | 'raw';

export interface NavigationAction {
  type: 'focus' | 'zoom' | 'filter' | 'detail' | 'back' | 'reset';
  target?: string;
  params?: Record<string, any>;
}

// ========== Export & Sharing ==========

export interface ExportOptions {
  format: 'png' | 'svg' | 'pdf' | 'json' | 'csv' | 'html';
  quality: number; // 0-1 scale
  includeData: boolean;
  includeMetadata: boolean;
  compression: boolean;
  
  // Specific options per format
  resolution?: { width: number; height: number };
  vectorize?: boolean;
  embedFonts?: boolean;
}

export interface ExportResult {
  success: boolean;
  data: string | ArrayBuffer;
  mimeType: string;
  filename: string;
  size: number;
  metadata: Record<string, any>;
}

// ========== Real-Time Updates ==========

export interface RealTimeConfig {
  enabled: boolean;
  updateInterval: number; // milliseconds
  maxUpdatesPerSecond: number;
  adaptiveRate: boolean;
  priorityFilter: string[];
}

export interface UpdateMessage {
  type: 'state_update' | 'node_change' | 'edge_change' | 'membrane_update' | 'system_event';
  timestamp: string;
  data: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// ========== Meta-Cognitive Visualization ==========

export interface SelfReflectionVisualization {
  awarenessMap: AwarenessNode[];
  thoughtProcesses: ThoughtProcess[];
  metacognitiveLoops: MetaCognitiveLoop[];
  reflectionDepth: number;
  consciousnessLevel: number;
}

export interface AwarenessNode {
  id: string;
  concept: string;
  awareness: number; // 0-1 scale
  lastReflection: string;
  connections: string[];
  introspectionData: Record<string, any>;
}

export interface ThoughtProcess {
  id: string;
  type: 'reasoning' | 'planning' | 'evaluation' | 'learning' | 'reflection';
  startTime: string;
  duration: number;
  participants: string[]; // Node IDs involved
  outcome: string;
  confidence: number;
}

export interface MetaCognitiveLoop {
  id: string;
  type: 'monitoring' | 'evaluation' | 'planning' | 'regulation';
  participants: string[];
  cycleTime: number;
  effectiveness: number;
  lastActive: string;
}

// ========== Utility Types ==========

export interface VisualizationError {
  code: string;
  message: string;
  component?: string;
  timestamp: string;
  recoverable: boolean;
}

export interface PerformanceMetrics {
  renderTime: number;
  frameRate: number;
  memoryUsage: number;
  nodeCount: number;
  edgeCount: number;
  lastUpdate: string;
}