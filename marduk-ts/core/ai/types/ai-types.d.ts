import { MemoryItem } from '../../memory/types/base-types.js';
export interface AiRequest {
    prompt: string;
    systemPrompt?: string;
    context: string[];
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
}
export interface AiResponse {
    content: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    model: string;
    timestamp: string;
}
export interface AiMemoryItem extends MemoryItem {
    type: 'ai_interaction';
    content: {
        query: string;
        response: string;
        model: string;
        usage: AiResponse['usage'];
    };
    metadata: {
        timestamp: string;
        confidence: number;
        source: string;
    };
}
export interface AiAssistant {
    generateResponse(request: AiRequest): Promise<AiResponse>;
}
//# sourceMappingURL=ai-types.d.ts.map