import { AiRequest, AiResponse, AiAssistant } from '../types/ai-types.js';
export declare class OpenAIClient implements AiAssistant {
    private static instance;
    private openai;
    private retryCount;
    private retryDelay;
    private constructor();
    static getInstance(): OpenAIClient;
    generateResponse(request: Partial<AiRequest>): Promise<AiResponse>;
    private callOpenAI;
    private executeWithRetry;
}
//# sourceMappingURL=openai-client.d.ts.map