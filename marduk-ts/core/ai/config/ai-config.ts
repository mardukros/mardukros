import { env } from '../../../config/env.js';

/**
 * AI configuration settings
 */
export interface AiConfigSettings {
  /**
   * Maximum tokens to generate in AI response
   */
  defaultMaxTokens: number;
  /**
   * Number of context items to include per query
   */
  contextLimit: number;
  /**
   * Whether to enable context persistence
   */
  enableContextPersistence?: boolean;
  /**
   * Interval for auto-saving context in milliseconds
   */
  contextPersistenceInterval?: number;
  /**
   * Whether to enable context validation
   */
  enableContextValidation?: boolean;
  /**
   * Interval for periodic context validation in milliseconds
   */
  contextValidationInterval?: number;
  /**
   * Whether to apply automatic fixes for validation issues
   */
  autoFixValidationIssues?: boolean;
  /**
   * Whether to use strict validation mode (higher standards)
   */
  strictValidationMode?: boolean;
  /**
   * Default temperature for AI responses
   */
  defaultTemperature: number;
  /**
   * Default top P value for AI responses
   */
  defaultTopP: number;
  /**
   * Default frequency penalty for AI responses
   */
  defaultFrequencyPenalty: number;
  /**
   * Default presence penalty for AI responses
   */
  defaultPresencePenalty: number;
  /**
   * Maximum sources per query
   */
  maxSourcesPerQuery: number;
  /**
   * Cache limit for AI responses
   */
  cacheLimit: number;
}

export const aiConfig = {
  models: {
    default: env.openai.model,
    fallback: 'gpt-3.5-turbo'
  },
  settings: {
    defaultTemperature: 0.7,
    defaultMaxTokens: 1024,
    defaultTopP: 0.9,
    defaultFrequencyPenalty: 0.3,
    defaultPresencePenalty: 0.3,
    contextLimit: 10,
    cacheLimit: 100,
    maxSourcesPerQuery: 5,
    enableContextPersistence: true,
    contextPersistenceInterval: 5 * 60 * 1000, // 5 minutes
    enableContextValidation: true,
    contextValidationInterval: 15 * 60 * 1000, // 15 minutes
    autoFixValidationIssues: true,
    strictValidationMode: false
  },
  systemPrompts: {
    default: `You are O1-mini, an advanced AI assistant integrated with the Marduk framework.
Your role is to assist with cognitive tasks, memory management, and knowledge synthesis.
Always provide clear, concise, and accurate responses.
When dealing with technical content, include relevant examples and explanations.`
  }
};