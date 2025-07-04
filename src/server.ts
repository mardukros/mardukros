import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { logger } from './core/utils/logger.js';
import { CognitiveWebSocket } from './types/websocket-types.js';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import { introspectionQuery, graphql } from 'graphql';
import schema from './graphql/schema.js';
import resolvers from './graphql/resolvers.js';
import { getCachedIntrospectionResult, setCachedIntrospectionResult, invalidateCacheOnSchemaChange } from './graphql/cache.js';

// Create Express app and HTTP server
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// WebSocket heartbeat mechanism to detect dead connections
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    const cognitiveWs = ws as CognitiveWebSocket;
    if (cognitiveWs.isAlive === false) {
      logger.info('Terminating inactive WebSocket connection');
      return cognitiveWs.terminate();
    }

    cognitiveWs.isAlive = false;
    try {
      cognitiveWs.ping();
    } catch (error) {
      logger.error('Error sending ping:', error);
    }
  });
}, 30000); // Check every 30 seconds

// Clean up interval on server close
wss.on('close', () => {
  clearInterval(heartbeatInterval);
  logger.info('WebSocket server closed, heartbeat terminated');
});

// Enable CORS for all routes
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Basic API endpoint
app.get('/api/status', (req: express.Request, res: express.Response) => {
  res.json({
    status: 'online',
    systemName: 'Marduk Cognitive Core',
    version: '0.0.1',
    timestamp: new Date().toISOString()
  });
});

// Query endpoint that connects to AI Coordinator
app.post('/api/query', (req: express.Request, res: express.Response) => {
  try {
    const { query } = req.body;

    if (!query) {
      res.status(400).json({ error: 'Query parameter is required' });
      return;
    }

    // Here we would integrate with the AI and Memory systems
    // This is a placeholder response
    const response = {
      result: `Processed query: ${query}`,
      timestamp: new Date().toISOString(),
      metadata: {
        processingTime: Math.random() * 100,
        memoryAccessed: true
      }
    };

    res.json(response);
  } catch (error) {
    logger.error('Error processing query:', error);
    res.status(500).json({ error: 'Internal cognitive processing error' });
  }
});

// GraphQL schema definition
const schema = buildSchema(`
  type Query {
    __schema: __Schema
    __type(name: String!): __Type
  }
`);

// GraphQL resolvers
const root = {
  __schema: async () => {
    const cachedResult = getCachedIntrospectionResult('__schema');
    if (cachedResult) {
      return cachedResult;
    }
    const result = await graphql(schema, introspectionQuery);
    setCachedIntrospectionResult('__schema', result.data.__schema);
    return result.data.__schema;
  },
  __type: async ({ name }) => {
    const cachedResult = getCachedIntrospectionResult(`__type:${name}`);
    if (cachedResult) {
      return cachedResult;
    }
    const result = await graphql(schema, introspectionQuery);
    const type = result.data.__schema.types.find(type => type.name === name);
    setCachedIntrospectionResult(`__type:${name}`, type);
    return type;
  }
};

// GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true
}));

// Enhanced WebSocket handling with comprehensive error handling
wss.on('connection', (ws, req) => {
  const cognitiveWs = ws as CognitiveWebSocket;
  const clientAddress = req.socket.remoteAddress || 'unknown';
  logger.info(`⚡ New cognitive connection established from ${clientAddress}`);

  // Connection health check
  cognitiveWs.isAlive = true;
  cognitiveWs.on('pong', () => { cognitiveWs.isAlive = true; });

  // Send welcome message with improved error handling
  try {
    cognitiveWs.send(JSON.stringify({
      type: 'system',
      message: 'Welcome to Marduk Cognitive Core - Neural interface active',
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    logger.error('Error sending welcome message:', error);
  }

  // Message handler with error management
  cognitiveWs.on('message', (message: WebSocket.Data) => {
    try {
      logger.info(`Received neural transmission: ${message}`);
      const parsedMessage = JSON.parse(message.toString());

      // Process message and respond
      cognitiveWs.send(JSON.stringify({
        type: 'response',
        message: `Neural echo: ${parsedMessage.query || message}`,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      logger.error('Error processing WebSocket message:', error);
      try {
        cognitiveWs.send(JSON.stringify({
          type: 'error',
          message: 'Neural transmission error occurred',
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }));
      } catch (sendError) {
        logger.error('Failed to send error response:', sendError);
      }
    }
  });

  cognitiveWs.on('error', (error: Error) => {
    logger.error('WebSocket error:', error);
  });

  cognitiveWs.on('close', (code: number, reason: string) => {
    logger.info(`Neural connection closed: ${code} - ${reason || 'No reason provided'}`);
  });
});

// Start the server with proper binding to all interfaces
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0'; // Bind to all network interfaces

// Explicitly log any server boot errors for easier debugging
process.on('uncaughtException', (error: Error) => {
  logger.error(`⚠️ FATAL SYSTEM ERROR: ${error.message}`, error);
  logger.error(`⚠️ Stack trace: ${error.stack}`);
});

// Improved server startup with better error handling
server.listen(PORT, HOST, () => {
  const localAddress = `http://localhost:${PORT}`;
  const externalAddress = `http://${HOST}:${PORT}`;
  const wsAddress = `ws://${HOST}:${PORT}/ws`;

  logger.info(`⚡ Marduk Cognitive Core server running on port ${PORT}`);
  logger.info(`⚡ Neural interface bound to all interfaces (${HOST})`);
  logger.info(`⚡ Local access via ${localAddress}`);
  logger.info(`⚡ External access via ${externalAddress}`);
  logger.info(`⚡ WebSocket endpoint available at ${wsAddress}`);
});

// Add better error handling for the HTTP server
server.on('error', (error: NodeJS.ErrnoException) => {
  logger.error(`⚠️ Server error encountered: ${error.message}`);
  if (error.code === 'EADDRINUSE') {
    logger.error(`⚠️ Port ${PORT} is already in use. Neural pathways blocked!`);
  }
});

export default server;
