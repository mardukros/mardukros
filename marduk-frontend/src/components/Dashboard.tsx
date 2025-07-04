import { useState, useEffect } from 'react';
import './Dashboard.css';

interface SubsystemMetrics {
  memory: {
    itemCounts: {
      declarative: number;
      episodic: number;
      procedural: number;
      semantic: number;
      total: number;
    };
    accessEfficiency: number;
    remainingCapacity: string | number;
  };
  task: {
    scheduledTasks: number;
    averageExecutionTime: number;
    throughput: number;
  };
  ai: {
    availableModels: string[];
    tokenUsage: number;
    averageResponseTime: number;
  };
  autonomy: {
    selfImprovementActive: boolean;
    improvementsImplemented: number;
    lastImprovement: string;
  };
}

interface DashboardProps {
  websocket: WebSocket | null;
  /**
   * Optional callback to notify parent of errors (e.g. for toast notifications)
   */
  notify?: (msg: string) => void;
}

export function Dashboard({ websocket, notify }: DashboardProps) {
  const [metrics, setMetrics] = useState<SubsystemMetrics | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!websocket) return;

    // Set up message handler for metrics updates
    const messageHandler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'metrics') {
          setMetrics(data.metrics);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      } catch (error) {
        console.error('Error parsing metrics:', error);
        setError('Error parsing metrics data');
        if (notify) notify('Error parsing metrics data');
      }
    };

    websocket.addEventListener('message', messageHandler);

    // Request initial metrics
    if (websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({ type: 'request', action: 'getMetrics' }));
    }

    // Set up interval to request metrics every 5 seconds
    const interval = setInterval(() => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({ type: 'request', action: 'getMetrics' }));
      }
    }, 5000);

    return () => {
      websocket.removeEventListener('message', messageHandler);
      clearInterval(interval);
    };
  }, [websocket, notify]);

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  if (!metrics) {
    return <div className="dashboard-loading">Loading cognitive metrics...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Marduk Cognitive Dashboard</h2>
        <div className="last-updated">Last updated: {lastUpdated}</div>
      </div>

      <div className="metrics-grid">
        {/* Memory Subsystem */}
        <div className="metric-card memory">
          <h3>Memory Subsystem</h3>
          <div className="metric-content">
            <div className="metric-row">
              <span>Declarative Items:</span>
              <span>{metrics.memory.itemCounts.declarative}</span>
            </div>
            <div className="metric-row">
              <span>Episodic Items:</span>
              <span>{metrics.memory.itemCounts.episodic}</span>
            </div>
            <div className="metric-row">
              <span>Procedural Items:</span>
              <span>{metrics.memory.itemCounts.procedural}</span>
            </div>
            <div className="metric-row">
              <span>Semantic Items:</span>
              <span>{metrics.memory.itemCounts.semantic}</span>
            </div>
            <div className="metric-row total">
              <span>Total Items:</span>
              <span>{metrics.memory.itemCounts.total}</span>
            </div>
            <div className="metric-row">
              <span>Access Efficiency:</span>
              <span>{(metrics.memory.accessEfficiency * 100).toFixed(1)}%</span>
            </div>
            <div className="metric-row">
              <span>Remaining Capacity:</span>
              <span>{metrics.memory.remainingCapacity}</span>
            </div>
          </div>
        </div>

        {/* Task Subsystem */}
        <div className="metric-card task">
          <h3>Task Subsystem</h3>
          <div className="metric-content">
            <div className="metric-row">
              <span>Scheduled Tasks:</span>
              <span>{metrics.task.scheduledTasks}</span>
            </div>
            <div className="metric-row">
              <span>Average Execution:</span>
              <span>{metrics.task.averageExecutionTime.toFixed(2)} ms</span>
            </div>
            <div className="metric-row">
              <span>Throughput:</span>
              <span>{metrics.task.throughput.toFixed(1)} tasks/min</span>
            </div>
          </div>
        </div>

        {/* AI Subsystem */}
        <div className="metric-card ai">
          <h3>AI Subsystem</h3>
          <div className="metric-content">
            <div className="metric-row">
              <span>Available Models:</span>
              <span>{metrics.ai.availableModels.join(', ')}</span>
            </div>
            <div className="metric-row">
              <span>Token Usage:</span>
              <span>{metrics.ai.tokenUsage.toLocaleString()}</span>
            </div>
            <div className="metric-row">
              <span>Response Time:</span>
              <span>{metrics.ai.averageResponseTime.toFixed(0)} ms</span>
            </div>
          </div>
        </div>

        {/* Autonomy Subsystem */}
        <div className="metric-card autonomy">
          <h3>Autonomy Subsystem</h3>
          <div className="metric-content">
            <div className="metric-row">
              <span>Self-Improvement:</span>
              <span className={metrics.autonomy.selfImprovementActive ? 'active-status' : 'inactive-status'}>
                {metrics.autonomy.selfImprovementActive ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <div className="metric-row">
              <span>Improvements:</span>
              <span>{metrics.autonomy.improvementsImplemented}</span>
            </div>
            <div className="metric-row">
              <span>Last Improvement:</span>
              <span>{metrics.autonomy.lastImprovement ? new Date(metrics.autonomy.lastImprovement).toLocaleString() : 'None'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
