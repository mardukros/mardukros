import { useState, useEffect } from 'react'
import { Dashboard } from './components/Dashboard'
import { useWebSocket } from './useWebSocket'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [status, setStatus] = useState<string>('Connecting...')
  const [messages, setMessages] = useState<Array<{type: string, text: string, timestamp: string}>>([])
  const [input, setInput] = useState<string>('')
  const [systemInfo, setSystemInfo] = useState<any>(null)
  const [showDashboard, setShowDashboard] = useState<boolean>(false)

  // WebSocket managed via custom hook with auto-reconnect logic
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  const { ws } = useWebSocket(wsUrl, {
    onOpen: () => setStatus('Neural interface active'),
    onClose: () => setStatus('Neural interface disconnected'),
    onError: () => setStatus('Neural interface disconnected'),
    onMessage: (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [
          ...prev,
          {
            type: data.type || 'system',
            text: data.message,
            timestamp: data.timestamp || new Date().toISOString(),
          },
        ]);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    },
  });

  // Fetch server status once on mount
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setSystemInfo(data);
        setStatus('Connected');
      })
      .catch((err) => {
        console.error('Error fetching status:', err);
        setStatus('Error connecting to server');
      });
  }, []);

  const sendMessage = () => {
    if (!input.trim() || !ws) return;

    ws.send(input);
    setMessages((prev) => [...prev, {
      type: 'user',
      text: input,
      timestamp: new Date().toISOString(),
    }]);
    setInput('');
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  }

  return (
    <div className="marduk-container">
      <header className="marduk-header">
        <h1>Marduk Cognitive System</h1>
        <div className="system-status">
          <span className={`status-indicator ${status === 'Neural interface active' ? 'active' : 'inactive'}`}></span>
          <span>{status}</span>
        </div>
      </header>

      {systemInfo && (
        <div className="system-info">
          <p><strong>System Name:</strong> {systemInfo.systemName}</p>
          <p><strong>Version:</strong> {systemInfo.version}</p>
          <p><strong>Last Updated:</strong> {new Date(systemInfo.timestamp).toLocaleString()}</p>
        </div>
      )}

      <div className="message-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            <div className="message-header">
              <span className="message-type">{msg.type.toUpperCase()}</span>
              <span className="message-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="message-content">{msg.text}</div>
          </div>
        ))}
      </div>

      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter message to Marduk cognitive core..."
          className="message-input"
        />
        <button onClick={sendMessage} className="send-button">Send</button>
      </div>

      <div className="system-metrics">
        <button onClick={() => setCount((count) => count + 1)} className="metric-button">
          Cognitive Cycles: {count}
        </button>
        <button onClick={() => setShowDashboard(!showDashboard)} className="dashboard-button">
          {showDashboard ? 'Hide Dashboard' : 'Show Dashboard'}
        </button>
      </div>
      
      {showDashboard && <Dashboard websocket={ws} />}
    </div>
  )
}

export default App
