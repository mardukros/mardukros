import { AiRequest, AiResponse, AiAssistant } from '../types/ai-types.js';

export abstract class BaseAiClient implements AiAssistant {
  protected abstract callApi(request: AiRequest): Promise<AiResponse>;
  
  async generateResponse(request: AiRequest): Promise<AiResponse> {
    try {
      return await this.executeWithRetry(() => this.callApi(request));
    } catch (error) {
      console.error('AI API Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  protected async executeWithRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt < retries) {
          await new Promise(resolve => 
            setTimeout(resolve, 1000 * attempt)
          );
        }
      }
    }

    throw lastError || new Error('Operation failed after retries');
  }
}