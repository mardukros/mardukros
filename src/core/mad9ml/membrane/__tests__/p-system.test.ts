/**
 * P-System Tests
 * 
 * Tests for the P-System implementation including membrane creation, 
 * hierarchy management, and evolution cycles
 */

import { PSystem, PSystemFactory, PSystemConfig } from '../p-system.js';
import { Membrane } from '../membrane-abstraction.js';

describe('P-System Implementation', () => {
  let pSystem: PSystem;
  let rootMembrane: Membrane;

  beforeEach(() => {
    const config: PSystemConfig = {
      id: 'test_psystem',
      name: 'Test P-System',
      maxDepth: 5,
      maxMembranes: 100,
      distributionStrategy: 'balanced',
      replicationFactor: 2,
      enableFailover: false,
      enableLoadBalancing: false,
      membraneCreationPolicy: 'on-demand'
    };

    pSystem = new PSystem(config);

    // Create root membrane
    const tensorData = new Float32Array([1.0, 2.0, 3.0, 4.0]);
    rootMembrane = new Membrane(
      'root_membrane',
      'Root Membrane',
      {
        tensorData,
        shape: [2, 2],
        kernelId: 'root_kernel',
        stateType: 'root'
      }
    );
  });

  describe('Basic P-System Operations', () => {
    test('should create P-System with correct configuration', () => {
      expect(pSystem.getId()).toBe('test_psystem');
      expect(pSystem.getAllMembranes()).toHaveLength(0);
    });

    test('should add root membrane', () => {
      const success = pSystem.addRootMembrane(rootMembrane);
      expect(success).toBe(true);
      
      const membranes = pSystem.getAllMembranes();
      expect(membranes).toHaveLength(1);
      expect(membranes[0].getId()).toBe('root_membrane');
    });

    test('should not add non-root membrane as root', () => {
      const childData = new Float32Array([5.0, 6.0, 7.0, 8.0]);
      const childMembrane = new Membrane(
        'child_membrane',
        'Child Membrane',
        {
          tensorData: childData,
          shape: [2, 2],
          kernelId: 'child_kernel',
          stateType: 'child'
        }
      );

      // Make it a child of root first
      rootMembrane.addChildMembrane(childMembrane);
      
      const success = pSystem.addRootMembrane(childMembrane);
      expect(success).toBe(false);
    });

    test('should not add duplicate root membrane', () => {
      pSystem.addRootMembrane(rootMembrane);
      const success = pSystem.addRootMembrane(rootMembrane);
      expect(success).toBe(false);
      
      expect(pSystem.getAllMembranes()).toHaveLength(1);
    });
  });

  describe('Child Membrane Creation', () => {
    beforeEach(() => {
      pSystem.addRootMembrane(rootMembrane);
    });

    test('should create child membrane', () => {
      const childData = new Float32Array([10.0, 20.0, 30.0, 40.0]);
      const childId = pSystem.createChildMembrane(
        'root_membrane',
        {
          tensorData: childData,
          shape: [2, 2],
          kernelId: 'child_kernel',
          stateType: 'child'
        },
        'Test Child'
      );

      expect(childId).not.toBeNull();
      expect(pSystem.getAllMembranes()).toHaveLength(2);
      
      const childMembrane = pSystem.getMembrane(childId!);
      expect(childMembrane).not.toBeUndefined();
      expect(childMembrane!.getName()).toBe('Test Child');
      expect(childMembrane!.getDepth()).toBe(1);
      expect(childMembrane!.getParent()).toBe(rootMembrane);
    });

    test('should not create child for non-existent parent', () => {
      const childData = new Float32Array([10.0, 20.0, 30.0, 40.0]);
      const childId = pSystem.createChildMembrane(
        'non_existent_parent',
        {
          tensorData: childData,
          shape: [2, 2],
          kernelId: 'child_kernel',
          stateType: 'child'
        }
      );

      expect(childId).toBeNull();
      expect(pSystem.getAllMembranes()).toHaveLength(1);
    });

    test('should respect maximum depth limit', () => {
      let currentParentId = 'root_membrane';

      // Create membranes up to max depth
      for (let i = 1; i < 5; i++) {
        const childData = new Float32Array([i, i+1, i+2, i+3]);
        const childId = pSystem.createChildMembrane(
          currentParentId,
          {
            tensorData: childData,
            shape: [2, 2],
            kernelId: `kernel_${i}`,
            stateType: 'child'
          },
          `Child Level ${i}`
        );

        expect(childId).not.toBeNull();
        currentParentId = childId!;
      }

      // Try to create one more (should fail due to depth limit)
      const childData = new Float32Array([99, 98, 97, 96]);
      const childId = pSystem.createChildMembrane(
        currentParentId,
        {
          tensorData: childData,
          shape: [2, 2],
          kernelId: 'overflow_kernel',
          stateType: 'child'
        }
      );

      expect(childId).toBeNull();
    });

    test('should respect maximum membrane limit', () => {
      // Create a P-System with very low membrane limit
      const limitedConfig: PSystemConfig = {
        id: 'limited_psystem',
        name: 'Limited P-System',
        maxDepth: 10,
        maxMembranes: 3, // Very low limit
        distributionStrategy: 'balanced',
        replicationFactor: 1,
        enableFailover: false,
        enableLoadBalancing: false,
        membraneCreationPolicy: 'on-demand'
      };

      const limitedPSystem = new PSystem(limitedConfig);
      limitedPSystem.addRootMembrane(rootMembrane);

      // Create children up to limit
      const child1Data = new Float32Array([1, 2, 3, 4]);
      const child1Id = limitedPSystem.createChildMembrane(
        'root_membrane',
        {
          tensorData: child1Data,
          shape: [2, 2],
          kernelId: 'child1_kernel',
          stateType: 'child'
        }
      );
      expect(child1Id).not.toBeNull();

      const child2Data = new Float32Array([5, 6, 7, 8]);
      const child2Id = limitedPSystem.createChildMembrane(
        'root_membrane',
        {
          tensorData: child2Data,
          shape: [2, 2],
          kernelId: 'child2_kernel',
          stateType: 'child'
        }
      );
      expect(child2Id).not.toBeNull();

      // Try to create one more (should fail due to membrane limit)
      const child3Data = new Float32Array([9, 10, 11, 12]);
      const child3Id = limitedPSystem.createChildMembrane(
        'root_membrane',
        {
          tensorData: child3Data,
          shape: [2, 2],
          kernelId: 'child3_kernel',
          stateType: 'child'
        }
      );
      expect(child3Id).toBeNull();
    });
  });

  describe('Membrane Dissolution', () => {
    let childId: string;

    beforeEach(() => {
      pSystem.addRootMembrane(rootMembrane);
      
      const childData = new Float32Array([10.0, 20.0, 30.0, 40.0]);
      childId = pSystem.createChildMembrane(
        'root_membrane',
        {
          tensorData: childData,
          shape: [2, 2],
          kernelId: 'child_kernel',
          stateType: 'child'
        },
        'Test Child'
      )!;
    });

    test('should dissolve membrane without children', () => {
      expect(pSystem.getAllMembranes()).toHaveLength(2);
      
      const success = pSystem.dissolveMembrane(childId);
      expect(success).toBe(true);
      expect(pSystem.getAllMembranes()).toHaveLength(1);
      
      const dissolvedMembrane = pSystem.getMembrane(childId);
      expect(dissolvedMembrane).toBeUndefined();
    });

    test('should not dissolve non-existent membrane', () => {
      const success = pSystem.dissolveMembrane('non_existent');
      expect(success).toBe(false);
    });

    test('should handle dissolution with redistribution', () => {
      // Create grandchild
      const grandchildData = new Float32Array([100, 200, 300, 400]);
      const grandchildId = pSystem.createChildMembrane(
        childId,
        {
          tensorData: grandchildData,
          shape: [2, 2],
          kernelId: 'grandchild_kernel',
          stateType: 'grandchild'
        },
        'Grandchild'
      )!;

      expect(pSystem.getAllMembranes()).toHaveLength(3);

      // Dissolve child with redistribution
      const success = pSystem.dissolveMembrane(childId, true);
      expect(success).toBe(true);
      expect(pSystem.getAllMembranes()).toHaveLength(2);

      // Grandchild should now be child of root
      const grandchild = pSystem.getMembrane(grandchildId);
      expect(grandchild!.getParent()).toBe(rootMembrane);
      expect(grandchild!.getDepth()).toBe(1);
    });
  });

  describe('Membrane Replication', () => {
    let sourceId: string;
    let targetParentId: string;

    beforeEach(() => {
      pSystem.addRootMembrane(rootMembrane);

      // Create source membrane
      const sourceData = new Float32Array([10.0, 20.0, 30.0, 40.0]);
      sourceId = pSystem.createChildMembrane(
        'root_membrane',
        {
          tensorData: sourceData,
          shape: [2, 2],
          kernelId: 'source_kernel',
          stateType: 'source'
        },
        'Source Membrane'
      )!;

      // Create target parent
      const targetData = new Float32Array([50.0, 60.0, 70.0, 80.0]);
      targetParentId = pSystem.createChildMembrane(
        'root_membrane',
        {
          tensorData: targetData,
          shape: [2, 2],
          kernelId: 'target_kernel',
          stateType: 'target'
        },
        'Target Parent'
      )!;
    });

    test('should replicate membrane', () => {
      const replicaId = pSystem.replicateMembrane(sourceId, targetParentId);
      expect(replicaId).not.toBeNull();
      
      const replica = pSystem.getMembrane(replicaId!);
      expect(replica).not.toBeUndefined();
      expect(replica!.getParent()!.getId()).toBe(targetParentId);
      expect(replica!.getName()).toContain('Replica of');
    });

    test('should replicate membrane with children', () => {
      // Add child to source
      const childData = new Float32Array([100, 200, 300, 400]);
      const childId = pSystem.createChildMembrane(
        sourceId,
        {
          tensorData: childData,
          shape: [2, 2],
          kernelId: 'child_kernel',
          stateType: 'child'
        },
        'Source Child'
      )!;

      const initialCount = pSystem.getAllMembranes().length;
      
      const replicaId = pSystem.replicateMembrane(sourceId, targetParentId, true);
      expect(replicaId).not.toBeNull();
      
      // Should have replicated both source and its child
      expect(pSystem.getAllMembranes().length).toBe(initialCount + 2);
    });

    test('should not replicate non-existent membrane', () => {
      const replicaId = pSystem.replicateMembrane('non_existent', targetParentId);
      expect(replicaId).toBeNull();
    });
  });

  describe('P-System Statistics and Analysis', () => {
    beforeEach(() => {
      pSystem.addRootMembrane(rootMembrane);
      
      // Create a small hierarchy for testing
      const child1Data = new Float32Array([10, 20, 30, 40]);
      const child1Id = pSystem.createChildMembrane(
        'root_membrane',
        {
          tensorData: child1Data,
          shape: [2, 2],
          kernelId: 'child1_kernel',
          stateType: 'child'
        }
      )!;

      const child2Data = new Float32Array([50, 60, 70, 80]);
      pSystem.createChildMembrane(
        'root_membrane',
        {
          tensorData: child2Data,
          shape: [2, 2],
          kernelId: 'child2_kernel',
          stateType: 'child'
        }
      );

      const grandchildData = new Float32Array([100, 200, 300, 400]);
      pSystem.createChildMembrane(
        child1Id,
        {
          tensorData: grandchildData,
          shape: [2, 2],
          kernelId: 'grandchild_kernel',
          stateType: 'grandchild'
        }
      );
    });

    test('should provide system statistics', () => {
      const stats = pSystem.getStatistics();
      
      expect(stats.systemId).toBe('test_psystem');
      expect(stats.totalMembranes).toBe(4); // root + 2 children + 1 grandchild
      expect(stats.maxDepthReached).toBe(2);
      expect(stats.membraneCreations).toBe(3); // Only created membranes, not root
      expect(stats.membraneDissolutions).toBe(0);
    });

    test('should analyze topology', () => {
      const topology = pSystem.analyzeTopology();
      
      expect(topology.systemId).toBe('test_psystem');
      expect(topology.rootMembranes).toHaveLength(1);
      expect(topology.rootMembranes[0]).toBe('root_membrane');
      expect(topology.maxDepth).toBe(2);
      expect(topology.averageBranchingFactor).toBeGreaterThan(0);
    });

    test('should get membranes at specific depth', () => {
      const depthZero = pSystem.getMembranesAtDepth(0);
      expect(depthZero).toHaveLength(1);
      expect(depthZero[0].getId()).toBe('root_membrane');

      const depthOne = pSystem.getMembranesAtDepth(1);
      expect(depthOne).toHaveLength(2); // Two children

      const depthTwo = pSystem.getMembranesAtDepth(2);
      expect(depthTwo).toHaveLength(1); // One grandchild
    });
  });

  describe('Evolution Cycles', () => {
    beforeEach(() => {
      pSystem.addRootMembrane(rootMembrane);
    });

    test('should execute evolution cycle', async () => {
      const initialStats = pSystem.getStatistics();
      
      await pSystem.executeEvolutionCycle();
      
      const updatedStats = pSystem.getStatistics();
      expect(updatedStats.evolutionCycles).toBe(initialStats.evolutionCycles + 1);
    });

    test('should not execute evolution cycle when inactive', async () => {
      pSystem.stop();
      
      const initialStats = pSystem.getStatistics();
      await pSystem.executeEvolutionCycle();
      
      const updatedStats = pSystem.getStatistics();
      expect(updatedStats.evolutionCycles).toBe(initialStats.evolutionCycles);
    });
  });

  describe('P-System Lifecycle', () => {
    test('should start and stop P-System', () => {
      expect(pSystem.isActive()).toBe(true);
      
      pSystem.stop();
      expect(pSystem.isActive()).toBe(false);
      
      pSystem.start();
      expect(pSystem.isActive()).toBe(true);
    });

    test('should deactivate all membranes when stopped', () => {
      pSystem.addRootMembrane(rootMembrane);
      
      const childData = new Float32Array([10, 20, 30, 40]);
      const childId = pSystem.createChildMembrane(
        'root_membrane',
        {
          tensorData: childData,
          shape: [2, 2],
          kernelId: 'child_kernel',
          stateType: 'child'
        }
      )!;

      const childMembrane = pSystem.getMembrane(childId)!;
      
      expect(rootMembrane.getIsActive()).toBe(true);
      expect(childMembrane.getIsActive()).toBe(true);
      
      pSystem.stop();
      
      expect(rootMembrane.getIsActive()).toBe(false);
      expect(childMembrane.getIsActive()).toBe(false);
    });
  });
});

describe('P-System Factory', () => {
  test('should create hierarchical P-System', () => {
    const pSystem = PSystemFactory.createHierarchicalPSystem(
      'hierarchical_test',
      'Hierarchical Test',
      5,
      1000
    );

    expect(pSystem.getId()).toBe('hierarchical_test');
    const stats = pSystem.getStatistics();
    expect(stats.systemId).toBe('hierarchical_test');
  });

  test('should create distributed P-System', () => {
    const pSystem = PSystemFactory.createDistributedPSystem(
      'distributed_test',
      'Distributed Test',
      500
    );

    expect(pSystem.getId()).toBe('distributed_test');
    const stats = pSystem.getStatistics();
    expect(stats.systemId).toBe('distributed_test');
  });

  test('should create high-performance P-System', () => {
    const pSystem = PSystemFactory.createHighPerformancePSystem(
      'performance_test',
      'Performance Test'
    );

    expect(pSystem.getId()).toBe('performance_test');
    const stats = pSystem.getStatistics();
    expect(stats.systemId).toBe('performance_test');
  });
});