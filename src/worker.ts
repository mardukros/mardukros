// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

import { Router } from 'itty-router';
import { MemorySystemFactory } from './core/memory/memory-factory.js';
import { AiCoordinator } from './core/ai/ai-coordinator.js';
import { logger } from './core/utils/logger.js';

// Create router
const router = Router();

// Initialize core components
const memoryFactory = MemorySystemFactory.getInstance();
const aiCoordinator = new AiCoordinator();

// Health check endpoint
router.get('/health', async () => {
  try {
    const monitor = memoryFactory.getMonitor();
    monitor.updateStats();
    const stats = monitor.getAllStats();

    return new Response(JSON.stringify({
      status: 'healthy',
      memory: stats,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Memory query endpoint
router.post('/memory/query', async (request: Request) => {
  try {
    const body = await request.json() as { subsystem: string; query: any };
    const response = await memoryFactory.getSubsystem(body.subsystem).query(body.query);
    
    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error('Memory query error:', error as Error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// AI processing endpoint
router.post('/ai/process', async (request: Request) => {
  try {
    const body = await request.json() as { query: any; options?: any };
    const response = await aiCoordinator.processQuery(body.query, body.options);
    
    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error('AI processing error:', error as Error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// 404 handler
router.all('*', () => new Response('Not Found', { status: 404 }));

interface Env {
  [key: string]: any;
}

// Export worker
export default {
  async fetch(request: Request, env: Env, ctx: { waitUntil: (promise: Promise<any>) => void }): Promise<Response> {
    // Add CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    // Handle OPTIONS requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    try {
      // Handle the request
      const response = await router.handle(request);
      
      // Add CORS headers to response
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      logger.error('Worker error:', error as Error);
      return new Response(JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });
    }
  }
};
