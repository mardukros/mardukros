import { AiResponse } from './types/ai-types.js';
import { ContextItem } from './utils/context-sources.js';
export declare class AiCoordinator {
    private openai;
    private memoryFactory;
    private contextCache;
    private contextPersistence;
    private contextValidator;
    private vectorSimilarity;
    private contextSourceManager;
    private documentSource;
    private userActivityAdapter;
    private cacheHits;
    private cacheMisses;
    private persistenceEnabled;
    private validationEnabled;
    private autoFixEnabled;
    private lastValidationTimestamp;
    private validationInProgress;
    private validationTimer;
    private validationInterval;
    constructor();
    /**
     * Initialize context sources for the AI context enrichment process
     */
    private initializeContextSources;
    processQuery(query: string, options?: {
        context?: string[];
        temperature?: number;
        maxTokens?: number;
        systemPrompt?: string;
    }): Promise<AiResponse>;
    /**
     * Enriches the context with information from all available sources
     * @param query The user query to enrich context for
     * @returns Array of context strings
     */
    private enrichContextFromMemory;
    /**
     * Records a new user activity
     * @param query The user query
     */
    private recordUserActivity;
    /**
     * Logs distribution of context sources for analytics
     * @param items Context items
     */
    private logContextSourceDistribution;
    /**
     * Format a context item into a string for AI context
     * @param item Context item
     * @returns Formatted string
     */
    private formatContextItem;
    /**
     * Legacy method for enriching context directly from memory subsystems
     * Used as a fallback if the context source manager fails
     */
    private legacyEnrichContextFromMemory;
    private storeInteraction;
    private generateCacheKey;
    private updateContextCache;
    /**
     * Calculate the overall relevance between a query and retrieved context
     * @param query The user query
     * @param context The retrieved context items
     * @returns Relevance score between 0-1
     */
    private calculateQueryContextRelevance;
    private formatMemoryItem;
    private rankAndFilterContext;
    private rankByStringSimilarity;
    private calculateStringRelevance;
    private calculateRelevance;
    private calculateConfidence;
    /**
     * Get cache statistics for monitoring
     */
    /**
     * Load previously persisted context data on startup
     */
    private loadPersistedContext;
    /**
     * Schedule context data to be persisted
     */
    private scheduleContextPersistence;
    /**
     * Manually persist context cache to storage
     * @returns Promise that resolves when persistence is complete
     */
    persistContext(): Promise<void>;
    /**
     * Restore context from a specific snapshot
     * @param timestamp Snapshot timestamp to restore from
     * @returns Promise resolving to number of restored items
     */
    restoreContextSnapshot(timestamp: string): Promise<number>;
    /**
     * List available context snapshots
     * @returns Promise resolving to array of snapshot timestamps
     */
    listContextSnapshots(): Promise<string[]>;
    /**
     * Adds a document to the document context source
     * @param id Document ID
     * @param content Document content
     */
    addDocument(id: string, content: string): void;
    /**
     * Get cache statistics for monitoring
     * @returns Cache statistics
     */
    getCacheStats(): any;
    /**
     * Schedule periodic validation of context cache
     */
    private schedulePeriodicValidation;
    /**
     * Validate the context cache
     * @param applyFixes Whether to automatically fix validation issues
     * @returns Promise resolving to validation result
     */
    validateContextCache(applyFixes?: boolean): Promise<any>;
    /**
     * Validate individual context items
     * @param contextItems Items to validate
     * @param applyFixes Whether to automatically fix validation issues
     * @returns Promise resolving to validation result
     */
    validateContextItems(contextItems: ContextItem[], applyFixes?: boolean): Promise<any>;
}
//# sourceMappingURL=ai-coordinator.d.ts.map