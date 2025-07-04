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
export declare const aiConfig: {
    models: {
        default: any;
        fallback: string;
    };
    settings: {
        defaultTemperature: number;
        defaultMaxTokens: number;
        defaultTopP: number;
        defaultFrequencyPenalty: number;
        defaultPresencePenalty: number;
        contextLimit: number;
        cacheLimit: number;
        maxSourcesPerQuery: number;
        enableContextPersistence: boolean;
        contextPersistenceInterval: number;
        enableContextValidation: boolean;
        contextValidationInterval: number;
        autoFixValidationIssues: boolean;
        strictValidationMode: boolean;
    };
    systemPrompts: {
        default: string;
    };
};
//# sourceMappingURL=ai-config.d.ts.map