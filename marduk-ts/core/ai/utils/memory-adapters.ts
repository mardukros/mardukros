/**
 * Memory subsystem adapters for the context source system
 * These adapters integrate the existing memory subsystems with the context sources framework
 */

import { MemorySystemFactory } from '../../memory/memory-factory.js';
import { MemoryItem, MemoryQuery } from '../../memory/types/memory-types.js';
import { ContextItem, ContextSource, MemorySubsystemAdapter } from './context-sources.js';

/**
 * Semantic memory subsystem adapter
 * Provides concept and relationship information from semantic memory
 */
export class SemanticMemoryAdapter extends MemorySubsystemAdapter {
  constructor() {
    super('semantic', 1.0); // High priority due to structured knowledge
  }
  
  async getContext(query: string, options?: any): Promise<ContextItem[]> {
    try {
      const memoryFactory = MemorySystemFactory.getInstance();
      const semanticMemory = memoryFactory.getSubsystem('semantic');
      
      // Create a more focused query with specific filters
      const memoryQuery: MemoryQuery = {
        type: 'concept', // Target concept types first
        term: query,
        filters: {
          confidence: { min: options?.minConfidence || 0.7 }
        }
      };
      
      const response = await semanticMemory.query(memoryQuery);
      
      return response.items.map(item => {
        // Convert semantic memory items to context items with appropriate formatting
        const contextItem = this.convertToContextItem(item, item.type);
        
        // Enhance the content formatting for semantic memory items
        if (item.content && typeof item.content === 'object') {
          let enhancedContent = '';
          
          if (item.content.name) {
            enhancedContent += `${item.content.name}`;
            
            if (item.content.description) {
              enhancedContent += `: ${item.content.description}`;
            }
            
            // Add relationships if available
            if (item.content.relationships && item.content.relationships.length > 0) {
              enhancedContent += '\nRelated concepts:';
              item.content.relationships.slice(0, 3).forEach(rel => {
                enhancedContent += `\n- ${rel.type} ${rel.target} (${rel.strength})`;
              });
            }
          } else {
            enhancedContent = contextItem.content; // Fall back to base conversion
          }
          
          contextItem.content = enhancedContent;
        }
        
        return contextItem;
      });
    } catch (error) {
      console.error('Error retrieving context from semantic memory:', error);
      return [];
    }
  }
}

/**
 * Declarative memory subsystem adapter
 * Provides factual knowledge from declarative memory
 */
export class DeclarativeMemoryAdapter extends MemorySubsystemAdapter {
  constructor() {
    super('declarative', 0.9); // High priority for factual information
  }
  
  async getContext(query: string, options?: any): Promise<ContextItem[]> {
    try {
      const memoryFactory = MemorySystemFactory.getInstance();
      const declarativeMemory = memoryFactory.getSubsystem('declarative');
      
      const memoryQuery: MemoryQuery = {
        type: 'fact', // Focus on facts
        term: query,
        filters: {
          confidence: { min: options?.minConfidence || 0.7 }
        }
      };
      
      const response = await declarativeMemory.query(memoryQuery);
      
      return response.items.map(item => {
        const contextItem = this.convertToContextItem(item, item.type);
        
        // Special handling for content formatting
        if (!contextItem.content && typeof item.content === 'string') {
          contextItem.content = item.content;
        }
        
        // Add tags as metadata if available
        if (item.metadata?.tags) {
          if (!contextItem.metadata) contextItem.metadata = {};
          contextItem.metadata.tags = item.metadata.tags;
        }
        
        return contextItem;
      });
    } catch (error) {
      console.error('Error retrieving context from declarative memory:', error);
      return [];
    }
  }
}

/**
 * Episodic memory subsystem adapter
 * Provides event and experience information from episodic memory
 */
export class EpisodicMemoryAdapter extends MemorySubsystemAdapter {
  constructor() {
    super('episodic', 0.8); // Medium-high priority for past events
  }
  
  async getContext(query: string, options?: any): Promise<ContextItem[]> {
    try {
      const memoryFactory = MemorySystemFactory.getInstance();
      const episodicMemory = memoryFactory.getSubsystem('episodic');
      
      const memoryQuery: MemoryQuery = {
        type: 'event', // Focus on events
        term: query,
        filters: {
          // Higher threshold for importance to ensure relevance
          importance: { min: options?.minImportance || 0.8 }
        }
      };
      
      const response = await episodicMemory.query(memoryQuery);
      
      return response.items.map(item => {
        const contextItem = this.convertToContextItem(item, item.type);
        
        // Enhanced formatting for episodic memory
        if (item.content && typeof item.content === 'object') {
          let enhancedContent = '';
          
          if (item.content.description) {
            enhancedContent += item.content.description;
            
            if (item.content.timestamp) {
              enhancedContent += ` (${item.content.timestamp})`;
            }
            
            if (item.content.context) {
              enhancedContent += `\nContext: ${item.content.context}`;
            }
            
            if (item.content.actors && item.content.actors.length > 0) {
              enhancedContent += `\nInvolved: ${item.content.actors.join(', ')}`;
            }
          } else {
            enhancedContent = contextItem.content; // Fall back to base conversion
          }
          
          contextItem.content = enhancedContent;
        }
        
        // Add emotional valence if available
        if (item.metadata?.emotionalValence !== undefined) {
          if (!contextItem.metadata) contextItem.metadata = {};
          contextItem.metadata.emotionalValence = item.metadata.emotionalValence;
        }
        
        return contextItem;
      });
    } catch (error) {
      console.error('Error retrieving context from episodic memory:', error);
      return [];
    }
  }
}

/**
 * Procedural memory subsystem adapter
 * Provides workflow and process information from procedural memory
 */
export class ProceduralMemoryAdapter extends MemorySubsystemAdapter {
  constructor() {
    super('procedural', 0.7); // Medium priority for processes and workflows
  }
  
  async getContext(query: string, options?: any): Promise<ContextItem[]> {
    try {
      const memoryFactory = MemorySystemFactory.getInstance();
      const proceduralMemory = memoryFactory.getSubsystem('procedural');
      
      const memoryQuery: MemoryQuery = {
        type: 'workflow',
        term: query,
        filters: {
          // Filter for workflows with reasonable success rates
          successRate: { min: options?.minSuccessRate || 0.6 }
        }
      };
      
      const response = await proceduralMemory.query(memoryQuery);
      
      return response.items.map(item => {
        const contextItem = this.convertToContextItem(item, item.type);
        
        // Enhanced formatting for procedural memory
        if (item.content && typeof item.content === 'object') {
          let enhancedContent = '';
          
          if (item.content.title) {
            enhancedContent += `Workflow: ${item.content.title}`;
            
            if (item.content.steps && item.content.steps.length > 0) {
              enhancedContent += '\nSteps:';
              item.content.steps.forEach((step, index) => {
                enhancedContent += `\n${index + 1}. ${step}`;
              });
            }
            
            if (item.content.prerequisites && item.content.prerequisites.length > 0) {
              enhancedContent += `\nPrerequisites: ${item.content.prerequisites.join(', ')}`;
            }
            
            if (item.content.estimatedDuration) {
              enhancedContent += `\nEstimated duration: ${item.content.estimatedDuration} minutes`;
            }
          } else {
            enhancedContent = contextItem.content; // Fall back to base conversion
          }
          
          contextItem.content = enhancedContent;
        }
        
        // Add success rate if available
        if (item.metadata?.successRate !== undefined) {
          if (!contextItem.metadata) contextItem.metadata = {};
          contextItem.metadata.successRate = item.metadata.successRate;
        }
        
        // Add complexity if available
        if (item.metadata?.complexity !== undefined) {
          if (!contextItem.metadata) contextItem.metadata = {};
          contextItem.metadata.complexity = item.metadata.complexity;
        }
        
        return contextItem;
      });
    } catch (error) {
      console.error('Error retrieving context from procedural memory:', error);
      return [];
    }
  }
}

/**
 * User activity memory adapter
 * Provides information about recent user activity and interactions
 */
export class UserActivityAdapter implements ContextSource {
  private activities: {
    timestamp: number;
    description: string;
    type: string;
    tags?: string[];
  }[] = [];
  
  constructor() {
    // Initialize with some example activities
    this.recordActivity('User started a new project', 'project_creation', ['project', 'start']);
    this.recordActivity('User queried about AI systems', 'information_request', ['ai', 'query']);
  }
  
  recordActivity(description: string, type: string, tags?: string[]): void {
    this.activities.push({
      timestamp: Date.now(),
      description,
      type,
      tags
    });
    
    // Keep only the 50 most recent activities
    if (this.activities.length > 50) {
      this.activities.shift();
    }
  }
  
  async getContext(query: string, options?: any): Promise<ContextItem[]> {
    // Match activities based on description and tags
    const searchTerms = query.toLowerCase().split(/\s+/);
    const now = Date.now();
    const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // One week
    
    const matchingActivities = this.activities
      .filter(activity => {
        // Check recency
        if ((now - activity.timestamp) > MAX_AGE_MS) {
          return false;
        }
        
        // Check if query terms match description or tags
        const matches = searchTerms.some(term => 
          activity.description.toLowerCase().includes(term) ||
          activity.tags?.some(tag => tag.toLowerCase().includes(term))
        );
        
        return matches;
      })
      .slice(0, options?.maxResults || 5);
      
    return matchingActivities.map(activity => ({
      content: activity.description,
      source: this.getSourceType(),
      type: activity.type,
      metadata: {
        timestamp: new Date(activity.timestamp).toISOString(),
        tags: activity.tags,
        confidence: 0.9, // High confidence for user activity
        recency: (now - activity.timestamp) / (24 * 60 * 60 * 1000) // Days ago
      }
    }));
  }
  
  getSourceType(): string {
    return 'internal:user_activity';
  }
  
  getPriority(): number {
    return 0.85; // High priority for user-specific context
  }
}
