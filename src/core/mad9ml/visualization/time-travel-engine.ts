/**
 * Time Travel Engine - Enables time-travel through system state history
 * 
 * Provides capabilities to navigate through historical system states,
 * replay events, and analyze temporal patterns in system behavior.
 */

import {
  SystemStateSnapshot,
  TimeTravelState,
  TimelineEvent,
  VisualizationNode,
  VisualizationEdge,
  MembraneVisualization
} from './types.js';

interface TemporalData {
  snapshots: Map<string, SystemStateSnapshot>;
  events: TimelineEvent[];
  nodeHistory: Map<string, Map<string, VisualizationNode>>;
  edgeHistory: Map<string, Map<string, VisualizationEdge>>;
  membraneHistory: Map<string, Map<string, MembraneVisualization>>;
}

export class TimeTravelEngine {
  private temporalData: TemporalData;
  private state: TimeTravelState;
  private eventListeners: Map<string, Function[]> = new Map();
  private playbackTimer: NodeJS.Timeout | null = null;
  
  constructor() {
    this.temporalData = {
      snapshots: new Map(),
      events: [],
      nodeHistory: new Map(),
      edgeHistory: new Map(),
      membraneHistory: new Map()
    };
    
    this.state = {
      currentTime: new Date().toISOString(),
      availableSnapshots: [],
      timeRange: {
        start: new Date().toISOString(),
        end: new Date().toISOString()
      },
      playbackSpeed: 1.0,
      isPlaying: false
    };
  }

  /**
   * Add a new system state snapshot
   */
  public addSnapshot(snapshot: SystemStateSnapshot): void {
    this.temporalData.snapshots.set(snapshot.timestamp, snapshot);
    this.updateAvailableSnapshots();
    this.updateTimeRange();
    
    // Record as an event
    this.addEvent({
      timestamp: snapshot.timestamp,
      type: 'state_change',
      description: 'System state snapshot recorded',
      affected: ['system'],
      data: { snapshotId: snapshot.id },
      importance: 0.5
    });
    
    this.emit('snapshotAdded', { snapshot });
  }

  /**
   * Add historical data for nodes
   */
  public addNodeHistory(timestamp: string, nodes: VisualizationNode[]): void {
    if (!this.temporalData.nodeHistory.has(timestamp)) {
      this.temporalData.nodeHistory.set(timestamp, new Map());
    }
    
    const nodeMap = this.temporalData.nodeHistory.get(timestamp)!;
    nodes.forEach(node => {
      nodeMap.set(node.id, { ...node });
    });
  }

  /**
   * Add historical data for edges
   */
  public addEdgeHistory(timestamp: string, edges: VisualizationEdge[]): void {
    if (!this.temporalData.edgeHistory.has(timestamp)) {
      this.temporalData.edgeHistory.set(timestamp, new Map());
    }
    
    const edgeMap = this.temporalData.edgeHistory.get(timestamp)!;
    edges.forEach(edge => {
      edgeMap.set(edge.id, { ...edge });
    });
  }

  /**
   * Add historical data for membranes
   */
  public addMembraneHistory(timestamp: string, membranes: MembraneVisualization[]): void {
    if (!this.temporalData.membraneHistory.has(timestamp)) {
      this.temporalData.membraneHistory.set(timestamp, new Map());
    }
    
    const membraneMap = this.temporalData.membraneHistory.get(timestamp)!;
    membranes.forEach(membrane => {
      membraneMap.set(membrane.id, { ...membrane });
    });
  }

  /**
   * Add a timeline event
   */
  public addEvent(event: TimelineEvent): void {
    this.temporalData.events.push(event);
    this.temporalData.events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    this.emit('eventAdded', { event });
  }

  /**
   * Seek to a specific timestamp
   */
  public seekTo(timestamp: string): void {
    if (this.isValidTimestamp(timestamp)) {
      this.state.currentTime = timestamp;
      this.stopPlayback();
      this.emit('timeChange', { timestamp, state: this.state });
    }
  }

  /**
   * Seek to a percentage of the timeline
   */
  public seekToPercent(percent: number): void {
    const range = this.getTimeRangeMs();
    const targetTime = new Date(new Date(this.state.timeRange.start).getTime() + range * percent);
    this.seekTo(targetTime.toISOString());
  }

  /**
   * Get snapshot at specific time (or closest available)
   */
  public getSnapshotAtTime(timestamp: string): SystemStateSnapshot | null {
    // Try exact match first
    const exactSnapshot = this.temporalData.snapshots.get(timestamp);
    if (exactSnapshot) {
      return exactSnapshot;
    }
    
    // Find closest snapshot
    const targetTime = new Date(timestamp).getTime();
    let closestSnapshot: SystemStateSnapshot | null = null;
    let closestDistance = Infinity;
    
    for (const [snapshotTime, snapshot] of this.temporalData.snapshots) {
      const distance = Math.abs(new Date(snapshotTime).getTime() - targetTime);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestSnapshot = snapshot;
      }
    }
    
    return closestSnapshot;
  }

  /**
   * Get nodes at specific time
   */
  public getNodesAtTime(timestamp: string): VisualizationNode[] {
    const nodeMap = this.findClosestHistoricalData(timestamp, this.temporalData.nodeHistory);
    return nodeMap ? Array.from(nodeMap.values()) : [];
  }

  /**
   * Get edges at specific time
   */
  public getEdgesAtTime(timestamp: string): VisualizationEdge[] {
    const edgeMap = this.findClosestHistoricalData(timestamp, this.temporalData.edgeHistory);
    return edgeMap ? Array.from(edgeMap.values()) : [];
  }

  /**
   * Get membranes at specific time
   */
  public getMembranesAtTime(timestamp: string): MembraneVisualization[] {
    const membraneMap = this.findClosestHistoricalData(timestamp, this.temporalData.membraneHistory);
    return membraneMap ? Array.from(membraneMap.values()) : [];
  }

  /**
   * Get events in a time range
   */
  public getEventsInRange(startTime: string, endTime: string): TimelineEvent[] {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    
    return this.temporalData.events.filter(event => {
      const eventTime = new Date(event.timestamp).getTime();
      return eventTime >= start && eventTime <= end;
    });
  }

  /**
   * Start playback from current time
   */
  public startPlayback(): void {
    if (this.state.isPlaying) return;
    
    this.state.isPlaying = true;
    this.playbackTimer = setInterval(() => {
      this.advanceTime();
    }, 1000 / this.state.playbackSpeed);
    
    this.emit('playbackStarted', { state: this.state });
  }

  /**
   * Stop playback
   */
  public stopPlayback(): void {
    if (!this.state.isPlaying) return;
    
    this.state.isPlaying = false;
    if (this.playbackTimer) {
      clearInterval(this.playbackTimer);
      this.playbackTimer = null;
    }
    
    this.emit('playbackStopped', { state: this.state });
  }

  /**
   * Toggle playback
   */
  public togglePlayback(): void {
    if (this.state.isPlaying) {
      this.stopPlayback();
    } else {
      this.startPlayback();
    }
  }

  /**
   * Set playback speed
   */
  public setPlaybackSpeed(speed: number): void {
    this.state.playbackSpeed = Math.max(0.1, Math.min(10, speed));
    
    // Restart playback with new speed if currently playing
    if (this.state.isPlaying) {
      this.stopPlayback();
      this.startPlayback();
    }
    
    this.emit('speedChanged', { speed: this.state.playbackSpeed });
  }

  /**
   * Step forward by one event
   */
  public stepForward(): void {
    const currentTime = new Date(this.state.currentTime).getTime();
    const nextEvent = this.temporalData.events.find(event => 
      new Date(event.timestamp).getTime() > currentTime
    );
    
    if (nextEvent) {
      this.seekTo(nextEvent.timestamp);
    }
  }

  /**
   * Step backward by one event
   */
  public stepBackward(): void {
    const currentTime = new Date(this.state.currentTime).getTime();
    const previousEvent = [...this.temporalData.events]
      .reverse()
      .find(event => new Date(event.timestamp).getTime() < currentTime);
    
    if (previousEvent) {
      this.seekTo(previousEvent.timestamp);
    }
  }

  /**
   * Get current time travel state
   */
  public getState(): TimeTravelState {
    return { ...this.state };
  }

  /**
   * Check if currently playing
   */
  public isPlaying(): boolean {
    return this.state.isPlaying;
  }

  /**
   * Get timeline events for visualization
   */
  public getTimelineVisualization(): any {
    const events = this.temporalData.events.map(event => ({
      timestamp: event.timestamp,
      type: event.type,
      importance: event.importance,
      description: event.description,
      affected: event.affected
    }));
    
    const snapshots = Array.from(this.temporalData.snapshots.keys()).map(timestamp => ({
      timestamp,
      type: 'snapshot',
      importance: 0.7
    }));
    
    return {
      events: [...events, ...snapshots].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ),
      currentTime: this.state.currentTime,
      timeRange: this.state.timeRange
    };
  }

  /**
   * Analyze temporal patterns
   */
  public analyzeTemporalPatterns(): any {
    const analysis = {
      eventFrequency: this.analyzeEventFrequency(),
      stateChanges: this.analyzeStateChanges(),
      cyclic: this.detectCyclicPatterns(),
      trends: this.analyzeTrends(),
      anomalies: this.detectAnomalies()
    };
    
    return analysis;
  }

  /**
   * Export temporal data
   */
  public exportTemporalData(): any {
    return {
      snapshots: Object.fromEntries(this.temporalData.snapshots),
      events: this.temporalData.events,
      nodeHistory: this.exportHistoryMap(this.temporalData.nodeHistory),
      edgeHistory: this.exportHistoryMap(this.temporalData.edgeHistory),
      membraneHistory: this.exportHistoryMap(this.temporalData.membraneHistory),
      timeRange: this.state.timeRange,
      totalDuration: this.getTimeRangeMs()
    };
  }

  /**
   * Import temporal data
   */
  public importTemporalData(data: any): void {
    if (data.snapshots) {
      this.temporalData.snapshots = new Map(Object.entries(data.snapshots));
    }
    
    if (data.events) {
      this.temporalData.events = data.events;
    }
    
    if (data.nodeHistory) {
      this.temporalData.nodeHistory = this.importHistoryMap(data.nodeHistory);
    }
    
    if (data.edgeHistory) {
      this.temporalData.edgeHistory = this.importHistoryMap(data.edgeHistory);
    }
    
    if (data.membraneHistory) {
      this.temporalData.membraneHistory = this.importHistoryMap(data.membraneHistory);
    }
    
    this.updateAvailableSnapshots();
    this.updateTimeRange();
    
    this.emit('dataImported', { data });
  }

  // ========== Private Methods ==========

  private updateAvailableSnapshots(): void {
    this.state.availableSnapshots = Array.from(this.temporalData.snapshots.keys())
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }

  private updateTimeRange(): void {
    const timestamps = [
      ...Array.from(this.temporalData.snapshots.keys()),
      ...this.temporalData.events.map(e => e.timestamp)
    ].map(t => new Date(t).getTime()).filter(t => !isNaN(t));
    
    if (timestamps.length > 0) {
      const minTime = Math.min(...timestamps);
      const maxTime = Math.max(...timestamps);
      
      this.state.timeRange = {
        start: new Date(minTime).toISOString(),
        end: new Date(maxTime).toISOString()
      };
    }
  }

  private getTimeRangeMs(): number {
    return new Date(this.state.timeRange.end).getTime() - 
           new Date(this.state.timeRange.start).getTime();
  }

  private isValidTimestamp(timestamp: string): boolean {
    const time = new Date(timestamp).getTime();
    const startTime = new Date(this.state.timeRange.start).getTime();
    const endTime = new Date(this.state.timeRange.end).getTime();
    
    return !isNaN(time) && time >= startTime && time <= endTime;
  }

  private findClosestHistoricalData<T>(timestamp: string, historyMap: Map<string, Map<string, T>>): Map<string, T> | null {
    const targetTime = new Date(timestamp).getTime();
    let closestTime: string | null = null;
    let closestDistance = Infinity;
    
    for (const historyTimestamp of historyMap.keys()) {
      const distance = Math.abs(new Date(historyTimestamp).getTime() - targetTime);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestTime = historyTimestamp;
      }
    }
    
    return closestTime ? historyMap.get(closestTime) || null : null;
  }

  private advanceTime(): void {
    const currentTimeMs = new Date(this.state.currentTime).getTime();
    const endTimeMs = new Date(this.state.timeRange.end).getTime();
    
    if (currentTimeMs >= endTimeMs) {
      this.stopPlayback();
      return;
    }
    
    // Advance by 1 second * playback speed
    const nextTimeMs = currentTimeMs + (1000 * this.state.playbackSpeed);
    const nextTime = new Date(Math.min(nextTimeMs, endTimeMs)).toISOString();
    
    this.state.currentTime = nextTime;
    this.emit('timeChange', { timestamp: nextTime, state: this.state });
  }

  private analyzeEventFrequency(): any {
    const eventCounts: Record<string, number> = {};
    const hourlyFrequency: Record<string, number> = {};
    
    this.temporalData.events.forEach(event => {
      // Count by type
      eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
      
      // Count by hour
      const hour = new Date(event.timestamp).getHours();
      const hourKey = `${hour}:00`;
      hourlyFrequency[hourKey] = (hourlyFrequency[hourKey] || 0) + 1;
    });
    
    return {
      byType: eventCounts,
      byHour: hourlyFrequency,
      totalEvents: this.temporalData.events.length,
      averagePerHour: this.temporalData.events.length / 24
    };
  }

  private analyzeStateChanges(): any {
    const snapshots = Array.from(this.temporalData.snapshots.values())
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    const changes = [];
    
    for (let i = 1; i < snapshots.length; i++) {
      const prev = snapshots[i - 1];
      const curr = snapshots[i];
      
      changes.push({
        timestamp: curr.timestamp,
        memoryChange: curr.memoryUsage.totalItems - prev.memoryUsage.totalItems,
        taskChange: curr.taskExecution.completedTasks - prev.taskExecution.completedTasks,
        aiChange: curr.aiActivity.tokenUsage - prev.aiActivity.tokenUsage
      });
    }
    
    return {
      changes,
      totalChanges: changes.length,
      averageMemoryChange: changes.reduce((sum, c) => sum + Math.abs(c.memoryChange), 0) / changes.length || 0
    };
  }

  private detectCyclicPatterns(): any {
    // Simple cyclic pattern detection
    const eventTypes = this.temporalData.events.map(e => e.type);
    const patterns: Record<string, number> = {};
    
    // Look for repeating sequences
    for (let length = 2; length <= 5; length++) {
      for (let i = 0; i <= eventTypes.length - length * 2; i++) {
        const pattern = eventTypes.slice(i, i + length).join(',');
        const nextPattern = eventTypes.slice(i + length, i + length * 2).join(',');
        
        if (pattern === nextPattern) {
          patterns[pattern] = (patterns[pattern] || 0) + 1;
        }
      }
    }
    
    return {
      repeatingPatterns: patterns,
      cyclicityScore: Object.keys(patterns).length / eventTypes.length
    };
  }

  private analyzeTrends(): any {
    const snapshots = Array.from(this.temporalData.snapshots.values())
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    if (snapshots.length < 2) {
      return { insufficient_data: true };
    }
    
    const memoryTrend = this.calculateTrend(snapshots.map(s => s.memoryUsage.totalItems));
    const taskTrend = this.calculateTrend(snapshots.map(s => s.taskExecution.completedTasks));
    const aiTrend = this.calculateTrend(snapshots.map(s => s.aiActivity.tokenUsage));
    
    return {
      memory: { trend: memoryTrend > 0.1 ? 'increasing' : memoryTrend < -0.1 ? 'decreasing' : 'stable', value: memoryTrend },
      tasks: { trend: taskTrend > 0.1 ? 'increasing' : taskTrend < -0.1 ? 'decreasing' : 'stable', value: taskTrend },
      ai: { trend: aiTrend > 0.1 ? 'increasing' : aiTrend < -0.1 ? 'decreasing' : 'stable', value: aiTrend }
    };
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  private detectAnomalies(): any {
    const events = this.temporalData.events;
    const anomalies = [];
    
    // Detect time gaps larger than normal
    for (let i = 1; i < events.length; i++) {
      const timeDiff = new Date(events[i].timestamp).getTime() - new Date(events[i - 1].timestamp).getTime();
      const averageGap = this.getTimeRangeMs() / events.length;
      
      if (timeDiff > averageGap * 3) {
        anomalies.push({
          type: 'time_gap',
          timestamp: events[i].timestamp,
          description: `Unusually large time gap: ${timeDiff}ms`,
          severity: timeDiff > averageGap * 5 ? 'high' : 'medium'
        });
      }
    }
    
    // Detect unusual event clusters
    const eventClusters = this.findEventClusters();
    eventClusters.forEach(cluster => {
      if (cluster.density > 10) {
        anomalies.push({
          type: 'event_cluster',
          timestamp: cluster.startTime,
          description: `High event density: ${cluster.density} events in short period`,
          severity: 'medium'
        });
      }
    });
    
    return {
      anomalies,
      totalAnomalies: anomalies.length,
      anomalyRate: anomalies.length / events.length
    };
  }

  private findEventClusters(): any[] {
    const clusters = [];
    const windowSize = 60000; // 1 minute window
    
    let windowStart = 0;
    while (windowStart < this.temporalData.events.length) {
      const windowTime = new Date(this.temporalData.events[windowStart].timestamp).getTime();
      let windowEnd = windowStart;
      
      while (windowEnd < this.temporalData.events.length) {
        const eventTime = new Date(this.temporalData.events[windowEnd].timestamp).getTime();
        if (eventTime - windowTime > windowSize) break;
        windowEnd++;
      }
      
      const eventsInWindow = windowEnd - windowStart;
      if (eventsInWindow > 1) {
        clusters.push({
          startTime: this.temporalData.events[windowStart].timestamp,
          endTime: this.temporalData.events[windowEnd - 1].timestamp,
          eventCount: eventsInWindow,
          density: eventsInWindow / (windowSize / 1000) // events per second
        });
      }
      
      windowStart++;
    }
    
    return clusters;
  }

  private exportHistoryMap<T>(historyMap: Map<string, Map<string, T>>): any {
    const exported: any = {};
    for (const [timestamp, dataMap] of historyMap) {
      exported[timestamp] = Object.fromEntries(dataMap);
    }
    return exported;
  }

  private importHistoryMap<T>(data: any): Map<string, Map<string, T>> {
    const imported = new Map<string, Map<string, T>>();
    for (const [timestamp, dataObj] of Object.entries(data)) {
      imported.set(timestamp, new Map(Object.entries(dataObj as any)));
    }
    return imported;
  }

  // ========== Event System ==========

  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // ========== Public Event Handlers ==========

  public onTimeChange(callback: (data: { timestamp: string, state: TimeTravelState }) => void): void {
    this.on('timeChange', callback);
  }

  public onSnapshotAdded(callback: (data: { snapshot: SystemStateSnapshot }) => void): void {
    this.on('snapshotAdded', callback);
  }

  public onEventAdded(callback: (data: { event: TimelineEvent }) => void): void {
    this.on('eventAdded', callback);
  }

  public onPlaybackStarted(callback: (data: { state: TimeTravelState }) => void): void {
    this.on('playbackStarted', callback);
  }

  public onPlaybackStopped(callback: (data: { state: TimeTravelState }) => void): void {
    this.on('playbackStopped', callback);
  }

  public onSpeedChanged(callback: (data: { speed: number }) => void): void {
    this.on('speedChanged', callback);
  }

  // ========== Cleanup ==========

  public destroy(): void {
    this.stopPlayback();
    this.eventListeners.clear();
    this.temporalData.snapshots.clear();
    this.temporalData.events = [];
    this.temporalData.nodeHistory.clear();
    this.temporalData.edgeHistory.clear();
    this.temporalData.membraneHistory.clear();
  }
}