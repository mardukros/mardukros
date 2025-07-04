const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const url = require('url');
const logger = require('./logger');

// Configuration
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Bind to all interfaces for external access

// MIME types for serving static files
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

// Create the HTTP server
const server = http.createServer((req, res) => {
  // Parse the URL
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // If path is '/' serve index.html
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // Health check endpoint
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }
  // API endpoints
  if (pathname.startsWith('/api/')) {
    handleApiRequest(req, res, pathname);
    return;
  }
  
  // Determine the file path
  const filePath = path.join(__dirname, 'public', pathname);
  
  // Get the file extension
  const extname = path.extname(filePath);
  
  // Set the content type based on the file extension
  const contentType = MIME_TYPES[extname] || 'text/plain';
  
  // Read the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success - send the file
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Handle API requests
function handleApiRequest(req, res, pathname) {
  res.setHeader('Content-Type', 'application/json');
  
  if (pathname === '/api/status') {
    const params = new URLSearchParams(url.parse(req.url).query);
    const subsystem = params.get('subsystem');
    
    // Generate response based on requested subsystem
    let responseData = { status: 'ok' };
    
    if (subsystem) {
      responseData.visualization = generateVisualization(subsystem);
    }
    
    res.writeHead(200);
    res.end(JSON.stringify(responseData));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'API endpoint not found' }));
  }
}

// Generate visualizations for different subsystems
function generateVisualization(subsystem) {
  let diagram = '';
  
  switch(subsystem) {
    case 'memory':
      diagram = `
╔════════════════════════════ MEMORY SUBSYSTEM ARCHITECTURE ═════════════════════════╗
║                                                                                     ║
║  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐  ║
║  │    Declarative     │  │     Episodic       │  │    Procedural      │  │     Semantic       │  ║
║  │      Memory        │  │      Memory        │  │      Memory        │  │      Memory        │  ║
║  └────────────────────┘  └────────────────────┘  └────────────────────┘  └────────────────────┘  ║
║                                                                                     ║
║  ┌────────────────────────────────────────────────────────────────────────────┐    ║
║  │                            Memory Coordinator                              │    ║
║  └────────────────────────────────────────────────────────────────────────────┘    ║
║                                                                                     ║
╚═════════════════════════════════════════════════════════════════════════════════════╝`;
      break;
    case 'task':
      diagram = `
╔════════════════════════════ TASK SUBSYSTEM ARCHITECTURE ══════════════════════════╗
║                                                                                    ║
║  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐           ║
║  │  Task Scheduler    │  │   Task Manager     │  │  Task Validator    │           ║
║  └────────────────────┘  └────────────────────┘  └────────────────────┘           ║
║                                                                                    ║
║  ┌────────────────────┐  ┌────────────────────────────────────────────────────┐   ║
║  │ Deferred Tasks     │  │              Temporal Recursion Engine             │   ║
║  └────────────────────┘  └────────────────────────────────────────────────────┘   ║
║                                                                                    ║
╚════════════════════════════════════════════════════════════════════════════════════╝`;
      break;
    case 'ai':
      diagram = `
╔════════════════════════════ AI SUBSYSTEM ARCHITECTURE ═══════════════════════════╗
║                                                                                   ║
║  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐          ║
║  │  AI Coordinator    │  │   Model Router     │  │  Context Manager   │          ║
║  └────────────────────┘  └────────────────────┘  └────────────────────┘          ║
║                                                                                   ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │                            AI Client Interfaces                            │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                   ║
╚═══════════════════════════════════════════════════════════════════════════════════╝`;
      break;
    case 'autonomy':
      diagram = `
╔════════════════════════════ AUTONOMY SUBSYSTEM ARCHITECTURE ═══════════════════════╗
║                                                                                     ║
║  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐            ║
║  │  Code Analyzer     │  │  Self-Optimizer    │  │ Heartbeat Monitor  │            ║
║  └────────────────────┘  └────────────────────┘  └────────────────────┘            ║
║                                                                                     ║
║  ┌────────────────────────────────────────────────────────────────────────────┐    ║
║  │                         Meta-Cognition Engine                              │    ║
║  └────────────────────────────────────────────────────────────────────────────┘    ║
║                                                                                     ║
╚═════════════════════════════════════════════════════════════════════════════════════╝`;
      break;
    default:
      diagram = `
╔════════════════════════════ MARDUK COGNITIVE ARCHITECTURE ═══════════════════════════╗
║                                                                                       ║
║      ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ║
║      │   Memory    │────→│    Task     │────→│     AI      │────→│  Autonomy   │     ║
║      │   System    │←────│   System    │←────│   System    │←────│   System    │     ║
║      └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘     ║
║             ↑                   ↑                   ↑                   ↑             ║
║             ╰───────────────────┼───────────────────┼───────────────────╯             ║
║                                 │                   │                                 ║
║                         ┌───────┴───────┐   ┌───────┴───────┐                         ║
║                         │  Deliberation │←──│ Meta-Cognition│                         ║
║                         │     Cycle     │──→│    System     │                         ║
║                         └───────────────┘   └───────────────┘                         ║
║                                                                                       ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝`;
  }
  
  return { diagram };
}

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

// WebSocket server logic
wss.on('connection', function connection(ws) {
  logger.info('[INFO] Client connected');
  clients.add(ws);
  
  // Send initial message
  ws.send(JSON.stringify({
    type: 'status',
    message: '⚡ Connection established with Marduk Cognitive Core! ⚡'
  }));
  
  // Handle messages from clients
  ws.on('message', function incoming(message) {
    try {
      const data = JSON.parse(message);
      logger.info(`[INFO] Received message: ${data.type}`);
      
      // Handle different message types
      switch (data.type) {
        case 'status':
          // Client status update
          break;
          
        case 'getVisualization':
          if (data.data && data.data.subsystem) {
            const visualization = generateVisualization(data.data.subsystem);
            ws.send(JSON.stringify({
              type: 'visualization',
              data: visualization
            }));
          }
          break;
          
        case 'startCycle':
          // Handle start cycle request
          break;
          
        default:
          logger.info(`[INFO] Unknown message type: ${data.type}`);
      }
    } catch (e) {
      logger.error(`[ERROR] Invalid message format: ${e.message}`);
    }
  });
  
  // Handle disconnection
  ws.on('close', function() {
    logger.info('[INFO] Client disconnected');
    clients.delete(ws);
  });
});

// Simulate sending periodic updates to all clients
function broadcastPeriodicUpdates() {
  setInterval(() => {
    if (clients.size > 0) {
      // Generate random performance metrics
      const performanceData = {
        cpu: `${Math.floor(Math.random() * 20 + 5)}%`,
        memory: `${Math.floor(Math.random() * 200 + 100)}MB`,
        responseTime: `${Math.floor(Math.random() * 50 + 10)}ms`,
        activeTasks: Math.floor(Math.random() * 5 + 1)
      };
      
      // Generate random memory stats
      const memoryData = {
        declarative: Math.floor(Math.random() * 100 + 50),
        episodic: Math.floor(Math.random() * 50 + 20),
        procedural: Math.floor(Math.random() * 30 + 10),
        semantic: Math.floor(Math.random() * 150 + 50)
      };
      
      // Broadcast to all clients
      for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
          // Send performance metrics
          client.send(JSON.stringify({
            type: 'performanceMetrics',
            data: performanceData
          }));
          
          // Send memory statistics
          client.send(JSON.stringify({
            type: 'memoryStats',
            data: memoryData
          }));
        }
      }
    }
  }, 10000); // Update every 10 seconds
}

// Start the server
server.listen(PORT, HOST, () => {
  logger.info('[INFO] WebSocketService initialized');
  logger.info(`⚡ Serving frontend from public directory`);
  logger.info(`⚡ Marduk Cognitive Core server running on port ${PORT}`);
  logger.info(`⚡ Neural interface bound to all interfaces (${HOST})`);
  logger.info(`⚡ Local access via http://localhost:${PORT}`);
  logger.info(`⚡ External access via http://${HOST}:${PORT}`);
  
  // Start periodic broadcasts
  broadcastPeriodicUpdates();
});
