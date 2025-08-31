import { BaseAiClient } from './base-client.js';
import { AiRequest, AiResponse } from '../types/ai-types.js';
import { Logger } from '../../logging/logger.js';

export interface LlamaCppConfig {
  modelPath: string;
  contextSize?: number;
  temperature?: number;
  topP?: number;
  threads?: number;
  gpuLayers?: number;
}

export class LlamaCppClient extends BaseAiClient {
  private static instance: LlamaCppClient;
  private model: any = null;
  private context: any = null;
  private session: any = null;
  private config: LlamaCppConfig;
  private logger: Logger;
  private isInitialized = false;

  private constructor(config: LlamaCppConfig) {
    super();
    this.config = {
      contextSize: 2048,
      temperature: 0.7,
      topP: 0.9,
      threads: 4,
      gpuLayers: 0,
      ...config
    };
    this.logger = Logger.getInstance();
  }

  static getInstance(config?: LlamaCppConfig): LlamaCppClient {
    if (!LlamaCppClient.instance) {
      if (!config) {
        throw new Error('LlamaCppClient configuration required for first initialization');
      }
      LlamaCppClient.instance = new LlamaCppClient(config);
    }
    return LlamaCppClient.instance;
  }

  async initialize(modelPath?: string): Promise<void> {
    try {
      const pathToUse = modelPath || this.config.modelPath;
      if (!pathToUse) {
        throw new Error('Model path is required for initialization');
      }

      this.logger.info('Initializing LlamaCpp with model', { modelPath: pathToUse });

      // Dynamic import of node-llama-cpp due to ESM constraints
      const { LlamaModel, LlamaContext, LlamaChatSession } = await import('node-llama-cpp');

      // Load the model
      this.model = new LlamaModel({
        modelPath: pathToUse,
        gpuLayers: this.config.gpuLayers
      });

      // Create context
      this.context = new LlamaContext({
        model: this.model,
        contextSize: this.config.contextSize,
        threads: this.config.threads
      });

      // Create a chat session for easier interaction
      this.session = new LlamaChatSession({
        context: this.context
      });

      this.isInitialized = true;
      this.logger.info('LlamaCpp initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize LlamaCpp', error instanceof Error ? error : new Error(String(error)));
      throw new Error(`LlamaCpp initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  protected async callApi(request: AiRequest): Promise<AiResponse> {
    if (!this.isInitialized || !this.session) {
      throw new Error('LlamaCpp client not initialized. Call initialize() first.');
    }

    try {
      this.logger.debug('Generating response with LlamaCpp', {
        promptLength: request.prompt.length,
        temperature: request.temperature || this.config.temperature
      });

      // Build the full prompt including system prompt and context
      let fullPrompt = request.prompt;
      if (request.systemPrompt) {
        fullPrompt = `${request.systemPrompt}\n\nUser: ${request.prompt}`;
      }
      if (request.context && request.context.length > 0) {
        const contextStr = request.context.join('\n');
        fullPrompt = `Context:\n${contextStr}\n\n${fullPrompt}`;
      }

      const startTime = Date.now();

      // Generate response using the session with simplified options
      const response = await this.session.prompt(fullPrompt, {
        maxTokens: request.maxTokens || 512,
        temperature: request.temperature || this.config.temperature,
        topP: request.topP || this.config.topP
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Calculate token usage (approximation)
      const promptTokens = Math.ceil(fullPrompt.length / 4); // Rough estimation
      const completionTokens = Math.ceil(response.length / 4);
      const totalTokens = promptTokens + completionTokens;

      this.logger.info('LlamaCpp response generated', {
        responseTime,
        promptTokens,
        completionTokens,
        totalTokens
      });

      return {
        content: response.trim(),
        usage: {
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: totalTokens
        },
        model: 'llama-cpp-local',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error generating LlamaCpp response', error instanceof Error ? error : new Error(String(error)));
      throw new Error(`LlamaCpp generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async cleanup(): Promise<void> {
    try {
      this.logger.info('Cleaning up LlamaCpp resources');
      
      if (this.session) {
        this.session = null;
      }
      
      if (this.context) {
        // Note: node-llama-cpp handles cleanup automatically in most cases
        this.context = null;
      }
      
      if (this.model) {
        this.model = null;
      }
      
      this.isInitialized = false;
      this.logger.info('LlamaCpp cleanup completed');
    } catch (error) {
      this.logger.error('Error during LlamaCpp cleanup', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  // Health check method
  isReady(): boolean {
    return this.isInitialized && this.model !== null && this.context !== null && this.session !== null;
  }

  // Get current configuration
  getConfig(): LlamaCppConfig {
    return { ...this.config };
  }

  // Update configuration (requires reinitialization for some changes)
  updateConfig(newConfig: Partial<LlamaCppConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.info('LlamaCpp configuration updated', newConfig);
  }
}