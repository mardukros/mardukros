/**
 * Membrane Encapsulation Module for Kernel State (P-System Prototype)
 * 
 * This module implements P-System inspired membrane encapsulation for kernel state tensors
 * with controlled boundaries, message passing, and recursive nesting capabilities.
 * 
 * Main Features:
 * - Membrane abstraction for kernel state encapsulation
 * - Port channels for controlled message passing
 * - P-System implementation for recursive membrane nesting
 * - Message routing with boundary respect
 * - Centralized membrane registry and management
 * - Meta-cognitive self-reporting capabilities
 */

// Core membrane abstractions
export {
  Membrane,
  MembraneState,
  MembraneBoundary,
  MembraneIntrospection,
  MembraneMessage,
  MembraneStateReport,
  MembraneConnection,
  MembraneConnectionMap,
  MembraneBoundaryStatus,
  MembranePerformanceMetrics,
  MembraneHealthStatus,
  BoundaryPolicy,
  AccessLevel
} from './membrane-abstraction.js';

// Port channel system
export {
  PortChannel,
  PortChannelConfig,
  PortChannelFactory,
  PortChannelStatistics,
  PortMessage,
  PortConnection,
  PortValidationRule,
  PortTransformationRule,
  PortValidationResult,
  PortTransformationResult,
  PortDirection,
  PortDataType,
  MessagePriority,
  PortStatus
} from './port-channel.js';

// P-System implementation
export {
  PSystem,
  PSystemConfig,
  PSystemFactory,
  PSystemRule,
  PSystemCondition,
  PSystemAction,
  PSystemStatistics,
  PSystemTopology,
  PSystemEvolutionEvent,
  MembraneCluster
} from './p-system.js';

// Message routing
export {
  MessageRouter,
  MessageRouterFactory,
  MessageRouterConfig,
  MessageRoute,
  RoutingTableEntry,
  RoutingStatistics,
  RoutingContext,
  QoSParameters,
  RoutingStrategy
} from './message-router.js';

// Registry and management
export {
  MembraneRegistry,
  MembraneRegistryFactory,
  MembraneRegistryConfig,
  MembraneRegistration,
  PSystemRegistration,
  RegistryQuery,
  RegistryStatistics,
  MembraneDiscoveryResult,
  MembraneLifecycleEvent
} from './membrane-registry.js';

// Import the needed types for the factories
import { Membrane } from './membrane-abstraction.js';
import { PortChannel, PortMessage, RoutingContext } from './port-channel.js';
import { PSystem } from './p-system.js';
import { MessageRouter } from './message-router.js';
import { MembraneRegistry, MembraneRegistryFactory } from './membrane-registry.js';
import { PSystemFactory } from './p-system.js';
import { MessageRouterFactory } from './message-router.js';

/**
 * Membrane System Factory - Creates complete membrane systems
 */
export class MembraneSystemFactory {
  /**
   * Create a complete basic membrane system
   */
  static createBasicMembraneSystem(systemId: string, systemName: string) {
    // Create registry
    const registry = MembraneRegistryFactory.createBasicRegistry(
      `${systemId}_registry`,
      `${systemName} Registry`
    );

    // Create P-System
    const pSystem = PSystemFactory.createHierarchicalPSystem(
      `${systemId}_psystem`,
      `${systemName} P-System`
    );

    // Create message router
    const router = MessageRouterFactory.createBasicRouter(
      `${systemId}_router`,
      `${systemName} Router`
    );

    // Register components
    registry.registerPSystem(pSystem);
    registry.registerRouter(router);

    // Attach router to P-System
    router.attachToPSystem(pSystem);

    return {
      registry,
      pSystem,
      router,
      systemId,
      systemName
    };
  }

  /**
   * Create a high-performance membrane system
   */
  static createHighPerformanceMembraneSystem(systemId: string, systemName: string) {
    // Create high-capacity registry
    const registry = MembraneRegistryFactory.createHighCapacityRegistry(
      `${systemId}_registry`,
      `${systemName} Registry`
    );

    // Create high-performance P-System
    const pSystem = PSystemFactory.createHighPerformancePSystem(
      `${systemId}_psystem`,
      `${systemName} P-System`
    );

    // Create high-performance router
    const router = MessageRouterFactory.createHighPerformanceRouter(
      `${systemId}_router`,
      `${systemName} Router`
    );

    // Register components
    registry.registerPSystem(pSystem);
    registry.registerRouter(router);

    // Attach router to P-System
    router.attachToPSystem(pSystem);

    return {
      registry,
      pSystem,
      router,
      systemId,
      systemName
    };
  }

  /**
   * Create a distributed membrane system
   */
  static createDistributedMembraneSystem(systemId: string, systemName: string) {
    // Create high-capacity registry
    const registry = MembraneRegistryFactory.createHighCapacityRegistry(
      `${systemId}_registry`,
      `${systemName} Registry`
    );

    // Create distributed P-System
    const pSystem = PSystemFactory.createDistributedPSystem(
      `${systemId}_psystem`,
      `${systemName} P-System`
    );

    // Create fault-tolerant router
    const router = MessageRouterFactory.createFaultTolerantRouter(
      `${systemId}_router`,
      `${systemName} Router`
    );

    // Register components
    registry.registerPSystem(pSystem);
    registry.registerRouter(router);

    // Attach router to P-System
    router.attachToPSystem(pSystem);

    return {
      registry,
      pSystem,
      router,
      systemId,
      systemName
    };
  }

  /**
   * Create a membrane system for testing
   */
  static createTestMembraneSystem(systemId: string, systemName: string) {
    // Create test registry
    const registry = MembraneRegistryFactory.createTestRegistry(
      `${systemId}_registry`,
      `${systemName} Registry`
    );

    // Create simple P-System
    const pSystem = PSystemFactory.createHierarchicalPSystem(
      `${systemId}_psystem`,
      `${systemName} P-System`,
      5, // Small max depth
      100 // Small max membranes
    );

    // Create basic router
    const router = MessageRouterFactory.createBasicRouter(
      `${systemId}_router`,
      `${systemName} Router`
    );

    // Register components
    registry.registerPSystem(pSystem);
    registry.registerRouter(router);

    // Attach router to P-System
    router.attachToPSystem(pSystem);

    return {
      registry,
      pSystem,
      router,
      systemId,
      systemName
    };
  }
}

/**
 * Membrane System Utilities
 */
export class MembraneSystemUtils {
  /**
   * Create a membrane with default tensor state
   */
  static createDefaultMembrane(
    id: string,
    name: string,
    tensorShape: number[] = [8, 8],
    kernelId: string = 'default_kernel'
  ): Membrane {
    const tensorData = new Float32Array(tensorShape.reduce((a, b) => a * b, 1));
    
    // Initialize with random values
    for (let i = 0; i < tensorData.length; i++) {
      tensorData[i] = Math.random() * 2 - 1; // Values between -1 and 1
    }

    return new Membrane(id, name, {
      tensorData,
      shape: tensorShape,
      kernelId,
      stateType: 'default'
    });
  }

  /**
   * Create a complete membrane hierarchy
   */
  static createMembraneHierarchy(
    rootId: string,
    rootName: string,
    depth: number,
    branchingFactor: number,
    pSystem: PSystem
  ): string[] {
    const membraneIds: string[] = [];

    // Create root membrane
    const rootMembrane = this.createDefaultMembrane(rootId, rootName);
    pSystem.addRootMembrane(rootMembrane);
    membraneIds.push(rootId);

    // Create hierarchy
    const createLevel = (parentId: string, currentDepth: number) => {
      if (currentDepth >= depth) return;

      for (let i = 0; i < branchingFactor; i++) {
        const childId = `${parentId}_child_${i}`;
        const childName = `Child ${i} of ${parentId}`;
        
        const childMembrane = this.createDefaultMembrane(childId, childName);
        const createdId = pSystem.createChildMembrane(
          parentId,
          {
            tensorData: childMembrane.getState('self')!.tensorData,
            shape: childMembrane.getState('self')!.shape,
            kernelId: `kernel_${childId}`,
            stateType: 'child'
          },
          childName
        );

        if (createdId) {
          membraneIds.push(createdId);
          createLevel(createdId, currentDepth + 1);
        }
      }
    };

    createLevel(rootId, 0);
    return membraneIds;
  }

  /**
   * Demonstrate membrane communication
   */
  static async demonstrateMembraneCommunication(
    system: {
      registry: MembraneRegistry;
      pSystem: PSystem;
      router: MessageRouter;
    }
  ): Promise<void> {
    console.log('🧪 Demonstrating membrane communication...');

    // Create some membranes
    const membraneIds = this.createMembraneHierarchy(
      'demo_root',
      'Demo Root Membrane',
      3, // depth
      2, // branching factor
      system.pSystem
    );

    console.log(`Created ${membraneIds.length} membranes in hierarchy`);

    // Register membranes with registry
    for (const membraneId of membraneIds) {
      const membrane = system.pSystem.getMembrane(membraneId);
      if (membrane) {
        system.registry.registerMembrane(membrane, system.pSystem.getId(), ['demo'], {
          type: 'demonstration',
          createdAt: Date.now()
        });

        // Register membrane with router
        system.router.registerMembrane(membrane);
      }
    }

    // Demonstrate membrane introspection
    for (const membraneId of membraneIds.slice(0, 3)) { // Check first 3 membranes
      const membrane = system.pSystem.getMembrane(membraneId);
      if (membrane) {
        const stateReport = membrane.getStateReport();
        const healthStatus = membrane.getHealthStatus();
        
        console.log(`\n📊 Membrane ${membraneId} Status:`);
        console.log(`  - Depth: ${stateReport.hierarchyInfo.depth}`);
        console.log(`  - Children: ${stateReport.hierarchyInfo.childCount}`);
        console.log(`  - Health: ${(healthStatus.overallHealth * 100).toFixed(1)}%`);
        console.log(`  - State Size: ${stateReport.stateSize} elements`);
      }
    }

    // Show registry statistics
    const stats = system.registry.getStatistics();
    console.log('\n📈 Registry Statistics:');
    console.log(`  - Total Membranes: ${stats.totalMembranes}`);
    console.log(`  - Healthy Membranes: ${stats.healthyMembranes}`);
    console.log(`  - Average Depth: ${stats.averageMembraneDepth.toFixed(2)}`);
    console.log(`  - Total Connections: ${stats.totalConnections}`);

    console.log('✅ Membrane communication demonstration completed!');
  }

  /**
   * Validate membrane system health
   */
  static async validateMembraneSystemHealth(
    system: {
      registry: MembraneRegistry;
      pSystem: PSystem;
      router: MessageRouter;
    }
  ): Promise<boolean> {
    console.log('🏥 Validating membrane system health...');

    // Check registry health
    const registryStats = system.registry.getStatistics();
    const registryHealthy = registryStats.totalMembranes > 0 && 
                           registryStats.healthyMembranes / registryStats.totalMembranes > 0.8;

    // Check P-System health
    const pSystemStats = system.pSystem.getStatistics();
    const pSystemHealthy = pSystemStats.totalMembranes > 0 &&
                          pSystemStats.evolutionCycles >= 0;

    // Check router health
    const routerStats = system.router.getStatistics();
    const routerHealthy = routerStats.messagesRouted >= 0 &&
                         (routerStats.messagesFailed / Math.max(routerStats.messagesRouted, 1)) < 0.2;

    const overallHealthy = registryHealthy && pSystemHealthy && routerHealthy;

    console.log(`Registry Health: ${registryHealthy ? '✅' : '❌'}`);
    console.log(`P-System Health: ${pSystemHealthy ? '✅' : '❌'}`);
    console.log(`Router Health: ${routerHealthy ? '✅' : '❌'}`);
    console.log(`Overall Health: ${overallHealthy ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);

    return overallHealthy;
  }
}