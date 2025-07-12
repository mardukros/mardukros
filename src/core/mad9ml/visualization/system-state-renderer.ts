/**
 * System State Renderer - Visualizes overall system health and metrics
 * 
 * Renders dynamic visualizations of system state including memory usage,
 * task execution metrics, AI activity, and autonomy status.
 */

import {
  VisualizationConfig,
  SystemStateSnapshot,
  MemoryUsageMetrics,
  TaskExecutionMetrics,
  AIActivityMetrics,
  AutonomyStatusMetrics,
  SystemHealthIndicators
} from './types.js';

export class SystemStateRenderer {
  private config: VisualizationConfig;
  
  constructor(config: VisualizationConfig) {
    this.config = config;
  }

  /**
   * Render the complete system state visualization
   */
  public render(ctx: CanvasRenderingContext2D, snapshot: SystemStateSnapshot): void {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set up grid layout
    const padding = 40;
    const gridCols = 2;
    const gridRows = 2;
    const cellWidth = (width - padding * (gridCols + 1)) / gridCols;
    const cellHeight = (height - padding * (gridRows + 1)) / gridRows;
    
    // Render system overview at the top
    this.renderSystemOverview(ctx, snapshot, padding, padding, width - 2 * padding, 80);
    
    // Render subsystem details in grid
    const subsystems = [
      { title: 'Memory System', data: snapshot.memoryUsage, renderer: 'memory' },
      { title: 'Task Execution', data: snapshot.taskExecution, renderer: 'tasks' },
      { title: 'AI Activity', data: snapshot.aiActivity, renderer: 'ai' },
      { title: 'Autonomy Status', data: snapshot.autonomyStatus, renderer: 'autonomy' }
    ];
    
    subsystems.forEach((subsystem, index) => {
      const col = index % gridCols;
      const row = Math.floor(index / gridCols);
      const x = padding + col * (cellWidth + padding);
      const y = 140 + row * (cellHeight + padding);
      
      this.renderSubsystem(ctx, subsystem.title, subsystem.data, subsystem.renderer, x, y, cellWidth, cellHeight);
    });
    
    // Render meta-cognitive state
    this.renderMetaCognitiveState(ctx, snapshot.metaCognitive, width - 200, padding, 160, height - 2 * padding);
  }

  /**
   * Render system overview with health indicators
   */
  private renderSystemOverview(ctx: CanvasRenderingContext2D, snapshot: SystemStateSnapshot, x: number, y: number, width: number, height: number): void {
    // Background
    ctx.fillStyle = this.config.colorScheme.membrane;
    ctx.fillRect(x, y, width, height);
    
    // Border
    ctx.strokeStyle = this.config.colorScheme.membraneBoundary;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Title
    ctx.fillStyle = this.config.theme === 'dark' ? '#ffffff' : '#000000';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('System Overview', x + 16, y + 28);
    
    // Timestamp
    ctx.font = '12px sans-serif';
    ctx.fillStyle = this.config.theme === 'dark' ? '#cccccc' : '#666666';
    ctx.fillText(`Last Update: ${new Date(snapshot.timestamp).toLocaleString()}`, x + 16, y + 50);
    
    // Overall health indicator
    const healthColor = this.getHealthColor(snapshot.health.overall);
    ctx.fillStyle = healthColor;
    ctx.beginPath();
    ctx.arc(x + width - 40, y + 30, 20, 0, 2 * Math.PI);
    ctx.fill();
    
    // Health status text
    ctx.fillStyle = this.config.theme === 'dark' ? '#ffffff' : '#000000';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(snapshot.health.overall.toUpperCase(), x + width - 60, y + 36);
    ctx.textAlign = 'left';
    
    // Component health indicators
    const components = ['memory', 'tasks', 'ai', 'autonomy'];
    const componentWidth = (width - 200) / components.length;
    
    components.forEach((component, index) => {
      const compX = x + 200 + index * componentWidth;
      const compY = y + 55;
      const health = snapshot.health.components[component as keyof typeof snapshot.health.components];
      
      // Component status dot
      ctx.fillStyle = this.getHealthColor(health.status);
      ctx.beginPath();
      ctx.arc(compX + 10, compY + 5, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      // Component name
      ctx.fillStyle = this.config.theme === 'dark' ? '#cccccc' : '#666666';
      ctx.font = '11px sans-serif';
      ctx.fillText(component.charAt(0).toUpperCase() + component.slice(1), compX + 20, compY + 8);
    });
  }

  /**
   * Render individual subsystem visualization
   */
  private renderSubsystem(ctx: CanvasRenderingContext2D, title: string, data: any, rendererType: string, x: number, y: number, width: number, height: number): void {
    // Background
    ctx.fillStyle = this.config.theme === 'dark' ? '#2d2d2d' : '#f5f5f5';
    ctx.fillRect(x, y, width, height);
    
    // Border
    ctx.strokeStyle = this.config.colorScheme.membraneBoundary;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    
    // Title
    ctx.fillStyle = this.config.theme === 'dark' ? '#ffffff' : '#000000';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(title, x + 12, y + 24);
    
    // Render specific subsystem data
    switch (rendererType) {
      case 'memory':
        this.renderMemoryMetrics(ctx, data as MemoryUsageMetrics, x + 12, y + 40, width - 24, height - 52);
        break;
      case 'tasks':
        this.renderTaskMetrics(ctx, data as TaskExecutionMetrics, x + 12, y + 40, width - 24, height - 52);
        break;
      case 'ai':
        this.renderAIMetrics(ctx, data as AIActivityMetrics, x + 12, y + 40, width - 24, height - 52);
        break;
      case 'autonomy':
        this.renderAutonomyMetrics(ctx, data as AutonomyStatusMetrics, x + 12, y + 40, width - 24, height - 52);
        break;
    }
  }

  /**
   * Render memory usage metrics
   */
  private renderMemoryMetrics(ctx: CanvasRenderingContext2D, metrics: MemoryUsageMetrics, x: number, y: number, width: number, height: number): void {
    const textColor = this.config.theme === 'dark' ? '#cccccc' : '#666666';
    ctx.fillStyle = textColor;
    ctx.font = '12px sans-serif';
    
    // Total items
    ctx.fillText(`Total Items: ${metrics.totalItems.toLocaleString()}`, x, y + 15);
    ctx.fillText(`Efficiency: ${(metrics.efficiency * 100).toFixed(1)}%`, x, y + 30);
    ctx.fillText(`Capacity: ${metrics.remainingCapacity}`, x, y + 45);
    
    // Subsystem breakdown pie chart
    const chartX = x + width - 80;
    const chartY = y + 40;
    const radius = 30;
    
    const subsystems = Object.entries(metrics.subsystemBreakdown);
    const total = subsystems.reduce((sum, [, count]) => sum + count, 0);
    
    let startAngle = 0;
    const colors = [
      this.config.colorScheme.memoryNode,
      this.config.colorScheme.conceptNode,
      this.config.colorScheme.agentNode,
      this.config.colorScheme.kernelNode
    ];
    
    subsystems.forEach(([name, count], index) => {
      const angle = (count / total) * 2 * Math.PI;
      
      ctx.fillStyle = colors[index % colors.length];
      ctx.beginPath();
      ctx.moveTo(chartX, chartY);
      ctx.arc(chartX, chartY, radius, startAngle, startAngle + angle);
      ctx.fill();
      
      startAngle += angle;
    });
    
    // Access patterns visualization
    if (metrics.accessPatterns.length > 0) {
      const patternY = y + 90;
      ctx.fillStyle = textColor;
      ctx.font = '10px sans-serif';
      ctx.fillText('Recent Access Patterns:', x, patternY);
      
      metrics.accessPatterns.slice(0, 3).forEach((pattern, index) => {
        const barY = patternY + 15 + index * 12;
        const barWidth = (pattern.frequency / 100) * (width - 100);
        
        ctx.fillStyle = this.config.colorScheme.semanticEdge;
        ctx.fillRect(x + 80, barY, barWidth, 8);
        
        ctx.fillStyle = textColor;
        ctx.fillText(`${pattern.subsystem}: ${pattern.frequency}%`, x, barY + 6);
      });
    }
  }

  /**
   * Render task execution metrics
   */
  private renderTaskMetrics(ctx: CanvasRenderingContext2D, metrics: TaskExecutionMetrics, x: number, y: number, width: number, height: number): void {
    const textColor = this.config.theme === 'dark' ? '#cccccc' : '#666666';
    ctx.fillStyle = textColor;
    ctx.font = '12px sans-serif';
    
    // Basic metrics
    ctx.fillText(`Scheduled: ${metrics.scheduledTasks}`, x, y + 15);
    ctx.fillText(`Completed: ${metrics.completedTasks}`, x, y + 30);
    ctx.fillText(`Failed: ${metrics.failedTasks}`, x, y + 45);
    ctx.fillText(`Avg Time: ${metrics.averageExecutionTime}ms`, x, y + 60);
    ctx.fillText(`Throughput: ${metrics.throughput}/min`, x, y + 75);
    
    // Success rate indicator
    const successRate = metrics.completedTasks / (metrics.completedTasks + metrics.failedTasks);
    const indicatorX = x + width - 80;
    const indicatorY = y + 20;
    
    // Background circle
    ctx.strokeStyle = this.config.theme === 'dark' ? '#444444' : '#dddddd';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, 25, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Success arc
    ctx.strokeStyle = successRate > 0.8 ? this.config.colorScheme.healthy : 
                     successRate > 0.6 ? this.config.colorScheme.warning : 
                     this.config.colorScheme.critical;
    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, 25, -Math.PI / 2, -Math.PI / 2 + (successRate * 2 * Math.PI));
    ctx.stroke();
    
    // Success rate text
    ctx.fillStyle = this.config.theme === 'dark' ? '#ffffff' : '#000000';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${(successRate * 100).toFixed(0)}%`, indicatorX, indicatorY + 3);
    ctx.textAlign = 'left';
    
    // Priority distribution
    if (Object.keys(metrics.priorityDistribution).length > 0) {
      const priorityY = y + 100;
      ctx.fillStyle = textColor;
      ctx.font = '10px sans-serif';
      ctx.fillText('Priority Distribution:', x, priorityY);
      
      const priorities = Object.entries(metrics.priorityDistribution).sort(([a], [b]) => Number(b) - Number(a));
      priorities.forEach(([priority, count], index) => {
        const barY = priorityY + 15 + index * 10;
        const barWidth = (count / Math.max(...Object.values(metrics.priorityDistribution))) * (width - 100);
        
        ctx.fillStyle = this.getPriorityColor(Number(priority));
        ctx.fillRect(x + 60, barY, barWidth, 6);
        
        ctx.fillStyle = textColor;
        ctx.fillText(`P${priority}: ${count}`, x, barY + 4);
      });
    }
  }

  /**
   * Render AI activity metrics
   */
  private renderAIMetrics(ctx: CanvasRenderingContext2D, metrics: AIActivityMetrics, x: number, y: number, width: number, height: number): void {
    const textColor = this.config.theme === 'dark' ? '#cccccc' : '#666666';
    ctx.fillStyle = textColor;
    ctx.font = '12px sans-serif';
    
    // Basic metrics
    ctx.fillText(`Models: ${metrics.availableModels.length}`, x, y + 15);
    ctx.fillText(`Tokens: ${metrics.tokenUsage.toLocaleString()}`, x, y + 30);
    ctx.fillText(`Avg Response: ${metrics.averageResponseTime}ms`, x, y + 45);
    ctx.fillText(`Success Rate: ${(metrics.successRate * 100).toFixed(1)}%`, x, y + 60);
    ctx.fillText(`Active Contexts: ${metrics.activeContexts}`, x, y + 75);
    
    // Model availability visualization
    const modelY = y + 95;
    ctx.fillStyle = textColor;
    ctx.font = '10px sans-serif';
    ctx.fillText('Available Models:', x, modelY);
    
    metrics.availableModels.slice(0, 4).forEach((model, index) => {
      const dotX = x + index * 15;
      const dotY = modelY + 15;
      
      ctx.fillStyle = this.config.colorScheme.healthy;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // Response time trend (simplified)
    const trendY = y + 130;
    if (height > 130) {
      ctx.strokeStyle = this.config.colorScheme.temporalEdge;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      // Generate sample trend data based on response time
      const points = 10;
      const baseTime = metrics.averageResponseTime;
      for (let i = 0; i < points; i++) {
        const trendX = x + (i / (points - 1)) * (width - 20);
        const variance = (Math.random() - 0.5) * baseTime * 0.3;
        const trendValue = Math.max(0, baseTime + variance);
        const pointY = trendY + 20 - (trendValue / (baseTime * 2)) * 20;
        
        if (i === 0) {
          ctx.moveTo(trendX, pointY);
        } else {
          ctx.lineTo(trendX, pointY);
        }
      }
      ctx.stroke();
    }
  }

  /**
   * Render autonomy status metrics
   */
  private renderAutonomyMetrics(ctx: CanvasRenderingContext2D, metrics: AutonomyStatusMetrics, x: number, y: number, width: number, height: number): void {
    const textColor = this.config.theme === 'dark' ? '#cccccc' : '#666666';
    ctx.fillStyle = textColor;
    ctx.font = '12px sans-serif';
    
    // Status indicator
    const statusColor = metrics.selfImprovementActive ? this.config.colorScheme.healthy : this.config.colorScheme.warning;
    ctx.fillStyle = statusColor;
    ctx.beginPath();
    ctx.arc(x + width - 20, y + 10, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // Basic metrics
    ctx.fillStyle = textColor;
    ctx.fillText(`Self-Improvement: ${metrics.selfImprovementActive ? 'ACTIVE' : 'INACTIVE'}`, x, y + 15);
    ctx.fillText(`Improvements: ${metrics.improvementsImplemented}`, x, y + 30);
    ctx.fillText(`Patterns: ${metrics.detectedPatterns}`, x, y + 45);
    ctx.fillText(`Optimization Cycles: ${metrics.optimizationCycles}`, x, y + 60);
    
    // Last improvement time
    if (metrics.lastImprovement) {
      const lastTime = new Date(metrics.lastImprovement);
      const timeAgo = this.getTimeAgo(lastTime);
      ctx.fillText(`Last Improvement: ${timeAgo}`, x, y + 75);
    }
    
    // Improvement activity timeline (simplified)
    const timelineY = y + 100;
    if (height > 100) {
      ctx.strokeStyle = this.config.colorScheme.hierarchicalEdge;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, timelineY);
      ctx.lineTo(x + width - 20, timelineY);
      ctx.stroke();
      
      // Add improvement markers
      for (let i = 0; i < Math.min(metrics.improvementsImplemented, 8); i++) {
        const markerX = x + 10 + (i / 7) * (width - 40);
        ctx.fillStyle = this.config.colorScheme.healthy;
        ctx.beginPath();
        ctx.arc(markerX, timelineY, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }

  /**
   * Render meta-cognitive state panel
   */
  private renderMetaCognitiveState(ctx: CanvasRenderingContext2D, metaCognitive: any, x: number, y: number, width: number, height: number): void {
    // Background
    ctx.fillStyle = this.config.theme === 'dark' ? '#1a1a1a' : '#ffffff';
    ctx.fillRect(x, y, width, height);
    
    // Border
    ctx.strokeStyle = this.config.colorScheme.membraneBoundary;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Title
    ctx.fillStyle = this.config.theme === 'dark' ? '#ffffff' : '#000000';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Meta-Cognitive', x + 12, y + 24);
    ctx.fillText('State', x + 12, y + 40);
    
    if (!metaCognitive) return;
    
    const textColor = this.config.theme === 'dark' ? '#cccccc' : '#666666';
    ctx.fillStyle = textColor;
    ctx.font = '11px sans-serif';
    
    // Reflection depth gauge
    const gaugeY = y + 60;
    this.renderGauge(ctx, x + 12, gaugeY, width - 24, 'Reflection Depth', metaCognitive.reflectionDepth || 0);
    
    // Awareness level gauge
    const awarenessY = gaugeY + 40;
    this.renderGauge(ctx, x + 12, awarenessY, width - 24, 'Awareness Level', metaCognitive.awarenessLevel || 0);
    
    // Cognitive load gauge
    const loadY = awarenessY + 40;
    this.renderGauge(ctx, x + 12, loadY, width - 24, 'Cognitive Load', metaCognitive.cognitiveLoad || 0);
    
    // Self-monitoring status
    const monitoringY = loadY + 40;
    ctx.fillText('Self-Monitoring:', x + 12, monitoringY + 12);
    const isActive = metaCognitive.selfMonitoringActive;
    ctx.fillStyle = isActive ? this.config.colorScheme.healthy : this.config.colorScheme.warning;
    ctx.fillText(isActive ? 'ACTIVE' : 'INACTIVE', x + 12, monitoringY + 26);
    
    // Adaptation rate
    const adaptationY = monitoringY + 50;
    ctx.fillStyle = textColor;
    ctx.fillText(`Adaptation Rate:`, x + 12, adaptationY + 12);
    ctx.fillText(`${((metaCognitive.adaptationRate || 0) * 100).toFixed(1)}%`, x + 12, adaptationY + 26);
  }

  /**
   * Render a gauge/meter visualization
   */
  private renderGauge(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, label: string, value: number): void {
    const textColor = this.config.theme === 'dark' ? '#cccccc' : '#666666';
    
    // Label
    ctx.fillStyle = textColor;
    ctx.font = '10px sans-serif';
    ctx.fillText(label, x, y - 5);
    
    // Background bar
    ctx.fillStyle = this.config.theme === 'dark' ? '#444444' : '#dddddd';
    ctx.fillRect(x, y, width - 30, 8);
    
    // Value bar
    const normalizedValue = Math.max(0, Math.min(1, value));
    const valueWidth = normalizedValue * (width - 30);
    
    ctx.fillStyle = normalizedValue > 0.7 ? this.config.colorScheme.healthy :
                   normalizedValue > 0.4 ? this.config.colorScheme.warning :
                   this.config.colorScheme.critical;
    ctx.fillRect(x, y, valueWidth, 8);
    
    // Value text
    ctx.fillStyle = textColor;
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${(normalizedValue * 100).toFixed(0)}%`, x + width, y + 6);
    ctx.textAlign = 'left';
  }

  // ========== Helper Methods ==========

  private getHealthColor(status: string): string {
    switch (status) {
      case 'healthy': return this.config.colorScheme.healthy;
      case 'warning': return this.config.colorScheme.warning;
      case 'critical': return this.config.colorScheme.critical;
      default: return this.config.colorScheme.unknown;
    }
  }

  private getPriorityColor(priority: number): string {
    if (priority >= 5) return this.config.colorScheme.critical;
    if (priority >= 3) return this.config.colorScheme.warning;
    return this.config.colorScheme.healthy;
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
}