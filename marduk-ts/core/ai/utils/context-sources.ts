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
export abstract class MemorySubsystemAdapter implements ContextSource {
  protected subsystemName: string;
  protected priority: number;
  
  constructor(subsystemName: string, priority: number = 1) {
    this.subsystemName = subsystemName;
    this.priority = priority;
  }
  
  abstract getContext(query: string, options?: any): Promise<ContextItem[]>;
  
  getSourceType(): string {
    return `memory:${this.subsystemName}`;
  }
  
  getPriority(): number {
    return this.priority;
  }
  
  /**
   * Convert a memory item to a context item
   */
  protected convertToContextItem(item: MemoryItem, itemType: string): ContextItem {
    // Base conversion
    const contextItem: ContextItem = {
      content: '',
      source: this.getSourceType(),
      type: itemType
    };
    
    // Extract content based on memory item structure
    if (typeof item.content === 'string') {
      contextItem.content = item.content;
    } else if (typeof item.content === 'object') {
      if ('description' in item.content) {
        contextItem.content = item.content.description;
      } else if ('name' in item.content) {
        contextItem.content = item.content.name;
        // Add description if available
        if ('description' in item.content) {
          contextItem.content += `: ${item.content.description}`;
        }
      } else if ('title' in item.content) {
        contextItem.content = item.content.title;
      }
    }
    
    // Extract metadata
    if (item.metadata) {
      contextItem.metadata = {};
      
      // Copy standard metadata fields
      if ('confidence' in item.metadata) {
        contextItem.metadata.confidence = item.metadata.confidence;
      }
      if ('lastAccessed' in item.metadata) {
        contextItem.metadata.lastAccessed = item.metadata.lastAccessed;
      }
      if ('tags' in item.metadata) {
        contextItem.metadata.tags = item.metadata.tags;
      }
      if ('category' in item.metadata) {
        contextItem.metadata.category = item.metadata.category;
      }
      if ('timestamp' in item.metadata) {
        contextItem.metadata.timestamp = item.metadata.timestamp;
      }
      
      // Add original item ID for reference
      if (item.id) {
        contextItem.metadata.originalId = item.id;
      }
    }
    
    return contextItem;
  }
}

/**
 * Web search context source using a public API
 */
export class WebSearchContextSource implements ContextSource {
  private apiUrl: string;
  private apiKey: string;
  
  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }
  
  async getContext(query: string, options?: any): Promise<ContextItem[]> {
    try {
      // This is a placeholder for actual API implementation
      console.log(`Would search web API at ${this.apiUrl} for: ${query}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock results (in a real implementation, we'd call the API)
      return [
        {
          content: `Web search result for "${query}" (API implementation required)`,
          source: this.getSourceType(),
          type: 'web_result',
          metadata: {
            confidence: 0.7,
            timestamp: new Date().toISOString(),
            tags: query.split(/\s+/).filter(term => term.length > 3)
          }
        }
      ];
    } catch (error) {
      console.error('Error in web search context source:', error);
      return [];
    }
  }
  
  getSourceType(): string {
    return 'external:web_search';
  }
  
  getPriority(): number {
    return 0.5; // Lower priority than memory subsystems
  }
}

/**
 * Document database context source
 */
export class DocumentContextSource implements ContextSource {
  private documents: Map<string, string>;
  
  constructor() {
    this.documents = new Map();
    
    // Initialize with some example documents
    this.documents.set('chaos_theory_overview', 
      'Chaos theory is a branch of mathematics focused on the study of chaos: dynamical systems ' +
      'whose apparently random states of disorder and irregularities are actually governed by ' +
      'underlying patterns and deterministic laws that are highly sensitive to initial conditions.');
    
    this.documents.set('machine_learning_basics',
      'Machine learning is a method of data analysis that automates analytical model building. ' +
      'It is a branch of artificial intelligence based on the idea that systems can learn from ' +
      'data, identify patterns and make decisions with minimal human intervention.');
  }
  
  async getContext(query: string, options?: any): Promise<ContextItem[]> {
    const results: ContextItem[] = [];
    const searchTerms = query.toLowerCase().split(/\s+/);
    
    for (const [docId, content] of this.documents.entries()) {
      const lowerContent = content.toLowerCase();
      
      // Simple matching - check if any search term is in the content
      if (searchTerms.some(term => lowerContent.includes(term))) {
        results.push({
          content,
          source: this.getSourceType(),
          type: 'document',
          metadata: {
            documentId: docId,
            confidence: 0.8,
            timestamp: new Date().toISOString()
          }
        });
      }
    }
    
    return results;
  }
  
  getSourceType(): string {
    return 'internal:documents';
  }
  
  getPriority(): number {
    return 0.8;
  }
  
  /**
   * Add a document to the source
   */
  addDocument(id: string, content: string): void {
    this.documents.set(id, content);
  }
}

/**
 * Context source manager 
 * Manages multiple context sources and provides unified access
 */
export class ContextSourceManager {
  private sources: ContextSource[] = [];
  
  /**
   * Add a context source
   */
  addSource(source: ContextSource): void {
    this.sources.push(source);
    // Sort sources by priority (descending)
    this.sources.sort((a, b) => b.getPriority() - a.getPriority());
  }
  
  /**
   * Get context from all sources for a query
   */
  async getContext(query: string, options: {
    maxSourcesPerQuery?: number;
    timeoutMs?: number;
    minConfidence?: number;
    recency?: 'recent' | 'any';
    maxResults?: number;
  } = {}): Promise<ContextItem[]> {
    const maxSources = options.maxSourcesPerQuery || this.sources.length;
    const timeout = options.timeoutMs || 2000;
    const allResults: ContextItem[] = [];
    
    // Create a promise for each source with timeout
    const sourcePromises = this.sources
      .slice(0, maxSources)
      .map(source => {
        return Promise.race([
          source.getContext(query, options),
          new Promise<ContextItem[]>((resolve) => {
            setTimeout(() => resolve([]), timeout);
          })
        ]);
      });
    
    try {
      // Wait for all sources to return or timeout
      const results = await Promise.all(sourcePromises);
      
      // Combine results
      for (const result of results) {
        allResults.push(...result);
      }
      
      // Apply filters
      const filteredResults = allResults.filter(item => {
        // Apply confidence filter
        if (options.minConfidence && 
            item.metadata?.confidence && 
            item.metadata.confidence < options.minConfidence) {
          return false;
        }
        
        // Apply recency filter
        if (options.recency === 'recent' && 
            item.metadata?.timestamp) {
          const timestamp = new Date(item.metadata.timestamp).getTime();
          const now = Date.now();
          const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
          return timestamp > oneMonthAgo;
        }
        
        return true;
      });
      
      // Limit results if needed
      if (options.maxResults && filteredResults.length > options.maxResults) {
        return filteredResults.slice(0, options.maxResults);
      }
      
      return filteredResults;
    } catch (error) {
      console.error('Error retrieving context from sources:', error);
      return [];
    }
  }
  
  /**
   * Get sources of a specific type
   */
  getSources(type?: string): ContextSource[] {
    if (type) {
      return this.sources.filter(source => 
        source.getSourceType().includes(type));
    }
    return [...this.sources];
  }
}
