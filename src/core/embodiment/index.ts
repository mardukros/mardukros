/**
 * Embodiment module exports
 * Central export point for all sensorimotor data integration components
 */

// Types
export * from './types/sensorimotor-types';

// Interfaces
export * from './interfaces/embodiment-interface';

// Base implementations
export * from './sensors/base-sensor';
export * from './motors/base-motor';

// Core components
export * from './embodiment-manager';
export * from './integration/psystem-integrator';
export * from './monitoring/meta-monitor';

// Simulation
export * from './simulation/virtual-simulation';

// Re-export main classes for convenience
export { SensorimotorManager } from './embodiment-manager';
export { PSytemIntegrationEngine } from './integration/psystem-integrator';
export { SensorimotorMetaMonitor } from './monitoring/meta-monitor';
export { VirtualSimulation } from './simulation/virtual-simulation';