import { env } from '../../../config/env.js';
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
//# sourceMappingURL=ai-config.js.map