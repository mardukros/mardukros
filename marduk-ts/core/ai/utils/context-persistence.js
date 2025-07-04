/**
 * Context persistence manager for AI Coordinator
 * Provides mechanisms to save and restore context data across system restarts
 */
import { promises as fs } from 'fs';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { logger } from '../../logging/logger.js';
/**
 * Context persistence manager
 * Handles saving and loading of context data to/from persistent storage
 */
export class ContextPersistence {
    storageDir;
    persistenceInterval = null;
    lastSaveTime = 0;
    isSaving = false;
    isPersistenceEnabled;
    autoSaveIntervalMs;
    /**
     * Create a new context persistence manager
     * @param storageDir Directory to store context data
     * @param options Configuration options
     */
    constructor(options = {}) {
        this.storageDir = options.storageDir || join('data', 'context');
        this.isPersistenceEnabled = options.enablePersistence !== false;
        this.autoSaveIntervalMs = options.autoSaveIntervalMs || 5 * 60 * 1000; // Default: 5 minutes
        this.ensureStorageDirectory();
        // Set up auto-save if enabled
        if (this.isPersistenceEnabled && this.autoSaveIntervalMs > 0) {
            this.startAutoSave();
        }
        // Set up process exit handler to save context
        if (this.isPersistenceEnabled) {
            process.on('beforeExit', () => {
                this.saveSync();
            });
            // Handle SIGINT (Ctrl+C)
            process.on('SIGINT', () => {
                this.saveSync();
                process.exit(0);
            });
        }
    }
    /**
     * Ensure the storage directory exists
     */
    ensureStorageDirectory() {
        try {
            if (!existsSync(this.storageDir)) {
                mkdirSync(this.storageDir, { recursive: true });
            }
            // Also ensure snapshots directory exists
            const snapshotsDir = join(this.storageDir, 'snapshots');
            if (!existsSync(snapshotsDir)) {
                mkdirSync(snapshotsDir, { recursive: true });
            }
        }
        catch (error) {
            logger.error('Error creating context storage directories:', error);
        }
    }
    /**
     * Start automatic saving of context data
     */
    startAutoSave() {
        if (this.persistenceInterval) {
            clearInterval(this.persistenceInterval);
        }
        this.persistenceInterval = setInterval(() => {
            this.save();
        }, this.autoSaveIntervalMs);
        logger.info(`Context auto-save enabled (every ${this.autoSaveIntervalMs / 1000} seconds)`);
    }
    /**
     * Stop automatic saving of context data
     */
    stopAutoSave() {
        if (this.persistenceInterval) {
            clearInterval(this.persistenceInterval);
            this.persistenceInterval = null;
            logger.info('Context auto-save disabled');
        }
    }
    /**
     * Save context cache to persistent storage
     * @param contextCache Map containing context cache entries
     * @returns Promise that resolves when save is complete
     */
    async save(contextCache) {
        if (!this.isPersistenceEnabled)
            return;
        // Avoid concurrent saves
        if (this.isSaving) {
            logger.debug('Context save already in progress, skipping');
            return;
        }
        this.isSaving = true;
        try {
            // If no cache is provided, just save metadata
            if (!contextCache) {
                await this.saveMetadata({
                    lastSaveTime: Date.now(),
                    itemCount: 0,
                    autoSaveEnabled: !!this.persistenceInterval,
                    message: 'Metadata-only save'
                });
                return;
            }
            // Save the cache items in batches
            await this.saveContextCache(contextCache);
            // Create a snapshot periodically (every 24 hours)
            const SNAPSHOT_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
            if (Date.now() - this.lastSaveTime > SNAPSHOT_INTERVAL) {
                await this.createSnapshot();
            }
            this.lastSaveTime = Date.now();
            logger.info(`Saved ${contextCache.size} context items to persistent storage`);
        }
        catch (error) {
            logger.error('Error saving context cache:', error);
        }
        finally {
            this.isSaving = false;
        }
    }
    /**
     * Synchronously save context cache (for process exit)
     * @param contextCache Map containing context cache entries
     */
    saveSync(contextCache) {
        if (!this.isPersistenceEnabled || !contextCache)
            return;
        try {
            const filePath = join(this.storageDir, 'context-cache.json');
            const data = JSON.stringify(Array.from(contextCache.entries()), null, 2);
            // Use sync methods for exit handler
            if (!existsSync(this.storageDir)) {
                mkdirSync(this.storageDir, { recursive: true });
            }
            require('fs').writeFileSync(filePath, data, 'utf8');
            logger.info(`Synchronously saved ${contextCache.size} context items on exit`);
        }
        catch (error) {
            logger.error('Error during sync context save:', error);
        }
    }
    /**
     * Create a snapshot of the current context cache
     */
    async createSnapshot() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const sourcePath = join(this.storageDir, 'context-cache.json');
            const snapshotPath = join(this.storageDir, 'snapshots', `context-snapshot-${timestamp}.json`);
            // Copy the current cache file to the snapshot
            await fs.copyFile(sourcePath, snapshotPath);
            logger.info(`Created context cache snapshot: ${snapshotPath}`);
            // Clean up old snapshots (keep max 10)
            await this.cleanupSnapshots(10);
        }
        catch (error) {
            logger.error('Error creating context snapshot:', error);
        }
    }
    /**
     * Clean up old snapshots, keeping only the most recent ones
     * @param maxSnapshots Maximum number of snapshots to keep
     */
    async cleanupSnapshots(maxSnapshots) {
        try {
            const snapshotsDir = join(this.storageDir, 'snapshots');
            const files = await fs.readdir(snapshotsDir);
            // Filter and sort context snapshots
            const snapshots = files
                .filter(file => file.startsWith('context-snapshot-'))
                .sort()
                .reverse(); // Newest first
            // Remove older snapshots beyond the limit
            if (snapshots.length > maxSnapshots) {
                const toDelete = snapshots.slice(maxSnapshots);
                for (const file of toDelete) {
                    await fs.unlink(join(snapshotsDir, file));
                    logger.debug(`Deleted old context snapshot: ${file}`);
                }
            }
        }
        catch (error) {
            logger.error('Error cleaning up old snapshots:', error);
        }
    }
    /**
     * Save context cache to file
     * @param contextCache Map containing context cache entries
     */
    async saveContextCache(contextCache) {
        try {
            const filePath = join(this.storageDir, 'context-cache.json');
            const data = JSON.stringify(Array.from(contextCache.entries()), null, 2);
            await fs.writeFile(filePath, data, 'utf8');
            // Save metadata
            await this.saveMetadata({
                lastSaveTime: Date.now(),
                itemCount: contextCache.size,
                autoSaveEnabled: !!this.persistenceInterval,
                message: 'Full context cache save'
            });
        }
        catch (error) {
            logger.error('Error saving context cache file:', error);
            throw error;
        }
    }
    /**
     * Save metadata about the context cache
     * @param metadata Metadata to save
     */
    async saveMetadata(metadata) {
        try {
            const metadataPath = join(this.storageDir, 'context-metadata.json');
            const metadataWithTimestamp = {
                ...metadata,
                timestamp: new Date().toISOString(),
                storageDir: this.storageDir
            };
            await fs.writeFile(metadataPath, JSON.stringify(metadataWithTimestamp, null, 2), 'utf8');
        }
        catch (error) {
            logger.error('Error saving context metadata:', error);
        }
    }
    /**
     * Load context cache from persistent storage
     * @returns Map containing loaded context cache entries
     */
    async load() {
        const contextCache = new Map();
        if (!this.isPersistenceEnabled) {
            logger.debug('Context persistence disabled, skipping load');
            return contextCache;
        }
        try {
            const filePath = join(this.storageDir, 'context-cache.json');
            // Check if cache file exists
            try {
                await fs.access(filePath);
            }
            catch {
                logger.info('No existing context cache found');
                return contextCache;
            }
            // Load and parse cache file
            const data = await fs.readFile(filePath, 'utf8');
            const entries = JSON.parse(data);
            // Restore entries to map
            for (const [key, value] of entries) {
                // Ensure the loaded item has required properties
                if (value && value.context) {
                    // Ensure timestamps are properly set
                    const now = Date.now();
                    value.lastAccessed = value.lastAccessed || now;
                    value.createdAt = value.createdAt || now;
                    value.accessCount = value.accessCount || 1;
                    contextCache.set(key, value);
                }
            }
            logger.info(`Loaded ${contextCache.size} context items from persistent storage`);
        }
        catch (error) {
            logger.error('Error loading context cache:', error);
        }
        return contextCache;
    }
    /**
     * Load a specific snapshot of the context cache
     * @param timestamp Timestamp string of the snapshot to load
     * @returns Map containing loaded context cache entries from the snapshot
     */
    async loadSnapshot(timestamp) {
        if (!this.isPersistenceEnabled)
            return null;
        try {
            const snapshotPath = join(this.storageDir, 'snapshots', `context-snapshot-${timestamp}.json`);
            // Check if snapshot exists
            try {
                await fs.access(snapshotPath);
            }
            catch {
                logger.error(`Snapshot not found: ${timestamp}`);
                return null;
            }
            // Load and parse snapshot
            const data = await fs.readFile(snapshotPath, 'utf8');
            const entries = JSON.parse(data);
            const contextCache = new Map();
            for (const [key, value] of entries) {
                if (value && value.context) {
                    contextCache.set(key, value);
                }
            }
            logger.info(`Loaded ${contextCache.size} context items from snapshot ${timestamp}`);
            return contextCache;
        }
        catch (error) {
            logger.error(`Error loading context snapshot ${timestamp}:`, error);
            return null;
        }
    }
    /**
     * List available snapshots
     * @returns Array of snapshot timestamps
     */
    async listSnapshots() {
        if (!this.isPersistenceEnabled)
            return [];
        try {
            const snapshotsDir = join(this.storageDir, 'snapshots');
            const files = await fs.readdir(snapshotsDir);
            return files
                .filter(file => file.startsWith('context-snapshot-'))
                .map(file => file.replace('context-snapshot-', '').replace('.json', ''))
                .sort()
                .reverse(); // Newest first
        }
        catch (error) {
            logger.error('Error listing context snapshots:', error);
            return [];
        }
    }
}
//# sourceMappingURL=context-persistence.js.map