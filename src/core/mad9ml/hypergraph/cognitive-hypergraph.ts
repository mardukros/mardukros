/**
 * Hypergraph Implementation - Multi-dimensional cognitive relationship encoding
 * 
 * Implements hypergraph structures for representing complex cognitive relationships
 * between concepts, memories, patterns, and goals in the Marduk cognitive architecture.
 */

import { CognitiveHypergraph, CognitiveNode, CognitiveEdge, Tensor } from '../types.js';
import { makeTensor, randomTensor, addTensors, scaleTensor, cosineSimilarity } from '../tensor/operations.js';

/**
 * Core hypergraph implementation for cognitive relationships
 */
export class CognitiveHypergraphImpl implements CognitiveHypergraph {
  public nodes: Map<string, CognitiveNode>;
  public edges: Map<string, CognitiveEdge>;
  public clusters: Map<string, string[]>;
  
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.clusters = new Map();
  }

  /**
   * Adds a cognitive node to the hypergraph
   */
  addNode(node: CognitiveNode): void {
    this.nodes.set(node.id, node);
  }

  /**
   * Creates and adds a new cognitive node
   */
  createNode(
    id: string,
    type: CognitiveNode['type'],
    stateShape: number[],
    metadata: Record<string, any> = {}
  ): CognitiveNode {
    const state = randomTensor(stateShape, 0.1); // Small random initialization
    const node: CognitiveNode = {
      id,
      type,
      state,
      metadata
    };
    
    this.addNode(node);
    return node;
  }

  /**
   * Adds an edge between cognitive nodes
   */
  addEdge(edge: CognitiveEdge): void {
    // Validate that source and target nodes exist
    if (!this.nodes.has(edge.source)) {
      throw new Error(`Source node ${edge.source} does not exist`);
    }
    if (!this.nodes.has(edge.target)) {
      throw new Error(`Target node ${edge.target} does not exist`);
    }
    
    this.edges.set(edge.id, edge);
  }

  /**
   * Creates and adds a new cognitive edge
   */
  createEdge(
    id: string,
    type: CognitiveEdge['type'],
    source: string,
    target: string,
    weight: number = 1.0,
    properties: Record<string, any> = {}
  ): CognitiveEdge {
    const edge: CognitiveEdge = {
      id,
      type,
      source,
      target,
      weight,
      properties
    };
    
    this.addEdge(edge);
    return edge;
  }

  /**
   * Removes a node and all connected edges
   */
  removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);
    
    // Remove all edges connected to this node
    const edgesToRemove: string[] = [];
    for (const [edgeId, edge] of this.edges) {
      if (edge.source === nodeId || edge.target === nodeId) {
        edgesToRemove.push(edgeId);
      }
    }
    
    for (const edgeId of edgesToRemove) {
      this.edges.delete(edgeId);
    }
    
    // Remove from clusters
    for (const [clusterId, nodeIds] of this.clusters) {
      const index = nodeIds.indexOf(nodeId);
      if (index !== -1) {
        nodeIds.splice(index, 1);
        if (nodeIds.length === 0) {
          this.clusters.delete(clusterId);
        }
      }
    }
  }

  /**
   * Gets all neighbors of a node
   */
  getNeighbors(nodeId: string): string[] {
    const neighbors: string[] = [];
    
    for (const edge of this.edges.values()) {
      if (edge.source === nodeId) {
        neighbors.push(edge.target);
      } else if (edge.target === nodeId) {
        neighbors.push(edge.source);
      }
    }
    
    return [...new Set(neighbors)]; // Remove duplicates
  }

  /**
   * Gets all edges connected to a node
   */
  getNodeEdges(nodeId: string): CognitiveEdge[] {
    const nodeEdges: CognitiveEdge[] = [];
    
    for (const edge of this.edges.values()) {
      if (edge.source === nodeId || edge.target === nodeId) {
        nodeEdges.push(edge);
      }
    }
    
    return nodeEdges;
  }

  /**
   * Creates a cluster of related nodes
   */
  createCluster(clusterId: string, nodeIds: string[]): void {
    // Validate all nodes exist
    for (const nodeId of nodeIds) {
      if (!this.nodes.has(nodeId)) {
        throw new Error(`Node ${nodeId} does not exist`);
      }
    }
    
    this.clusters.set(clusterId, [...nodeIds]);
  }

  /**
   * Finds clusters using similarity-based grouping
   */
  autoCluster(similarityThreshold: number = 0.7): void {
    const nodeIds = Array.from(this.nodes.keys());
    const visited = new Set<string>();
    let clusterIndex = 0;
    
    for (const nodeId of nodeIds) {
      if (visited.has(nodeId)) continue;
      
      const cluster: string[] = [nodeId];
      visited.add(nodeId);
      
      const node = this.nodes.get(nodeId)!;
      
      for (const otherNodeId of nodeIds) {
        if (visited.has(otherNodeId)) continue;
        
        const otherNode = this.nodes.get(otherNodeId)!;
        
        // Check if nodes are similar enough to cluster
        if (node.type === otherNode.type) {
          const similarity = cosineSimilarity(node.state, otherNode.state);
          if (similarity >= similarityThreshold) {
            cluster.push(otherNodeId);
            visited.add(otherNodeId);
          }
        }
      }
      
      if (cluster.length > 1) {
        this.createCluster(`auto_cluster_${clusterIndex++}`, cluster);
      }
    }
  }

  /**
   * Propagates activation through the hypergraph using attention spreading
   */
  spreadActivation(
    sourceNodeId: string,
    initialActivation: number,
    decayFactor: number = 0.9,
    maxSteps: number = 5
  ): Map<string, number> {
    const activations = new Map<string, number>();
    activations.set(sourceNodeId, initialActivation);
    
    const currentWave = new Map<string, number>();
    currentWave.set(sourceNodeId, initialActivation);
    
    for (let step = 0; step < maxSteps; step++) {
      const nextWave = new Map<string, number>();
      
      for (const [nodeId, activation] of currentWave) {
        const neighbors = this.getNeighbors(nodeId);
        const edgeWeights = this.getNodeEdges(nodeId)
          .filter(edge => edge.source === nodeId || edge.target === nodeId)
          .reduce((acc, edge) => {
            const neighborId = edge.source === nodeId ? edge.target : edge.source;
            acc.set(neighborId, edge.weight);
            return acc;
          }, new Map<string, number>());
        
        for (const neighborId of neighbors) {
          const edgeWeight = edgeWeights.get(neighborId) || 1.0;
          const spreadActivation = activation * decayFactor * edgeWeight;
          
          const currentActivation = nextWave.get(neighborId) || 0;
          nextWave.set(neighborId, currentActivation + spreadActivation);
          
          const totalActivation = activations.get(neighborId) || 0;
          activations.set(neighborId, Math.max(totalActivation, spreadActivation));
        }
      }
      
      currentWave.clear();
      for (const [nodeId, activation] of nextWave) {
        if (activation > 0.01) { // Threshold to prevent infinite spreading
          currentWave.set(nodeId, activation);
        }
      }
      
      if (currentWave.size === 0) break;
    }
    
    return activations;
  }

  /**
   * Updates node states based on neighbor influence
   */
  updateNodeStates(learningRate: number = 0.01): void {
    const updates = new Map<string, Tensor>();
    
    for (const [nodeId, node] of this.nodes) {
      const neighbors = this.getNeighbors(nodeId);
      
      if (neighbors.length === 0) continue;
      
      // Compute weighted average of neighbor states
      let weightedSum = makeTensor(node.state.shape);
      let totalWeight = 0;
      
      for (const neighborId of neighbors) {
        const neighbor = this.nodes.get(neighborId)!;
        const edges = this.getNodeEdges(nodeId).filter(edge => 
          (edge.source === nodeId && edge.target === neighborId) ||
          (edge.source === neighborId && edge.target === nodeId)
        );
        
        const weight = edges.reduce((sum, edge) => sum + edge.weight, 0);
        
        if (neighbor.state.shape.every((dim, i) => dim === node.state.shape[i])) {
          weightedSum = addTensors(weightedSum, scaleTensor(neighbor.state, weight));
          totalWeight += weight;
        }
      }
      
      if (totalWeight > 0) {
        const averageNeighborState = scaleTensor(weightedSum, 1 / totalWeight);
        const delta = scaleTensor(
          addTensors(averageNeighborState, scaleTensor(node.state, -1)),
          learningRate
        );
        
        updates.set(nodeId, addTensors(node.state, delta));
      }
    }
    
    // Apply updates
    for (const [nodeId, newState] of updates) {
      const node = this.nodes.get(nodeId)!;
      this.nodes.set(nodeId, { ...node, state: newState });
    }
  }

  /**
   * Gets statistics about the hypergraph structure
   */
  getStatistics(): {
    nodeCount: number;
    edgeCount: number;
    clusterCount: number;
    averageDegree: number;
    nodeTypes: Record<string, number>;
    edgeTypes: Record<string, number>;
  } {
    const nodeTypes: Record<string, number> = {};
    const edgeTypes: Record<string, number> = {};
    
    for (const node of this.nodes.values()) {
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
    }
    
    for (const edge of this.edges.values()) {
      edgeTypes[edge.type] = (edgeTypes[edge.type] || 0) + 1;
    }
    
    const totalDegree = Array.from(this.nodes.keys())
      .reduce((sum, nodeId) => sum + this.getNeighbors(nodeId).length, 0);
    
    return {
      nodeCount: this.nodes.size,
      edgeCount: this.edges.size,
      clusterCount: this.clusters.size,
      averageDegree: this.nodes.size > 0 ? totalDegree / this.nodes.size : 0,
      nodeTypes,
      edgeTypes
    };
  }

  /**
   * Exports the hypergraph to a JSON-serializable format
   */
  toJSON(): any {
    return {
      nodes: Array.from(this.nodes.entries()).map(([id, node]) => ({
        id,
        type: node.type,
        state: {
          shape: node.state.shape,
          data: Array.from(node.state.data)
        },
        metadata: node.metadata
      })),
      edges: Array.from(this.edges.values()),
      clusters: Array.from(this.clusters.entries()).map(([id, nodeIds]) => ({
        id,
        nodeIds
      }))
    };
  }

  /**
   * Imports a hypergraph from a JSON format
   */
  static fromJSON(data: any): CognitiveHypergraphImpl {
    const hypergraph = new CognitiveHypergraphImpl();
    
    // Import nodes
    for (const nodeData of data.nodes) {
      const state = makeTensor(nodeData.state.shape, new Float32Array(nodeData.state.data));
      const node: CognitiveNode = {
        id: nodeData.id,
        type: nodeData.type,
        state,
        metadata: nodeData.metadata
      };
      hypergraph.addNode(node);
    }
    
    // Import edges
    for (const edgeData of data.edges) {
      hypergraph.addEdge(edgeData);
    }
    
    // Import clusters
    for (const clusterData of data.clusters) {
      hypergraph.createCluster(clusterData.id, clusterData.nodeIds);
    }
    
    return hypergraph;
  }
}