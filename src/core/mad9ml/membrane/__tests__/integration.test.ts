/**
 * Membrane System Integration Tests
 * 
 * Tests for the complete membrane system including P-System, Registry, 
 * Router, and their integration
 */

import { 
  MembraneSystemFactory, 
  MembraneSystemUtils,
  Membrane,
  PSystem,
  MessageRouter,
  MembraneRegistry
} from '../index.js';

describe('Membrane System Integration', () => {
  let system: {
    registry: MembraneRegistry;
    pSystem: PSystem;
    router: MessageRouter;
    systemId: string;
    systemName: string;
  };

  beforeEach(() => {
    system = MembraneSystemFactory.createTestMembraneSystem(
      'integration_test',
      'Integration Test System'
    );
  });

  afterEach(() => {
    // Clean up system
    system.registry.stop();
    system.pSystem.stop();
    system.router.stop();
  });

  describe('System Creation and Configuration', () => {
    test('should create complete membrane system', () => {
      expect(system.systemId).toBe('integration_test');
      expect(system.systemName).toBe('Integration Test System');
      expect(system.registry).toBeDefined();
      expect(system.pSystem).toBeDefined();
      expect(system.router).toBeDefined();
    });

    test('should have properly registered components', () => {
      const registryStats = system.registry.getStatistics();
      expect(registryStats.totalPSystems).toBe(1);
      expect(registryStats.totalRouters).toBe(1);
    });

    test('should create different system types', () => {
      const basicSystem = MembraneSystemFactory.createBasicMembraneSystem(
        'basic_test',
        'Basic Test System'
      );
      expect(basicSystem.systemId).toBe('basic_test');
      basicSystem.registry.stop();
      basicSystem.pSystem.stop();
      basicSystem.router.stop();

      const highPerfSystem = MembraneSystemFactory.createHighPerformanceMembraneSystem(
        'perf_test',
        'Performance Test System'
      );
      expect(highPerfSystem.systemId).toBe('perf_test');
      highPerfSystem.registry.stop();
      highPerfSystem.pSystem.stop();
      highPerfSystem.router.stop();

      const distributedSystem = MembraneSystemFactory.createDistributedMembraneSystem(
        'dist_test',
        'Distributed Test System'
      );
      expect(distributedSystem.systemId).toBe('dist_test');
      distributedSystem.registry.stop();
      distributedSystem.pSystem.stop();
      distributedSystem.router.stop();
    });
  });

  describe('Membrane Creation and Registration', () => {
    test('should create and register membranes', () => {
      const membrane = MembraneSystemUtils.createDefaultMembrane(
        'test_membrane',
        'Test Membrane',
        [4, 4],
        'test_kernel'
      );

      expect(membrane.getId()).toBe('test_membrane');
      expect(membrane.getName()).toBe('Test Membrane');
      
      const state = membrane.getState('self');
      expect(state!.shape).toEqual([4, 4]);
      expect(state!.metadata.kernelId).toBe('test_kernel');

      // Register with system
      const success = system.registry.registerMembrane(
        membrane,
        system.pSystem.getId(),
        ['test'],
        { type: 'test' }
      );
      expect(success).toBe(true);

      const registryStats = system.registry.getStatistics();
      expect(registryStats.totalMembranes).toBe(1);
    });

    test('should create membrane hierarchy', () => {
      const membraneIds = MembraneSystemUtils.createMembraneHierarchy(
        'hierarchy_root',
        'Hierarchy Root',
        3, // depth
        2, // branching factor
        system.pSystem
      );

      // Should create: 1 root + 2 level1 + 4 level2 = 7 membranes total
      expect(membraneIds).toHaveLength(7);
      expect(membraneIds[0]).toBe('hierarchy_root');

      const pSystemStats = system.pSystem.getStatistics();
      expect(pSystemStats.totalMembranes).toBe(7);
      expect(pSystemStats.maxDepthReached).toBe(2);
    });
  });

  describe('Message Routing Integration', () => {
    let membraneIds: string[];

    beforeEach(() => {
      // Create a hierarchy for routing tests
      membraneIds = MembraneSystemUtils.createMembraneHierarchy(
        'routing_root',
        'Routing Root',
        2, // depth
        2, // branching factor
        system.pSystem
      );

      // Register all membranes
      for (const membraneId of membraneIds) {
        const membrane = system.pSystem.getMembrane(membraneId);
        if (membrane) {
          system.registry.registerMembrane(
            membrane,
            system.pSystem.getId(),
            ['routing'],
            { type: 'routing_test' }
          );
          system.router.registerMembrane(membrane);
        }
      }
    });

    test('should register membranes with router', () => {
      const routerStats = system.router.getStatistics();
      expect(routerStats.routerId).toBe(`${system.systemId}_router`);
    });

    test('should build routing table', () => {
      system.router.updateRoutingTable();
      const routingTable = system.router.getRoutingTable();
      expect(routingTable.size).toBeGreaterThan(0);
    });

    test('should find routes between membranes', async () => {
      if (membraneIds.length >= 2) {
        const sourceId = membraneIds[0];
        const destinationId = membraneIds[membraneIds.length - 1];

        const route = await system.router.findRoute(
          sourceId,
          destinationId,
          'shortest-path',
          {
            priority: 'normal',
            maxLatency: 1000,
            minReliability: 0.8,
            maxBandwidth: 1000,
            encryptionRequired: false,
            compressionAllowed: true,
            multicastEnabled: false
          }
        );

        expect(route).not.toBeNull();
        expect(route!.source).toBe(sourceId);
        expect(route!.destination).toBe(destinationId);
        expect(route!.path).toContain(sourceId);
        expect(route!.path).toContain(destinationId);
      }
    });
  });

  describe('Registry Management', () => {
    let membranes: Membrane[];

    beforeEach(() => {
      // Create test membranes
      membranes = [];
      for (let i = 0; i < 5; i++) {
        const membrane = MembraneSystemUtils.createDefaultMembrane(
          `reg_test_${i}`,
          `Registry Test ${i}`,
          [2, 2],
          `kernel_${i}`
        );
        membranes.push(membrane);
        
        system.registry.registerMembrane(
          membrane,
          system.pSystem.getId(),
          [`tag_${i}`, 'test'],
          { index: i, type: 'registry_test' }
        );
      }
    });

    test('should discover membranes by tags', () => {
      const result = system.registry.discoverMembranes({
        tags: ['tag_1']
      });

      expect(result.membranes).toHaveLength(1);
      expect(result.membranes[0].membrane.getId()).toBe('reg_test_1');
    });

    test('should discover membranes by multiple criteria', () => {
      const result = system.registry.discoverMembranes({
        tags: ['test'],
        limit: 3
      });

      expect(result.membranes).toHaveLength(3);
      expect(result.totalCount).toBe(5);
      expect(result.filteredCount).toBe(5); // All have 'test' tag
    });

    test('should perform health checks', async () => {
      const healthResults = await system.registry.performHealthCheck();
      expect(healthResults.size).toBe(5);
      
      for (const [membraneId, status] of healthResults) {
        expect(['healthy', 'degraded', 'unhealthy', 'unknown']).toContain(status);
      }
    });

    test('should provide registry statistics', () => {
      const stats = system.registry.getStatistics();
      
      expect(stats.totalMembranes).toBe(5);
      expect(stats.totalPSystems).toBe(1);
      expect(stats.totalRouters).toBe(1);
      expect(stats.uptime).toBeGreaterThan(0);
    });
  });

  describe('System Health and Validation', () => {
    beforeEach(async () => {
      // Create some membranes for health testing
      const membraneIds = MembraneSystemUtils.createMembraneHierarchy(
        'health_root',
        'Health Root',
        2,
        2,
        system.pSystem
      );

      for (const membraneId of membraneIds) {
        const membrane = system.pSystem.getMembrane(membraneId);
        if (membrane) {
          system.registry.registerMembrane(
            membrane,
            system.pSystem.getId(),
            ['health'],
            { type: 'health_test' }
          );
          system.router.registerMembrane(membrane);
        }
      }
    });

    test('should validate system health', async () => {
      const isHealthy = await MembraneSystemUtils.validateMembraneSystemHealth(system);
      expect(typeof isHealthy).toBe('boolean');
    });

    test('should provide comprehensive system metrics', () => {
      const registryStats = system.registry.getStatistics();
      const pSystemStats = system.pSystem.getStatistics();
      const routerStats = system.router.getStatistics();

      // Registry metrics
      expect(registryStats.totalMembranes).toBeGreaterThan(0);
      expect(registryStats.uptime).toBeGreaterThan(0);

      // P-System metrics
      expect(pSystemStats.totalMembranes).toBeGreaterThan(0);
      expect(pSystemStats.systemId).toBe(system.pSystem.getId());

      // Router metrics
      expect(routerStats.routerId).toBe(system.router.getId());
      expect(routerStats.uptime).toBeGreaterThan(0);
    });
  });

  describe('Membrane Communication Demo', () => {
    test('should run communication demonstration', async () => {
      // This test verifies that the demonstration runs without errors
      await expect(
        MembraneSystemUtils.demonstrateMembraneCommunication(system)
      ).resolves.not.toThrow();

      // After demo, should have some membranes
      const registryStats = system.registry.getStatistics();
      expect(registryStats.totalMembranes).toBeGreaterThan(0);
    });
  });

  describe('Membrane Introspection Integration', () => {
    let testMembrane: Membrane;

    beforeEach(() => {
      testMembrane = MembraneSystemUtils.createDefaultMembrane(
        'introspection_test',
        'Introspection Test Membrane',
        [8, 8],
        'introspection_kernel'
      );

      system.pSystem.addRootMembrane(testMembrane);
      system.registry.registerMembrane(
        testMembrane,
        system.pSystem.getId(),
        ['introspection'],
        { type: 'introspection_test' }
      );
      system.router.registerMembrane(testMembrane);
    });

    test('should provide comprehensive membrane reports', () => {
      const stateReport = testMembrane.getStateReport();
      const connectionMap = testMembrane.getConnectionMap();
      const boundaryStatus = testMembrane.getBoundaryStatus();
      const performanceMetrics = testMembrane.getPerformanceMetrics();
      const healthStatus = testMembrane.getHealthStatus();

      // Verify report completeness
      expect(stateReport.membraneId).toBe('introspection_test');
      expect(stateReport.tensorShape).toEqual([8, 8]);
      expect(stateReport.hierarchyInfo.isRoot).toBe(true);

      expect(connectionMap.membraneId).toBe('introspection_test');
      expect(connectionMap.networkTopology).toBe('isolated');

      expect(boundaryStatus.membraneId).toBe('introspection_test');
      expect(boundaryStatus.policy).toBe('selective');

      expect(performanceMetrics.membraneId).toBe('introspection_test');
      expect(performanceMetrics.uptime).toBeGreaterThan(0);

      expect(healthStatus.membraneId).toBe('introspection_test');
      expect(healthStatus.overallHealth).toBeGreaterThanOrEqual(0);
      expect(healthStatus.overallHealth).toBeLessThanOrEqual(1);
    });

    test('should track membrane lifecycle events', () => {
      const lifecycleEvents = system.registry.getLifecycleEvents();
      
      // Should have at least one registration event
      const registrationEvents = lifecycleEvents.filter(e => e.type === 'registered');
      expect(registrationEvents.length).toBeGreaterThan(0);
      
      const testMembraneEvents = registrationEvents.filter(e => 
        e.membraneId === 'introspection_test'
      );
      expect(testMembraneEvents).toHaveLength(1);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid membrane operations gracefully', () => {
      // Try to register invalid membrane
      const success = system.registry.registerMembrane(
        null as any,
        system.pSystem.getId()
      );
      expect(success).toBe(false);
    });

    test('should handle non-existent membrane queries', () => {
      const membrane = system.registry.getMembrane('non_existent');
      expect(membrane).toBeNull();

      const registration = system.registry.getMembraneRegistration('non_existent');
      expect(registration).toBeNull();
    });

    test('should handle router operations on empty system', async () => {
      const route = await system.router.findRoute(
        'non_existent_source',
        'non_existent_destination',
        'shortest-path',
        {
          priority: 'normal',
          maxLatency: 1000,
          minReliability: 0.8,
          maxBandwidth: 1000,
          encryptionRequired: false,
          compressionAllowed: true,
          multicastEnabled: false
        }
      );

      expect(route).toBeNull();
    });

    test('should handle system shutdown gracefully', () => {
      // Create some membranes first
      const membrane = MembraneSystemUtils.createDefaultMembrane(
        'shutdown_test',
        'Shutdown Test',
        [4, 4],
        'shutdown_kernel'
      );
      
      system.pSystem.addRootMembrane(membrane);
      system.registry.registerMembrane(membrane, system.pSystem.getId());

      expect(membrane.getIsActive()).toBe(true);

      // Stop system
      system.registry.stop();
      system.pSystem.stop();
      system.router.stop();

      // Membrane should be deactivated
      expect(membrane.getIsActive()).toBe(false);
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle moderate membrane load', () => {
      const membraneCount = 50;
      const membranes: Membrane[] = [];

      // Create many membranes
      for (let i = 0; i < membraneCount; i++) {
        const membrane = MembraneSystemUtils.createDefaultMembrane(
          `perf_test_${i}`,
          `Performance Test ${i}`,
          [4, 4],
          `perf_kernel_${i}`
        );
        membranes.push(membrane);

        system.registry.registerMembrane(
          membrane,
          system.pSystem.getId(),
          [`perf_${i}`],
          { index: i }
        );
      }

      const stats = system.registry.getStatistics();
      expect(stats.totalMembranes).toBe(membraneCount);

      // Test discovery performance
      const startTime = Date.now();
      const result = system.registry.discoverMembranes({
        limit: 10
      });
      const discoveryTime = Date.now() - startTime;

      expect(result.membranes).toHaveLength(10);
      expect(result.totalCount).toBe(membraneCount);
      expect(discoveryTime).toBeLessThan(100); // Should be reasonably fast
    });

    test('should handle deep hierarchy efficiently', () => {
      const depth = 10;
      const branchingFactor = 2;
      
      const membraneIds = MembraneSystemUtils.createMembraneHierarchy(
        'deep_root',
        'Deep Root',
        depth,
        branchingFactor,
        system.pSystem
      );

      expect(membraneIds.length).toBeGreaterThan(depth);

      const pSystemStats = system.pSystem.getStatistics();
      expect(pSystemStats.maxDepthReached).toBe(depth);

      // Test topology analysis
      const topology = system.pSystem.analyzeTopology();
      expect(topology.maxDepth).toBe(depth);
      expect(topology.rootMembranes).toHaveLength(1);
    });
  });
});