/**
 * Context persistence manager for AI Coordinator
 * Provides mechanisms to save and restore context data across system restarts
 */
import { CacheableItem } from './advanced-cache.js';
export interface ContextCacheItem extends CacheableItem {
    context: string[];
    relevance?: number;
    queryTerms?: string[];
}
/**
 * Context persistence manager
 * Handles saving and loading of context data to/from persistent storage
 */
export declare class ContextPersistence {
    private storageDir;
    private persistenceInterval;
    private lastSaveTime;
    private isSaving;
    private isPersistenceEnabled;
    private autoSaveIntervalMs;
    /**
     * Create a new context persistence manager
     * @param storageDir Directory to store context data
     * @param options Configuration options
     */
    constructor(options?: {
        storageDir?: string;
        enablePersistence?: boolean;
        autoSaveIntervalMs?: number;
    });
    /**
     * Ensure the storage directory exists
     */
    private ensureStorageDirectory;
    /**
     * Start automatic saving of context data
     */
    startAutoSave(): void;
    /**
     * Stop automatic saving of context data
     */
    stopAutoSave(): void;
    /**
     * Save context cache to persistent storage
     * @param contextCache Map containing context cache entries
     * @returns Promise that resolves when save is complete
     */
    save(contextCache?: Map<string, ContextCacheItem>): Promise<void>;
    /**
     * Synchronously save context cache (for process exit)
     * @param contextCache Map containing context cache entries
     */
    saveSync(contextCache?: Map<string, ContextCacheItem>): void;
    /**
     * Create a snapshot of the current context cache
     */
    private createSnapshot;
    /**
     * Clean up old snapshots, keeping only the most recent ones
     * @param maxSnapshots Maximum number of snapshots to keep
     */
    private cleanupSnapshots;
    /**
     * Save context cache to file
     * @param contextCache Map containing context cache entries
     */
    private saveContextCache;
    /**
     * Save metadata about the context cache
     * @param metadata Metadata to save
     */
    private saveMetadata;
    /**
     * Load context cache from persistent storage
     * @returns Map containing loaded context cache entries
     */
    load(): Promise<Map<string, ContextCacheItem>>;
    /**
     * Load a specific snapshot of the context cache
     * @param timestamp Timestamp string of the snapshot to load
     * @returns Map containing loaded context cache entries from the snapshot
     */
    loadSnapshot(timestamp: string): Promise<Map<string, ContextCacheItem> | null>;
    /**
     * List available snapshots
     * @returns Array of snapshot timestamps
     */
    listSnapshots(): Promise<string[]>;
}
//# sourceMappingURL=context-persistence.d.ts.map