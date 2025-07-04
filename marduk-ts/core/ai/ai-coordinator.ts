import { OpenAIClient } from './clients/openai-client.js';
import { AiRequest, AiResponse, AiMemoryItem } from './types/ai-types.js';
import { MemorySystemFactory } from '../memory/memory-factory.js';
import { MemoryQuery } from '../memory/types/base-types.js';
import { aiConfig } from './config/ai-config.js';
import { AiError, AiApiError, AiContextError } from '../errors/ai-errors.js';
import * as stringSimilarity from 'string-similarity';
import { VectorSimilarity } from './utils/vector-similarity.js';
import { WeightedLRUCache, CacheableItem } from './utils/advanced-cache.js';
import { ContextSourceManager, ContextItem, DocumentContextSource, WebSearchContextSource } from './utils/context-sources.js';
import { DeclarativeMemoryAdapter, EpisodicMemoryAdapter, ProceduralMemoryAdapter, SemanticMemoryAdapter, UserActivityAdapter } from './utils/memory-adapters.js';
import { ContextPersistence, ContextCacheItem } from './utils/context-persistence.js';
import { ContextValidator, ValidationOptions } from './utils/context-validation.js';

// Using ContextCacheItem from context-persistence.js
type CacheItem = ContextCacheItem;

export class AiCoordinator {
  private openai: OpenAIClient;
  private memoryFactory: MemorySystemFactory;
  private contextCache: WeightedLRUCache<string, CacheItem>;
  private contextPersistence: ContextPersistence;
  private contextValidator: ContextValidator;
  private vectorSimilarity: VectorSimilarity;
  private contextSourceManager!: ContextSourceManager;
  private documentSource!: DocumentContextSource;
  private userActivityAdapter!: UserActivityAdapter;
  private cacheHits = 0;
  private cacheMisses = 0;
  private persistenceEnabled: boolean;
  private validationEnabled: boolean;
  private autoFixEnabled: boolean;
  private lastValidationTimestamp: number = 0;
  private validationInProgress: boolean = false;
  private validationTimer: NodeJS.Timeout | null = null;
  private validationInterval: number;

  constructor() {
    this.openai = OpenAIClient.getInstance();
    this.memoryFactory = MemorySystemFactory.getInstance();
    this.vectorSimilarity = VectorSimilarity.getInstance();
    this.persistenceEnabled = aiConfig.settings.enableContextPersistence !== false;
    this.validationEnabled = aiConfig.settings.enableContextValidation !== false;
    this.autoFixEnabled = aiConfig.settings.autoFixValidationIssues === true;
    this.validationInterval = aiConfig.settings.contextValidationInterval || 15 * 60 * 1000; // 15 minutes default
    
    // Initialize context persistence
    this.contextPersistence = new ContextPersistence({
      enablePersistence: this.persistenceEnabled,
      autoSaveIntervalMs: aiConfig.settings.contextPersistenceInterval || 5 * 60 * 1000 // 5 minutes default
    });
    
    // Initialize context validator
    this.contextValidator = new ContextValidator({
      validateFormat: true,
      validateConsistency: true,
      validateRelevance: true,
      validateAge: true,
      strictMode: aiConfig.settings.strictValidationMode === true,
      maxAgeMs: 30 * 24 * 60 * 60 * 1000 // 30 days default
    });
    
    // Initialize advanced weighted LRU cache
    this.contextCache = new WeightedLRUCache<string, CacheItem>({
      max: aiConfig.settings.cacheLimit || 200,
      ttl: 1000 * 60 * 60 * 24, // 24 hours default TTL
      weightedValues: true,
      frequencyFactor: 0.4,     // 40% weight for frequency
      recencyFactor: 0.6,       // 60% weight for recency
      ttlExtensionOnHit: true,  // Extend TTL for important items
      maxTtlExtensions: 5,      // Allow up to 5 extensions
      ageDecayFactor: 0.15,     // Slight penalty for older items
      
      // Custom weight calculation based on query relevance
      getWeightForItem: (item: CacheItem): number => {
        // Use item's relevance score if available, otherwise 0.5 (medium importance)
        return item.relevance !== undefined ? item.relevance : 0.5;
      },
      
      // Log when items are evicted from cache
      disposeFn: (item: CacheItem, key: string) => {
        console.debug(`Context evicted from cache: ${key.substring(0, 30)}... [accessCount=${item.accessCount}, relevance=${item.relevance}]`);
      },
      
      // Update cache scores every 5 minutes
      updateFrequencyMs: 5 * 60 * 1000
    });
    
    // Initialize context source manager and add sources
    this.initializeContextSources();
    
    // Load persisted context data
    this.loadPersistedContext();
    
    // Schedule periodic context validation if enabled
    if (this.validationEnabled) {
      this.schedulePeriodicValidation();
    }
  }
  
  /**
   * Initialize context sources for the AI context enrichment process
   */
  private initializeContextSources(): void {
    // Create context source manager
    this.contextSourceManager = new ContextSourceManager();
    
    // Add memory adapters
    this.contextSourceManager.addSource(new SemanticMemoryAdapter());
    this.contextSourceManager.addSource(new DeclarativeMemoryAdapter());
    this.contextSourceManager.addSource(new EpisodicMemoryAdapter());
    this.contextSourceManager.addSource(new ProceduralMemoryAdapter());
    
    // Add user activity adapter
    this.userActivityAdapter = new UserActivityAdapter();
    this.contextSourceManager.addSource(this.userActivityAdapter);
    
    // Add document source
    this.documentSource = new DocumentContextSource();
    this.contextSourceManager.addSource(this.documentSource);
    
    // Add web search source if API key is available (disabled for now, requires configuration)
    // if (env?.webSearch?.apiKey) {
    //   this.contextSourceManager.addSource(
    //     new WebSearchContextSource(env.webSearch.apiUrl, env.webSearch.apiKey)
    //   );
    // }
  }

  async processQuery(query: string, options: {
    context?: string[];
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  } = {}): Promise<AiResponse> {
    try {
      const cacheKey = this.generateCacheKey(query);
      let enhancedContext = options.context || [];

      // Try to get context from cache first
      const cachedItem = this.contextCache.get(cacheKey);
      
      if (cachedItem) {
        this.cacheHits++;
        enhancedContext = [...cachedItem.context, ...enhancedContext];
        // No need to update lastAccessed as WeightedLRUCache handles that
        
        // Update query terms to improve future relevance calculation
        const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
        if (cachedItem.queryTerms) {
          // Combine previous query terms with new ones to build history
          const allTerms = new Set([...cachedItem.queryTerms, ...queryTerms]);
          cachedItem.queryTerms = Array.from(allTerms).slice(0, 20); // Keep max 20 terms
        } else {
          cachedItem.queryTerms = queryTerms;
        }
        
        // Update the cache item
        this.contextCache.set(cacheKey, cachedItem);
      } else {
        this.cacheMisses++;
        // Enhance context with relevant memory items
        const memoryContext = await this.enrichContextFromMemory(query);
        enhancedContext = [...memoryContext, ...enhancedContext];
        
        // Calculate relevance for this query/context combination
        const queryRelevance = await this.calculateQueryContextRelevance(query, memoryContext);
        
        // Update cache with context retrieved *from memory only* and relevance score
        this.updateContextCache(cacheKey, memoryContext, queryRelevance, query); 
      }

      // Rank and filter the *final combined* context before sending to AI
      const rankedContext = await this.rankAndFilterContext(enhancedContext, query);

      const request: AiRequest = {
        prompt: query,
        // Use the ranked and filtered context, applying limit here
        context: rankedContext.slice(0, aiConfig.settings.contextLimit), 
        temperature: options.temperature ?? aiConfig.settings.defaultTemperature,
        maxTokens: options.maxTokens ?? aiConfig.settings.defaultMaxTokens,
        systemPrompt: options.systemPrompt
      };

      const response = await this.openai.generateResponse(request);
      await this.storeInteraction(query, response);
      return response;
    } catch (error) {
      // Improved error wrapping
      if (error instanceof AiError) {
        throw error; // Re-throw specific AI errors
      }
      throw new AiError('Error processing AI query', 'PROCESS_QUERY_ERROR', { cause: error });
    }
  }

  /**
   * Enriches the context with information from all available sources
   * @param query The user query to enrich context for
   * @returns Array of context strings
   */
  private async enrichContextFromMemory(query: string): Promise<string[]> {
    try {
      // Use the context source manager to get context from all sources
      const contextItems = await this.contextSourceManager.getContext(query, {
        maxSourcesPerQuery: aiConfig.settings.maxSourcesPerQuery,
        timeoutMs: 2000,
        minConfidence: 0.6,
        recency: 'any', // Consider all items regardless of age
        maxResults: 20  // Get up to 20 items across all sources
      });
      
      // Track the query in user activity
      this.recordUserActivity(query);
      
      // Format context items to strings
      const formattedContext = contextItems.map(item => this.formatContextItem(item));
      
      // Log source distribution for monitoring
      this.logContextSourceDistribution(contextItems);
      
      return formattedContext;
    } catch (error) {
      console.error('Error enriching context:', error);
      
      // Fallback to direct memory subsystem queries if context source manager fails
      return this.legacyEnrichContextFromMemory(query);
    }
  }
  
  /**
   * Records a new user activity
   * @param query The user query
   */
  private recordUserActivity(query: string): void {
    // Extract tags from query
    const tags = query
      .toLowerCase()
      .split(/[\s,.;:!?]+/)
      .filter(word => word.length > 3)
      .slice(0, 5);
      
    this.userActivityAdapter.recordActivity(
      `User asked: ${query.length > 50 ? query.substring(0, 50) + '...' : query}`, 
      'user_query', 
      tags
    );
  }
  
  /**
   * Logs distribution of context sources for analytics
   * @param items Context items
   */
  private logContextSourceDistribution(items: ContextItem[]): void {
    const sourceCounts: Record<string, number> = {};
    
    for (const item of items) {
      if (!sourceCounts[item.source]) {
        sourceCounts[item.source] = 0;
      }
      sourceCounts[item.source]++;
    }
    
    console.debug('Context source distribution:', sourceCounts);
  }
  
  /**
   * Format a context item into a string for AI context
   * @param item Context item
   * @returns Formatted string
   */
  private formatContextItem(item: ContextItem): string {
    // Start with content
    let formatted = item.content;
    
    // Add source information
    formatted += `\n[Source: ${item.source}, Type: ${item.type}`;  
    
    // Add confidence if available
    if (item.metadata?.confidence !== undefined) {
      formatted += `, Confidence: ${Math.round(item.metadata.confidence * 100)}%`;  
    }
    
    // Add timestamp if available
    if (item.metadata?.timestamp) {
      const date = new Date(item.metadata.timestamp);
      formatted += `, Date: ${date.toLocaleDateString()}`;
    }
    
    formatted += ']';
    
    return formatted;
  }
  
  /**
   * Legacy method for enriching context directly from memory subsystems
   * Used as a fallback if the context source manager fails
   */
  private async legacyEnrichContextFromMemory(query: string): Promise<string[]> {
    try {
      const semanticMemory = this.memoryFactory.getSubsystem('semantic');
      const declarativeMemory = this.memoryFactory.getSubsystem('declarative');
      const episodicMemory = this.memoryFactory.getSubsystem('episodic');

      const memoryQuery: MemoryQuery = {
        type: 'any', 
        term: query,
        filters: {} 
      };

      const [semanticResults, declarativeResults, episodicResults] = await Promise.all([
        semanticMemory.query(memoryQuery),
        declarativeMemory.query(memoryQuery),
        episodicMemory.query(memoryQuery)
      ]);

      const memoryContext = [
        ...semanticResults.items.map((item: any) => this.formatMemoryItem(item, 'semantic')),
        ...declarativeResults.items.map((item: any) => this.formatMemoryItem(item, 'declarative')),
        ...episodicResults.items.map((item: any) => this.formatMemoryItem(item, 'episodic'))
      ];

      // Return all retrieved context
      return memoryContext; 
    } catch (error) {
      // If even legacy method fails, return empty context
      console.error('Error in legacy context enrichment:', error);
      return [];
    }
  }

  private async storeInteraction(query: string, response: AiResponse): Promise<void> {
    try {
      const episodicMemory = this.memoryFactory.getSubsystem('episodic');
      const interaction: AiMemoryItem = {
        id: `ai-interaction:${Date.now()}`,
        type: 'ai_interaction',
        content: {
          query,
          response: response.content,
          model: response.model,
          usage: response.usage
        },
        metadata: {
          timestamp: response.timestamp,
          confidence: this.calculateConfidence(response),
          source: 'o1-mini' // Consider making this dynamic if multiple sources exist
        }
      };

      await episodicMemory.store(interaction);
    } catch (error) {
      // Improved error wrapping
      throw new AiApiError('Error storing AI interaction in episodic memory', { cause: error });
    }
  }

  private generateCacheKey(query: string): string {
    // Normalize and trim the query
    const normalizedQuery = query.toLowerCase().trim();
    
    // Extract key terms for better cache key generation
    const keyTerms = normalizedQuery
      .split(/\s+/)
      .filter(term => term.length > 3) // Only consider significant terms
      .slice(0, 6)                      // Take only the first 6 key terms
      .sort()                          // Sort for consistency
      .join(' ');
    
    return keyTerms ? `query:${keyTerms}` : `query:${normalizedQuery.substring(0, 50)}`;
  }

  private updateContextCache(key: string, context: string[], relevance = 0.5, query = ''): void {
    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    
    this.contextCache.set(key, { 
      context,
      lastAccessed: Date.now(),
      createdAt: Date.now(),
      accessCount: 1,
      relevance,
      queryTerms
    });
    
    // Auto-persist context if enabled (this doesn't actually save immediately, just schedules a save)
    this.scheduleContextPersistence();
  }
  
  /**
   * Calculate the overall relevance between a query and retrieved context
   * @param query The user query
   * @param context The retrieved context items
   * @returns Relevance score between 0-1
   */
  private async calculateQueryContextRelevance(query: string, context: string[]): Promise<number> {
    if (!context || context.length === 0) return 0;
    
    try {
      // Sample up to 3 context items for relevance calculation (for efficiency)
      const sampleSize = Math.min(3, context.length);
      const samples = context.slice(0, sampleSize);
      
      // Calculate semantic relevance using vector similarity
      const similarities = await Promise.all(
        samples.map(text => this.vectorSimilarity.calculateSimilarity(query, text))
      );
      
      // Average the similarities (weighted toward the most relevant items)
      const sortedSimilarities = [...similarities].sort((a, b) => b - a);
      let weightedSum = 0;
      let weightSum = 0;
      
      for (let i = 0; i < sortedSimilarities.length; i++) {
        const weight = 1 / (i + 1); // Decreasing weights: 1, 1/2, 1/3, etc.
        weightedSum += sortedSimilarities[i] * weight;
        weightSum += weight;
      }
      
      return weightSum > 0 ? weightedSum / weightSum : 0;
    } catch (error) {
      console.error('Error calculating query-context relevance:', error);
      return 0.5; // Default medium relevance on error
    }
  }

  private formatMemoryItem(item: any, source: string): string {
    // Base content extraction logic
    let content = "";
    let metadata: Record<string, any> = {};
    
    // Extract content based on memory item structure
    if (typeof item.content === 'string') {
      content = item.content;
    } else if (typeof item.content === 'object') {
      if (item.content.description) {
        content = item.content.description;
      } else if (item.content.name) {
        content = item.content.name;
        // Add description if available
        if (item.content.description) {
          content += `: ${item.content.description}`;
        }
      } else if (item.content.relationships && Array.isArray(item.content.relationships)) {
        // For semantic memory with relationships
        content = `Concept: ${item.content.name || "Unknown"}\n`;
        content += `Description: ${item.content.description || "No description"}\n`;
        content += "Relationships:\n";
        
        // Add up to 3 relationships for context
        const relationships = item.content.relationships.slice(0, 3);
        relationships.forEach((rel: any) => {
          content += `- ${rel.type} ${rel.target} (strength: ${rel.strength})\n`;
        });
      }
    }
    try {
      switch (source) {
        case 'semantic':
          // Ensure content exists and has expected properties
          const name = item?.content?.name ?? 'Unknown Concept';
          const description = item?.content?.description ?? 'No description';
          return `[Concept] ${name}: ${description}`;
        case 'declarative':
          // Handle potential object/string content
          const factContent = item?.content ?? 'Unknown Fact';
          return `[Fact] ${typeof factContent === 'object' ? JSON.stringify(factContent) : factContent}`;
        case 'episodic':
          // Safely access nested properties
          const eventDesc = item?.content?.description ?? 'Unknown Event';
          const eventTime = item?.content?.timestamp ? new Date(item.content.timestamp).toISOString() : 'Unknown time';
          return `[Event] ${eventDesc} (${eventTime})`;
        default:
          // Fallback for unknown types
          return `[${source}] ${JSON.stringify(item?.content ?? 'No Content')}`;
      }
    } catch (e) {
      console.error(`Error formatting memory item (ID: ${item?.id}, Type: ${source}):`, e);
      return `[${source}] Error formatting item`; // Return error indicator
    }
  }
  
  // Ranks and filters context based on relevance to the query
  private async rankAndFilterContext(context: string[], query: string): Promise<string[]> {
    if (!context || context.length === 0) {
      return []; // Return empty array if no context
    }

    try {
      // Calculate batch similarities using vector embeddings
      const similarities = await this.vectorSimilarity.calculateBatchSimilarities(query, context);
      
      // Sort by similarity score (descending)
      const sortedContext = similarities
        .sort((a, b) => b.score - a.score)
        .map(item => item.text);
      
      return sortedContext;
    } catch (error) {
      console.error('Error during vector-based context ranking:', error);
      // Fallback to string similarity if vector similarity fails
      return this.rankByStringSimilarity(context, query);
    }
  }

  // Fallback method using string similarity
  private rankByStringSimilarity(context: string[], query: string): string[] {
    return context.map(text => ({
      text,
      score: this.calculateStringRelevance(text, query)
    }))
    .sort((a, b) => b.score - a.score)
    .map(item => item.text);
  }

  // String-based relevance calculation (fallback method)
  private calculateStringRelevance(text: string, query: string): number {
    try {
      const validText = String(text || '');
      const validQuery = String(query || '');
      return stringSimilarity.compareTwoStrings(validText.toLowerCase(), validQuery.toLowerCase());
    } catch (e) {
      console.error(`Error calculating string relevance:`, e);
      return 0;
    }
  }

  // Vector-based relevance calculation (main method)
  private async calculateRelevance(text: string, query: string): Promise<number> {
    try {
      return await this.vectorSimilarity.calculateSimilarity(text, query);
    } catch (error) {
      console.error('Error calculating vector similarity:', error);
      // Fallback to string similarity
      return this.calculateStringRelevance(text, query);
    }
  }

  private calculateConfidence(response: AiResponse): number {
    try { // Added try-catch
      // Basic confidence calculation (can be expanded)
      let confidence = 0.7; // Base confidence

      if (response?.usage) {
        // Adjust based on token usage (prevent division by zero)
        const promptTokens = response.usage.prompt_tokens ?? 0;
        const completionTokens = response.usage.completion_tokens ?? 0;
        const tokenRatio = promptTokens > 0 ? completionTokens / promptTokens : 0;
        
        if (tokenRatio > 0.8) confidence += 0.1;
        else if (tokenRatio < 0.2 && completionTokens > 0) confidence -= 0.1; // Avoid penalty for zero completion

        // Adjust based on response length
        const contentLength = response?.content?.length ?? 0;
        if (contentLength > 500) confidence += 0.1;
        else if (contentLength < 50 && contentLength > 0) confidence -= 0.1; // Avoid penalty for empty content
      } else {
        confidence -= 0.2; // Lower confidence if usage stats are missing
      }
      
      // Adjust for cache effectiveness
      const totalCacheAccesses = this.cacheHits + this.cacheMisses;
      if (totalCacheAccesses > 10) {
        const hitRate = this.cacheHits / totalCacheAccesses;
        if (hitRate > 0.7) confidence += 0.05; // Bonus for good cache performance
      }

      // Ensure confidence stays within bounds [0, 1]
      return Math.max(0, Math.min(1, parseFloat(confidence.toFixed(2))));
    } catch (e) {
      console.error('Error calculating confidence:', e);
      return 0.5; // Default confidence on error
    }
  }
  
  /**
   * Get cache statistics for monitoring
   */
  /**
   * Load previously persisted context data on startup
   */
  private async loadPersistedContext(): Promise<void> {
    if (!this.persistenceEnabled) {
      console.log('Context persistence is disabled, skipping load');
      return;
    }
    
    try {
      const persistedContext = await this.contextPersistence.load();
      
      if (persistedContext.size > 0) {
        // Transfer persisted items to the cache
        for (const [key, value] of persistedContext.entries()) {
          this.contextCache.set(key, value);
        }
        
        console.log(`Loaded ${persistedContext.size} context items from persistent storage`);
      } else {
        console.log('No persisted context found or context was empty');
      }
    } catch (error) {
      console.error('Error loading persisted context:', error);
    }
  }
  
  /**
   * Schedule context data to be persisted
   */
  private scheduleContextPersistence(): void {
    if (!this.persistenceEnabled) return;
    
    // Convert the cache to a Map for persistence
    const contextMap = new Map<string, CacheItem>();
    
    for (const [key, value] of this.contextCache.entries()) {
      contextMap.set(key, value);
    }
    
    // Schedule a save (the persistence manager will handle debouncing)
    this.contextPersistence.save(contextMap);
  }
  
  /**
   * Manually persist context cache to storage
   * @returns Promise that resolves when persistence is complete
   */
  async persistContext(): Promise<void> {
    if (!this.persistenceEnabled) {
      throw new Error('Context persistence is disabled');
    }
    
    const contextMap = new Map<string, CacheItem>();
    
    for (const [key, value] of this.contextCache.entries()) {
      contextMap.set(key, value);
    }
    
    await this.contextPersistence.save(contextMap);
    console.log(`Manually persisted ${contextMap.size} context items`);
  }
  
  /**
   * Restore context from a specific snapshot
   * @param timestamp Snapshot timestamp to restore from
   * @returns Promise resolving to number of restored items
   */
  async restoreContextSnapshot(timestamp: string): Promise<number> {
    if (!this.persistenceEnabled) {
      throw new Error('Context persistence is disabled');
    }
    
    const snapshot = await this.contextPersistence.loadSnapshot(timestamp);
    
    if (!snapshot) {
      throw new Error(`Snapshot ${timestamp} not found`);
    }
    
    // Clear existing cache
    this.contextCache.clear();
    
    // Load snapshot items
    for (const [key, value] of snapshot.entries()) {
      this.contextCache.set(key, value);
    }
    
    console.log(`Restored ${snapshot.size} context items from snapshot ${timestamp}`);
    return snapshot.size;
  }
  
  /**
   * List available context snapshots
   * @returns Promise resolving to array of snapshot timestamps
   */
  async listContextSnapshots(): Promise<string[]> {
    if (!this.persistenceEnabled) {
      return [];
    }
    
    return this.contextPersistence.listSnapshots();
  }
  
  /**
   * Adds a document to the document context source
   * @param id Document ID
   * @param content Document content
   */
  addDocument(id: string, content: string): void {
    this.documentSource.addDocument(id, content);
  }
  
  /**
   * Get cache statistics for monitoring
   * @returns Cache statistics
   */
  getCacheStats(): any {
    const stats = this.contextCache.getStats();
    return {
      ...stats,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses || 1),
      contextSources: this.contextSourceManager.getSources().length,
      persistenceEnabled: this.persistenceEnabled,
      validationEnabled: this.validationEnabled,
      autoFixEnabled: this.autoFixEnabled,
      lastValidationTimestamp: this.lastValidationTimestamp,
      validationInProgress: this.validationInProgress
    };
  }
  
  /**
   * Schedule periodic validation of context cache
   */
  private schedulePeriodicValidation(): void {
    if (!this.validationEnabled) return;
    
    // Clear any existing timer
    if (this.validationTimer) {
      clearInterval(this.validationTimer);
    }
    
    // Set up periodic validation
    this.validationTimer = setInterval(() => {
      this.validateContextCache();
    }, this.validationInterval);
    
    console.log(`Scheduled context validation every ${this.validationInterval / (60 * 1000)} minutes`);
  }
  
  /**
   * Validate the context cache
   * @param applyFixes Whether to automatically fix validation issues
   * @returns Promise resolving to validation result
   */
  async validateContextCache(applyFixes?: boolean): Promise<any> {
    if (this.validationInProgress) {
      console.log('Context validation already in progress, skipping');
      return { skipped: true, reason: 'already_in_progress' };
    }
    
    if (!this.validationEnabled) {
      return { skipped: true, reason: 'validation_disabled' };
    }
    
    this.validationInProgress = true;
    const startTime = Date.now();
    
    try {
      // Convert cache to map for validation
      const contextMap = new Map<string, CacheItem>();
      for (const [key, value] of this.contextCache.entries()) {
        contextMap.set(key, value);
      }
      
      // Validate the cache
      console.log(`Validating context cache with ${contextMap.size} items...`);
      const validationResult = this.contextValidator.validateCache(contextMap);
      
      // Update timestamp
      this.lastValidationTimestamp = Date.now();
      
      // Log validation results
      const issueCount = validationResult.issues.length;
      const severityCount = {
        high: validationResult.issues.filter(i => i.severity === 'high').length,
        medium: validationResult.issues.filter(i => i.severity === 'medium').length,
        low: validationResult.issues.filter(i => i.severity === 'low').length
      };
      
      console.log(`Validation complete in ${validationResult.processedInMs.toFixed(0)}ms. Found ${issueCount} issues:`, 
                  `high=${severityCount.high}, medium=${severityCount.medium}, low=${severityCount.low}`);
      
      // Apply fixes if requested or auto-fix is enabled
      if ((applyFixes === true || (applyFixes !== false && this.autoFixEnabled)) && issueCount > 0) {
        console.log('Applying automatic fixes to context cache...');
        const { fixedCache, appliedFixes } = this.contextValidator.applyFixesToCache(contextMap, validationResult);
        
        if (appliedFixes.length > 0) {
          // Update the cache with fixed items
          this.contextCache.clear();
          for (const [key, value] of fixedCache.entries()) {
            this.contextCache.set(key, value);
          }
          
          console.log(`Applied ${appliedFixes.length} fixes to context cache`);
          
          // Schedule persistence if changes were made
          this.scheduleContextPersistence();
          
          // Update validation result with fix information
          return {
            ...validationResult,
            fixesApplied: appliedFixes.length,
            fixDetails: appliedFixes
          };
        } else {
          console.log('No fixes were needed or possible');
        }
      }
      
      return validationResult;
    } catch (error: any) {
      console.error('Error during context validation:', error);
      return {
        error: true,
        message: error.message,
        stack: error.stack
      };
    } finally {
      this.validationInProgress = false;
      console.log(`Validation process took ${Date.now() - startTime}ms total`);
    }
  }
  
  /**
   * Validate individual context items
   * @param contextItems Items to validate
   * @param applyFixes Whether to automatically fix validation issues
   * @returns Promise resolving to validation result
   */
  async validateContextItems(contextItems: ContextItem[], applyFixes?: boolean): Promise<any> {
    if (!this.validationEnabled) {
      return { skipped: true, reason: 'validation_disabled' };
    }
    
    try {
      // Validate the items
      const validationResult = this.contextValidator.validateItems(contextItems);
      
      // Apply fixes if requested or auto-fix is enabled
      if ((applyFixes === true || (applyFixes !== false && this.autoFixEnabled)) && validationResult.issues.length > 0) {
        const { fixedItems, appliedFixes } = this.contextValidator.applyFixes(contextItems, validationResult);
        
        return {
          ...validationResult,
          fixedItems,
          fixesApplied: appliedFixes.length,
          fixDetails: appliedFixes
        };
      }
      
      return validationResult;
    } catch (error: any) {
      console.error('Error during context item validation:', error);
      return {
        error: true,
        message: error.message,
        stack: error.stack
      };
    }
  }
}
