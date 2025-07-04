import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { Dashboard } from './components/Dashboard'
import { useWebSocket } from './useWebSocket'
import { Toaster, toast } from 'react-hot-toast'
import './App.css'

// Theme context
const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

function useTheme() {
  return useContext(ThemeContext);
}

function App() {
  // Theming
  const [theme, setTheme] = useState<'light' | 'dark'>(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  useEffect(() => {
    document.body.classList.toggle('dark-theme', theme === 'dark');
  }, [theme]);

  const [count, setCount] = useState(0)
  const [status, setStatus] = useState<string>('Connecting...')
  const [messages, setMessages] = useState<Array<{type: string, text: string, timestamp: string}>>([])
  const [input, setInput] = useState<string>('')
  const [systemInfo, setSystemInfo] = useState<any>(null)
  const [showDashboard, setShowDashboard] = useState<boolean>(false)

  // Command history state
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

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
    if (!input.trim()) {
      toast.error('Cannot send an empty or whitespace-only message.');
      return;
    }
    if (!ws) {
      toast.error('WebSocket is not connected.');
      return;
    }
    ws.send(input);
    setMessages((prev) => [...prev, {
      type: 'user',
      text: input,
      timestamp: new Date().toISOString(),
    }]);
    setHistory((prev) => [...prev, input]);
    setHistoryIndex(-1);
    toast.success('Message sent!');
    setInput('');
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    } else if (e.key === 'ArrowUp') {
      // Show previous command in history
      if (history.length > 0) {
        setHistoryIndex((prev) => {
          const nextIndex = prev < 0 ? history.length - 1 : Math.max(0, prev - 1);
          setInput(history[nextIndex]);
          return nextIndex;
        });
      }
    } else if (e.key === 'ArrowDown') {
      // Show next command in history
      if (history.length > 0) {
        setHistoryIndex((prev) => {
          if (prev < 0) return -1;
          const nextIndex = prev + 1;
          if (nextIndex >= history.length) {
            setInput('');
            return -1;
          } else {
            setInput(history[nextIndex]);
            return nextIndex;
          }
        });
      }
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Toaster position="top-right" />
      <div className="marduk-container">
        <header className="marduk-header">
          <h1>Marduk Cognitive Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="system-status">
              <span className={`status-indicator${ws ? ' active' : ''}`} />
              <span>{ws ? 'Connected' : 'Disconnected'}</span>
            </div>
            <button
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              onClick={toggleTheme}
              style={{
                marginLeft: 12,
                padding: '6px 14px',
                borderRadius: 6,
                border: '1px solid var(--border-main)',
                background: 'none',
                color: 'var(--text-main)',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 500,
              }}
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
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
        {showDashboard && <Dashboard websocket={ws} notify={(msg) => toast.error(msg)} />}
      </div>
    </ThemeContext.Provider>
  );
}

export default App
