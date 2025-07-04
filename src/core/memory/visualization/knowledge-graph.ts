
import { MemorySystemFactory } from '../memory-factory.js';
import { logger } from '../../utils/logger.js';

type Node = {
  id: string;
  label: string;
  type: string;
  weight: number;
};

type Edge = {
  source: string;
  target: string;
  weight: number;
  label?: string;
};

type Graph = {
  nodes: Node[];
  edges: Edge[];
};

/**
 * Knowledge Graph Generator
 * 
 * Transforms semantic memory into a navigable, visual knowledge graph
 * that reveals conceptual relationships and information clusters.
 */
export class KnowledgeGraphGenerator {
  private memoryFactory: MemorySystemFactory;
  private cachedGraph: Graph | null = null;
  private lastGenerated: number = 0;
  private readonly CACHE_LIFETIME_MS = 60000; // 1 minute
  
  constructor() {
    this.memoryFactory = MemorySystemFactory.getInstance();
  }
  
  /**
   * Generates a knowledge graph from semantic memory
   */
  async generateGraph(options: {
    maxNodes?: number;
    centralConcept?: string;
    depthLimit?: number;
    minRelationStrength?: number;
  } = {}): Promise<Graph> {
    // Use cached graph if available and recent
    if (this.cachedGraph && (Date.now() - this.lastGenerated < this.CACHE_LIFETIME_MS)) {
      return this.filterGraph(this.cachedGraph, options);
    }
    
    try {
      const semanticMemory = this.memoryFactory.getSubsystem('semantic');
      const declarativeMemory = this.memoryFactory.getSubsystem('declarative');
      
      // Query concepts from semantic memory
      const conceptResults = await semanticMemory.query({
        type: 'concept',
        filters: { confidence: { min: 0.7 } }
      });
      
      // Query relationships from semantic memory
      const relationshipResults = await semanticMemory.query({
        type: 'relationship',
        filters: { confidence: { min: 0.6 } }
      });
      
      // Create graph nodes from concepts
      const nodes: Node[] = conceptResults.items.map((concept: any) => ({
        id: concept.id,
        label: concept.content.name || concept.id,
        type: concept.content.category || 'concept',
        weight: concept.metadata?.importance || concept.metadata?.confidence || 0.5
      }));
      
      // Create graph edges from relationships
      const edges: Edge[] = relationshipResults.items.map((relationship: any) => ({
        source: relationship.content.source,
        target: relationship.content.target,
        weight: relationship.metadata?.strength || 0.5,
        label: relationship.content.type
      }));
      
      // Add supporting facts from declarative memory
      const factResults = await declarativeMemory.query({
        type: 'fact',
        filters: { confidence: { min: 0.8 } }
      });
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
      
      // Create additional nodes and edges for facts
      factResults.items.forEach((fact: any) => {
        // Extract concepts from fact (simplified - would be more sophisticated in production)
        const factConcepts = this.extractConceptsFromFact(fact.content);
        
        // Only add facts with at least one recognized concept
        if (factConcepts.length > 0) {
          // Add fact node
          const factNode: Node = {
            id: fact.id,
            label: fact.content.toString().substring(0, 30) + '...',
            type: 'fact',
            weight: 0.3
          };
          nodes.push(factNode);
          
          // Connect fact to related concepts
          factConcepts.forEach(concept => {
            edges.push({
              source: fact.id,
              target: concept,
              weight: 0.4,
              label: 'supports'
            });
          });
        }
      });
      
      // Update cache
      this.cachedGraph = { nodes, edges };
      this.lastGenerated = Date.now();
      
      // Return filtered graph based on options
      return this.filterGraph(this.cachedGraph, options);
    } catch (error) {
      logger.error('Error generating knowledge graph:', error as Error);
      return { nodes: [], edges: [] };
    }
  }
  
  /**
   * Filters the graph based on provided options
   */
  private filterGraph(graph: Graph, options: {
    maxNodes?: number;
    centralConcept?: string;
    depthLimit?: number;
    minRelationStrength?: number;
  }): Graph {
    let { nodes, edges } = graph;
    const {
      maxNodes = 100,
      centralConcept,
      depthLimit = 3,
      minRelationStrength = 0.3
    } = options;
    
    // Filter by relation strength
    edges = edges.filter(edge => edge.weight >= minRelationStrength);
    
    // If central concept is specified, filter by graph traversal
    if (centralConcept) {
      const centralNode = nodes.find(node => 
        node.id === centralConcept || 
        node.label.toLowerCase() === centralConcept.toLowerCase()
      );
      
      if (centralNode) {
        const includedNodeIds = new Set<string>([centralNode.id]);
        this.traverseGraph(centralNode.id, edges, includedNodeIds, depthLimit, 0);
        
        // Filter nodes and edges based on traversal
        nodes = nodes.filter(node => includedNodeIds.has(node.id));
        edges = edges.filter(edge => 
          includedNodeIds.has(edge.source) && includedNodeIds.has(edge.target)
        );
      }
    }
    
    // Limit to max nodes by importance
    if (nodes.length > maxNodes) {
      nodes.sort((a, b) => b.weight - a.weight);
      const topNodeIds = new Set(nodes.slice(0, maxNodes).map(node => node.id));
      nodes = nodes.filter(node => topNodeIds.has(node.id));
      edges = edges.filter(edge => 
        topNodeIds.has(edge.source) && topNodeIds.has(edge.target)
      );
    }
    
    return { nodes, edges };
  }
  
  /**
   * Traverses the graph to find connected nodes up to a certain depth
   */
  private traverseGraph(
    currentNodeId: string,
    edges: Edge[],
    includedNodeIds: Set<string>,
    maxDepth: number,
    currentDepth: number
  ): void {
    if (currentDepth >= maxDepth) {
      return;
    }
    
    // Find all edges connected to the current node
    const connectedEdges = edges.filter(edge => 
      edge.source === currentNodeId || edge.target === currentNodeId
    );
    
    // Add connected nodes to included set
    connectedEdges.forEach(edge => {
      const connectedNodeId = edge.source === currentNodeId ? edge.target : edge.source;
      if (!includedNodeIds.has(connectedNodeId)) {
        includedNodeIds.add(connectedNodeId);
        // Recursively traverse from connected node
        this.traverseGraph(connectedNodeId, edges, includedNodeIds, maxDepth, currentDepth + 1);
      }
    });
  }
  
  /**
   * Extracts concept IDs from a fact's content (simplified)
   */
  private extractConceptsFromFact(factContent: any): string[] {
    const concepts: string[] = [];
    const factText = factContent.toString().toLowerCase();
    
    // This is a simplified placeholder. In production, would use:
    // 1. NLP for entity/concept extraction
    // 2. Vector similarity against known concepts
    // 3. Direct reference matching if fact structure includes concept references
    
    // For demo purposes, just check if any concept labels appear in the fact text
    if (this.cachedGraph) {
      this.cachedGraph.nodes
        .filter(node => node.type === 'concept')
        .forEach(concept => {
          if (factText.includes(concept.label.toLowerCase())) {
            concepts.push(concept.id);
          }
        });
    }
    
    return concepts;
  }
  
  /**
   * Exports the graph in a format compatible with visualization libraries
   */
  async exportForVisualization(options: {
    format?: 'json' | 'cytoscape' | 'd3';
    centralConcept?: string;
  } = {}): Promise<string> {
    const { format = 'json', centralConcept } = options;
    const graph = await this.generateGraph({ centralConcept, maxNodes: 50 });
    
    switch (format) {
      case 'cytoscape':
        return this.formatForCytoscape(graph);
      case 'd3':
        return this.formatForD3(graph);
      case 'json':
      default:
        return JSON.stringify(graph, null, 2);
    }
  }
  
  /**
   * Formats graph for Cytoscape.js visualization
   */
  private formatForCytoscape(graph: Graph): string {
    const elements = {
      nodes: graph.nodes.map(node => ({
        data: {
          id: node.id,
          label: node.label,
          type: node.type,
          weight: node.weight
        }
      })),
      edges: graph.edges.map(edge => ({
        data: {
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          weight: edge.weight,
          label: edge.label
        }
      }))
    };
    
    return JSON.stringify(elements, null, 2);
  }
  
  /**
   * Formats graph for D3.js visualization
   */
  private formatForD3(graph: Graph): string {
    return JSON.stringify(graph, null, 2);
  }
}
