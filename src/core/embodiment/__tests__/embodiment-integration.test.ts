/**
 * Basic integration test for sensorimotor systems
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { 
  SensorimotorManager,
  PSytemIntegrationEngine,
  SensorimotorMetaMonitor,
  VirtualSimulation,
  EmbodimentConfig,
  SensorData,
  MotorCommand,
  SensorType,
  MotorType 
} from '../index';

describe('Sensorimotor Integration', () => {
  let manager: SensorimotorManager;
  let psystemIntegrator: PSytemIntegrationEngine;
  let metaMonitor: SensorimotorMetaMonitor;
  let simulation: VirtualSimulation;
  let config: EmbodimentConfig;

  beforeEach(async () => {
    // Create test configuration
    config = {
      sensors: [
        {
          id: 'test_camera',
          type: 'visual' as SensorType,
          enabled: true,
          frequency: 10,
          precision: 0.01,
          range: [0, 1]
        },
        {
          id: 'test_imu',
          type: 'orientation' as SensorType,
          enabled: true,
          frequency: 50,
          precision: 0.001,
          range: [-180, 180]
        }
      ],
      motors: [
        {
          id: 'test_joint',
          type: 'joint' as MotorType,
          enabled: true,
          maxSpeed: 100,
          maxForce: 50,
          range: [-90, 90],
          safetyLimits: {
            maxVelocity: 50,
            maxAcceleration: 20,
            maxForce: 30,
            jointLimits: [-90, 90],
            collisionAvoidance: true
          }
        }
      ],
      updateRate: 10,
      bufferSize: 100,
      timeout: 1000,
      errorHandling: {
        retryAttempts: 3,
        timeoutHandling: 'interpolate',
        dataLossThreshold: 0.05,
        latencyThreshold: 100
      }
    };

    // Initialize components
    manager = new SensorimotorManager(config);
    psystemIntegrator = new PSytemIntegrationEngine();
    metaMonitor = new SensorimotorMetaMonitor();
    simulation = new VirtualSimulation();

    // Set up integrations
    manager.setPSystemIntegrator(psystemIntegrator);
    manager.setMetaCognitiveMonitor(metaMonitor);
  });

  afterEach(async () => {
    if (manager) {
      await manager.shutdown();
    }
    if (simulation) {
      await simulation.stopSimulation();
    }
  });

  test('should create and configure embodiment manager', () => {
    expect(manager).toBeDefined();
    expect(manager.config).toEqual(config);
  });

  test('should integrate perception data', async () => {
    const testSensorData: SensorData[] = [
      {
        timestamp: Date.now(),
        source: 'test_camera',
        type: 'visual',
        value: 0.75,
        quality: {
          reliability: 0.95,
          latency: 25,
          completeness: 1.0,
          errorFlags: []
        }
      },
      {
        timestamp: Date.now(),
        source: 'test_imu',
        type: 'orientation',
        value: [0, 0, 45],
        quality: {
          reliability: 0.98,
          latency: 10,
          completeness: 1.0,
          errorFlags: []
        }
      }
    ];

    const memoryEntry = await psystemIntegrator.integratePerception(testSensorData);

    expect(memoryEntry).toBeDefined();
    expect(memoryEntry.id).toBeDefined();
    expect(memoryEntry.sensorData).toEqual(testSensorData);
    expect(memoryEntry.context).toContain('visual_perception');
    expect(memoryEntry.significance).toBeGreaterThan(0);
  });

  test('should generate motor commands from context', async () => {
    // First integrate some perceptions to build memory
    const testSensorData: SensorData[] = [
      {
        timestamp: Date.now(),
        source: 'test_camera',
        type: 'visual',
        value: 0.5,
        quality: {
          reliability: 0.9,
          latency: 30,
          completeness: 1.0,
          errorFlags: []
        }
      }
    ];

    await psystemIntegrator.integratePerception(testSensorData);

    // Generate actions based on context
    const actions = await psystemIntegrator.generateAction('visual_perception', 'respond_to_stimulus');

    expect(Array.isArray(actions)).toBe(true);
    // Note: actions array might be empty if no relevant patterns are found
  });

  test('should perform meta-cognitive monitoring', async () => {
    await metaMonitor.startMonitoring();

    // Wait a short time for monitoring to collect data
    await new Promise(resolve => setTimeout(resolve, 100));

    const diagnostics = await metaMonitor.getDiagnostics();

    expect(diagnostics).toBeDefined();
    expect(diagnostics.overallHealth).toBeGreaterThanOrEqual(0);
    expect(diagnostics.overallHealth).toBeLessThanOrEqual(1);
    expect(diagnostics.lastUpdate).toBeDefined();

    await metaMonitor.stopMonitoring();
  });

  test('should detect latency issues', async () => {
    await metaMonitor.startMonitoring();

    // Test latency detection (should not detect issues with no components)
    const hasLatencyIssues = await metaMonitor.detectLatencyIssues();
    expect(typeof hasLatencyIssues).toBe('boolean');

    await metaMonitor.stopMonitoring();
  });

  test('should create virtual simulation environment', async () => {
    await simulation.createVirtualEnvironment({
      gravity: [0, 0, -9.81],
      temperature: 25,
      lighting: 1.0
    });

    const stats = simulation.getSimulationStats();
    expect(stats.running).toBe(false);
    expect(stats.sensorCount).toBe(0);
    expect(stats.motorCount).toBe(0);
  });

  test('should add virtual sensors and motors', async () => {
    await simulation.createVirtualEnvironment({});

    const virtualSensor = await simulation.addVirtualSensor('visual', {
      resolution: [640, 480],
      frameRate: 30
    });

    const virtualMotor = await simulation.addVirtualMotor('joint', {
      maxAngle: 180,
      speed: 50
    });

    expect(virtualSensor).toBeDefined();
    expect(virtualSensor.sensorType).toBe('visual');
    expect(virtualMotor).toBeDefined();
    expect(virtualMotor.motorType).toBe('joint');

    const stats = simulation.getSimulationStats();
    expect(stats.sensorCount).toBe(1);
    expect(stats.motorCount).toBe(1);
  });

  test('should generate random stimuli', async () => {
    const stimuli = await simulation.generateRandomStimuli();

    expect(Array.isArray(stimuli)).toBe(true);
    expect(stimuli.length).toBeGreaterThan(0);

    // Check stimulus structure
    for (const stimulus of stimuli) {
      expect(stimulus.timestamp).toBeDefined();
      expect(stimulus.source).toBeDefined();
      expect(stimulus.type).toBeDefined();
      expect(stimulus.value).toBeDefined();
      expect(stimulus.quality).toBeDefined();
    }
  });

  test('should validate behavior', async () => {
    // Test numeric validation
    const numericResult = await simulation.validateBehavior(1.0, 1.05);
    expect(numericResult).toBe(true);

    const numericFailResult = await simulation.validateBehavior(1.0, 1.5);
    expect(numericFailResult).toBe(false);

    // Test array validation
    const arrayResult = await simulation.validateBehavior([1, 2, 3], [1.01, 2.02, 3.03]);
    expect(arrayResult).toBe(true);

    // Test object validation
    const objectResult = await simulation.validateBehavior({ a: 1 }, { a: 1 });
    expect(objectResult).toBe(true);
  });

  test('should load and run simulation scenarios', async () => {
    await simulation.createVirtualEnvironment({});
    
    // Load a built-in test scenario
    await simulation.loadScenario('sensor_test');

    // Start simulation
    await simulation.startSimulation();
    
    // Let it run briefly
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const stats = simulation.getSimulationStats();
    expect(stats.running).toBe(true);
    expect(stats.time).toBeGreaterThan(0);

    await simulation.stopSimulation();
  });

  test('should handle sensor data quality', () => {
    const highQualityData: SensorData = {
      timestamp: Date.now(),
      source: 'test_sensor',
      type: 'visual',
      value: 1.0,
      quality: {
        reliability: 0.98,
        latency: 5,
        completeness: 1.0,
        errorFlags: []
      }
    };

    const lowQualityData: SensorData = {
      timestamp: Date.now(),
      source: 'test_sensor',
      type: 'visual',
      value: 0.5,
      quality: {
        reliability: 0.3,
        latency: 200,
        completeness: 0.7,
        errorFlags: ['high_noise', 'packet_loss']
      }
    };

    expect(highQualityData.quality.reliability).toBeGreaterThan(lowQualityData.quality.reliability);
    expect(highQualityData.quality.latency).toBeLessThan(lowQualityData.quality.latency);
    expect(lowQualityData.quality.errorFlags.length).toBeGreaterThan(0);
  });

  test('should map sensor data to memory representations', async () => {
    const testSensorData: SensorData = {
      timestamp: Date.now(),
      source: 'test_sensor',
      type: 'visual',
      value: 0.8,
      quality: {
        reliability: 0.95,
        latency: 20,
        completeness: 1.0,
        errorFlags: []
      }
    };

    const cognitiveRepresentation = await psystemIntegrator.mapSensorToMemory(testSensorData);

    expect(cognitiveRepresentation).toBeDefined();
    expect(cognitiveRepresentation.sensoryModality).toBe('visual');
    expect(cognitiveRepresentation.features).toBeDefined();
    expect(cognitiveRepresentation.semanticTags).toBeDefined();
    expect(Array.isArray(cognitiveRepresentation.semanticTags)).toBe(true);
  });
});