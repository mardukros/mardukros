/**
 * Context sources manager for AI Coordinator
 * Provides interfaces and implementations for various context data sources
 */
import { MemoryItem } from '../../memory/types/memory-types.js';
/**
 * Interface for any source that can provide context
 */
export interface ContextSource {
    /**
     * Get context items related to a query
     * @param query Search query
     * @param options Additional search options
     * @returns Array of context items
     */
    getContext(query: string, options?: any): Promise<ContextItem[]>;
    /**
     * Get the source type
     */
    getSourceType(): string;
    /**
     * Get the priority of this source (higher priority sources are queried first)
     */
    getPriority(): number;
}
/**
 * A context item returned from any source
 */
export interface ContextItem {
    /**
     * Content text of the context item
     */
    content: string;
    /**
     * Source of this context
     */
    source: string;
    /**
     * Type of context (fact, concept, event, workflow, etc.)
     */
    type: string;
    /**
     * Metadata about this context item
     */
    metadata?: {
        /**
         * Confidence or quality of this context (0-1)
         */
        confidence?: number;
        /**
         * When was this context created/recorded
         */
        timestamp?: string;
        /**
         * Tags associated with this context
         */
        tags?: string[];
        /**
         * Any additional source-specific metadata
         */
        [key: string]: any;
    };
}
/**
 * Base memory subsystem adapter
 */
export declare abstract class MemorySubsystemAdapter implements ContextSource {
    protected subsystemName: string;
    protected priority: number;
    constructor(subsystemName: string, priority?: number);
    abstract getContext(query: string, options?: any): Promise<ContextItem[]>;
    getSourceType(): string;
    getPriority(): number;
    /**
     * Convert a memory item to a context item
     */
    protected convertToContextItem(item: MemoryItem, itemType: string): ContextItem;
}
/**
 * Web search context source using a public API
 */
export declare class WebSearchContextSource implements ContextSource {
    private apiUrl;
    private apiKey;
    constructor(apiUrl: string, apiKey: string);
    getContext(query: string, options?: any): Promise<ContextItem[]>;
    getSourceType(): string;
    getPriority(): number;
}
/**
 * Document database context source
 */
export declare class DocumentContextSource implements ContextSource {
    private documents;
    constructor();
    getContext(query: string, options?: any): Promise<ContextItem[]>;
    getSourceType(): string;
    getPriority(): number;
    /**
     * Add a document to the source
     */
    addDocument(id: string, content: string): void;
}
/**
 * Context source manager
 * Manages multiple context sources and provides unified access
 */
export declare class ContextSourceManager {
    private sources;
    /**
     * Add a context source
     */
    addSource(source: ContextSource): void;
    /**
     * Get context from all sources for a query
     */
    getContext(query: string, options?: {
        maxSourcesPerQuery?: number;
        timeoutMs?: number;
        minConfidence?: number;
        recency?: 'recent' | 'any';
        maxResults?: number;
    }): Promise<ContextItem[]>;
    /**
     * Get sources of a specific type
     */
    getSources(type?: string): ContextSource[];
}
//# sourceMappingURL=context-sources.d.ts.map