import { AiRequest, AiResponse } from '../types/ai-types.js';
import { aiConfig } from '../config/ai-config.js';

export function validateAiRequest(request: AiRequest): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!request.prompt) {
    errors.push('Prompt is required');
  }

  if (!Array.isArray(request.context)) {
    errors.push('Context must be an array');
  }

  if (request.temperature !== undefined && (request.temperature < 0 || request.temperature > 1)) {
    errors.push('Temperature must be between 0 and 1');
  }

  if (request.maxTokens !== undefined && request.maxTokens < 1) {
    errors.push('Max tokens must be greater than 0');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function enrichAiRequest(request: Partial<AiRequest>): AiRequest {
  return {
    prompt: request.prompt || '',
    systemPrompt: request.systemPrompt || aiConfig.systemPrompts.default,
    context: request.context || [],
    temperature: request.temperature ?? aiConfig.settings.defaultTemperature,
    maxTokens: request.maxTokens ?? aiConfig.settings.defaultMaxTokens,
    topP: request.topP ?? aiConfig.settings.defaultTopP,
    frequencyPenalty: request.frequencyPenalty ?? aiConfig.settings.defaultFrequencyPenalty,
    presencePenalty: request.presencePenalty ?? aiConfig.settings.defaultPresencePenalty
  };
}

export function formatAiResponse(response: AiResponse): string {
  return `Response from ${response.model} (${response.timestamp}):
Content: ${response.content}
Usage: ${response.usage.total_tokens} tokens (${response.usage.prompt_tokens} prompt, ${response.usage.completion_tokens} completion)`;
}