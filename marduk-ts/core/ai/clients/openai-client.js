import { Configuration, OpenAIApi } from 'openai';
import { aiConfig } from '../config/ai-config.js';
import { validateAiRequest, enrichAiRequest } from '../utils/ai-utils.js';
import { env } from '../../../config/env.js';
export class OpenAIClient {
    static instance;
    openai;
    retryCount = 3;
    retryDelay = 1000;
    constructor() {
        const configuration = new Configuration({
            apiKey: env.openai.apiKey,
            organization: env.openai.organization
        });
        this.openai = new OpenAIApi(configuration);
    }
    static getInstance() {
        if (!OpenAIClient.instance) {
            OpenAIClient.instance = new OpenAIClient();
        }
        return OpenAIClient.instance;
    }
    async generateResponse(request) {
        const enrichedRequest = enrichAiRequest(request);
        const validation = validateAiRequest(enrichedRequest);
        if (!validation.valid) {
            throw new Error(`Invalid request: ${validation.errors.join(', ')}`);
        }
        return this.executeWithRetry(() => this.callOpenAI(enrichedRequest));
    }
    async callOpenAI(request) {
        try {
            const completion = await this.openai.createChatCompletion({
                model: aiConfig.models.default,
                messages: [
                    { role: 'system', content: request.systemPrompt || aiConfig.systemPrompts.default },
                    ...request.context.map(msg => ({ role: 'assistant', content: msg })),
                    { role: 'user', content: request.prompt }
                ],
                temperature: request.temperature,
                max_tokens: request.maxTokens,
                top_p: request.topP,
                frequency_penalty: request.frequencyPenalty,
                presence_penalty: request.presencePenalty
            });
            return {
                content: completion.data.choices[0].message?.content || '',
                usage: completion.data.usage || {
                    prompt_tokens: 0,
                    completion_tokens: 0,
                    total_tokens: 0
                },
                model: completion.data.model,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            console.error('OpenAI API Error:', error);
            throw new Error('Failed to generate AI response');
        }
    }
    async executeWithRetry(fn) {
        let lastError = null;
        for (let attempt = 1; attempt <= this.retryCount; attempt++) {
            try {
                return await fn();
            }
            catch (error) {
                lastError = error;
                if (attempt < this.retryCount) {
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
                }
            }
        }
        throw lastError || new Error('Operation failed after retries');
    }
}
//# sourceMappingURL=openai-client.js.map