/**
 * Membrane Abstraction Tests
 * 
 * Tests for the core Membrane class and its introspection capabilities
 */

import { Membrane, MembraneState, MembraneBoundary, BoundaryPolicy, AccessLevel } from '../membrane-abstraction.js';

describe('Membrane Abstraction', () => {
  let membrane: Membrane;
  let tensorData: Float32Array;
  
  beforeEach(() => {
    tensorData = new Float32Array([1.0, 2.0, 3.0, 4.0]);
    membrane = new Membrane(
      'test_membrane_1',
      'Test Membrane',
      {
        tensorData,
        shape: [2, 2],
        kernelId: 'test_kernel',
        stateType: 'test'
      }
    );
  });

  describe('Basic Membrane Operations', () => {
    test('should create membrane with correct properties', () => {
      expect(membrane.getId()).toBe('test_membrane_1');
      expect(membrane.getName()).toBe('Test Membrane');
      expect(membrane.isRoot()).toBe(true);
      expect(membrane.isLeaf()).toBe(true);
      expect(membrane.getDepth()).toBe(0);
      expect(membrane.getIsActive()).toBe(true);
    });

    test('should retrieve state with proper access control', () => {
      const state = membrane.getState('self');
      expect(state).not.toBeNull();
      expect(state!.tensorData).toEqual(tensorData);
      expect(state!.shape).toEqual([2, 2]);
      expect(state!.metadata.kernelId).toBe('test_kernel');
      expect(state!.metadata.stateType).toBe('test');
    });

    test('should deny state access with invalid context', () => {
      const state = membrane.getState('unauthorized');
      expect(state).toBeNull();
    });

    test('should update state with valid access', () => {
      const newData = new Float32Array([5.0, 6.0, 7.0, 8.0]);
      const success = membrane.updateState(newData, 'self');
      expect(success).toBe(true);
      
      const state = membrane.getState('self');
      expect(state!.tensorData).toEqual(newData);
      expect(state!.version).toBe(2); // Version should increment
    });

    test('should reject state update with invalid size', () => {
      const invalidData = new Float32Array([1.0, 2.0]); // Wrong size
      const success = membrane.updateState(invalidData, 'self');
      expect(success).toBe(false);
    });
  });

  describe('Membrane Hierarchy', () => {
    let childMembrane: Membrane;

    beforeEach(() => {
      const childData = new Float32Array([10.0, 20.0, 30.0, 40.0]);
      childMembrane = new Membrane(
        'child_membrane_1',
        'Child Membrane',
        {
          tensorData: childData,
          shape: [2, 2],
          kernelId: 'child_kernel',
          stateType: 'child'
        }
      );
    });

    test('should add child membrane', () => {
      const success = membrane.addChildMembrane(childMembrane);
      expect(success).toBe(true);
      expect(membrane.isLeaf()).toBe(false);
      expect(membrane.getChildren().length).toBe(1);
      expect(childMembrane.getParent()).toBe(membrane);
      expect(childMembrane.getDepth()).toBe(1);
      expect(childMembrane.isRoot()).toBe(false);
    });

    test('should remove child membrane', () => {
      membrane.addChildMembrane(childMembrane);
      const success = membrane.removeChildMembrane(childMembrane.getId());
      expect(success).toBe(true);
      expect(membrane.isLeaf()).toBe(true);
      expect(membrane.getChildren().length).toBe(0);
      expect(childMembrane.getParent()).toBeNull();
    });

    test('should not add duplicate child membrane', () => {
      membrane.addChildMembrane(childMembrane);
      const success = membrane.addChildMembrane(childMembrane);
      expect(success).toBe(false);
      expect(membrane.getChildren().length).toBe(1);
    });
  });

  describe('Boundary Management', () => {
    test('should get default boundary configuration', () => {
      const boundary = membrane.getBoundary();
      expect(boundary.policy).toBe('selective');
      expect(boundary.allowedMessageTypes).toContain('tensor_update');
      expect(boundary.blockedMessageTypes).toContain('malicious');
      expect(boundary.permeability.inbound).toBe(0.7);
    });

    test('should update boundary configuration with valid access', () => {
      const update: Partial<MembraneBoundary> = {
        policy: 'open' as BoundaryPolicy,
        permeability: {
          inbound: 1.0,
          outbound: 1.0,
          bidirectional: 1.0
        }
      };

      const success = membrane.updateBoundary(update, 'self');
      expect(success).toBe(true);

      const boundary = membrane.getBoundary();
      expect(boundary.policy).toBe('open');
      expect(boundary.permeability.inbound).toBe(1.0);
    });

    test('should deny boundary update with invalid access', () => {
      const update: Partial<MembraneBoundary> = {
        policy: 'closed' as BoundaryPolicy
      };

      const success = membrane.updateBoundary(update, 'unauthorized');
      expect(success).toBe(false);
    });
  });

  describe('Membrane Introspection', () => {
    test('should generate comprehensive state report', () => {
      const report = membrane.getStateReport();
      
      expect(report.membraneId).toBe('test_membrane_1');
      expect(report.name).toBe('Test Membrane');
      expect(report.isActive).toBe(true);
      expect(report.stateVersion).toBe(1);
      expect(report.stateSize).toBe(4);
      expect(report.tensorShape).toEqual([2, 2]);
      expect(report.hierarchyInfo.depth).toBe(0);
      expect(report.hierarchyInfo.isRoot).toBe(true);
      expect(report.hierarchyInfo.isLeaf).toBe(true);
      expect(report.hierarchyInfo.parentId).toBeNull();
      expect(report.hierarchyInfo.childCount).toBe(0);
    });

    test('should analyze connection map', () => {
      const connectionMap = membrane.getConnectionMap();
      
      expect(connectionMap.membraneId).toBe('test_membrane_1');
      expect(connectionMap.totalConnections).toBe(0);
      expect(connectionMap.connections).toHaveLength(0);
      expect(connectionMap.networkTopology).toBe('isolated');
    });

    test('should report boundary status', () => {
      const boundaryStatus = membrane.getBoundaryStatus();
      
      expect(boundaryStatus.membraneId).toBe('test_membrane_1');
      expect(boundaryStatus.policy).toBe('selective');
      expect(boundaryStatus.messageStats.allowedTypes).toBe(3); // Default allowed types
      expect(boundaryStatus.messageStats.blockedTypes).toBe(2); // Default blocked types
      expect(boundaryStatus.rateLimit.maxMessagesPerSecond).toBe(100);
    });

    test('should provide performance metrics', () => {
      const metrics = membrane.getPerformanceMetrics();
      
      expect(metrics.membraneId).toBe('test_membrane_1');
      expect(metrics.uptime).toBeGreaterThan(0);
      expect(metrics.activityRatio).toBeGreaterThan(0);
      expect(metrics.messageProcessingStats.totalProcessed).toBe(0);
      expect(metrics.memoryUsage.tensorMemory).toBe(tensorData.byteLength);
      expect(metrics.memoryUsage.totalMemory).toBeGreaterThan(0);
    });

    test('should assess health status', () => {
      const health = membrane.getHealthStatus();
      
      expect(health.membraneId).toBe('test_membrane_1');
      expect(health.overallHealth).toBeGreaterThan(0);
      expect(health.checks.stateIntegrity).toBe(1.0); // Should be perfect integrity
      expect(health.checks.boundaryIntegrity).toBe(1.0);
      expect(health.checks.memoryHealth).toBeGreaterThan(0);
      expect(health.issues).toHaveLength(0);
    });
  });

  describe('Membrane Lifecycle', () => {
    test('should deactivate membrane and children', () => {
      const childData = new Float32Array([10.0, 20.0, 30.0, 40.0]);
      const childMembrane = new Membrane(
        'child_test',
        'Child Test',
        {
          tensorData: childData,
          shape: [2, 2],
          kernelId: 'child_kernel',
          stateType: 'child'
        }
      );

      membrane.addChildMembrane(childMembrane);
      expect(membrane.getIsActive()).toBe(true);
      expect(childMembrane.getIsActive()).toBe(true);

      membrane.deactivate();
      expect(membrane.getIsActive()).toBe(false);
      expect(childMembrane.getIsActive()).toBe(false);
    });

    test('should reactivate membrane', () => {
      membrane.deactivate();
      expect(membrane.getIsActive()).toBe(false);

      membrane.reactivate();
      expect(membrane.getIsActive()).toBe(true);
    });
  });

  describe('State Integrity', () => {
    test('should maintain state checksum integrity', () => {
      const initialState = membrane.getState('self');
      const initialChecksum = initialState!.checksum;

      // Update state
      const newData = new Float32Array([9.0, 8.0, 7.0, 6.0]);
      membrane.updateState(newData, 'self');

      const updatedState = membrane.getState('self');
      const updatedChecksum = updatedState!.checksum;

      expect(updatedChecksum).not.toBe(initialChecksum);
      
      // Health check should confirm integrity
      const health = membrane.getHealthStatus();
      expect(health.checks.stateIntegrity).toBe(1.0);
    });

    test('should detect compromised state integrity', () => {
      const state = membrane.getState('self');
      if (state) {
        // Manually corrupt the checksum to simulate integrity failure
        (membrane as any).state.checksum = 'corrupted_checksum';
        
        const health = membrane.getHealthStatus();
        expect(health.checks.stateIntegrity).toBe(0.0);
        expect(health.issues).toContain('State integrity compromised');
        expect(health.recommendations).toContain('Verify tensor data and recalculate checksum');
      }
    });
  });

  describe('Custom Boundary Configurations', () => {
    test('should create membrane with custom boundary', () => {
      const customBoundary: Partial<MembraneBoundary> = {
        policy: 'open' as BoundaryPolicy,
        allowedMessageTypes: ['custom_type'],
        blockedMessageTypes: ['blocked_type'],
        permeability: {
          inbound: 0.5,
          outbound: 0.5,
          bidirectional: 0.5
        }
      };

      const customMembrane = new Membrane(
        'custom_membrane',
        'Custom Membrane',
        {
          tensorData: new Float32Array([1, 2, 3, 4]),
          shape: [2, 2],
          kernelId: 'custom_kernel',
          stateType: 'custom'
        },
        customBoundary
      );

      const boundary = customMembrane.getBoundary();
      expect(boundary.policy).toBe('open');
      expect(boundary.allowedMessageTypes).toContain('custom_type');
      expect(boundary.blockedMessageTypes).toContain('blocked_type');
      expect(boundary.permeability.inbound).toBe(0.5);
    });
  });

  describe('Complex Hierarchy Operations', () => {
    test('should handle multi-level membrane hierarchy', () => {
      // Create a 3-level hierarchy
      const level1Data = new Float32Array([1, 2, 3, 4]);
      const level1 = new Membrane('level1', 'Level 1', {
        tensorData: level1Data,
        shape: [2, 2],
        kernelId: 'level1_kernel',
        stateType: 'level1'
      });

      const level2Data = new Float32Array([5, 6, 7, 8]);
      const level2 = new Membrane('level2', 'Level 2', {
        tensorData: level2Data,
        shape: [2, 2],
        kernelId: 'level2_kernel',
        stateType: 'level2'
      });

      // Root -> Level1 -> Level2
      membrane.addChildMembrane(level1);
      level1.addChildMembrane(level2);

      expect(membrane.getDepth()).toBe(0);
      expect(level1.getDepth()).toBe(1);
      expect(level2.getDepth()).toBe(2);

      expect(membrane.isRoot()).toBe(true);
      expect(level1.isRoot()).toBe(false);
      expect(level2.isRoot()).toBe(false);

      expect(membrane.isLeaf()).toBe(false);
      expect(level1.isLeaf()).toBe(false);
      expect(level2.isLeaf()).toBe(true);

      const membraneReport = membrane.getStateReport();
      expect(membraneReport.hierarchyInfo.childCount).toBe(1);

      const level1Report = level1.getStateReport();
      expect(level1Report.hierarchyInfo.parentId).toBe('test_membrane_1');
      expect(level1Report.hierarchyInfo.childCount).toBe(1);

      const level2Report = level2.getStateReport();
      expect(level2Report.hierarchyInfo.parentId).toBe('level1');
      expect(level2Report.hierarchyInfo.childCount).toBe(0);
    });
  });
});