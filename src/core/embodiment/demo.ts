/**
 * Demonstration of sensorimotor data integration capabilities
 * Shows how to set up and use the embodiment system
 */

import { 
  SensorimotorManager,
  PSytemIntegrationEngine,
  SensorimotorMetaMonitor,
  VirtualSimulation,
  EmbodimentConfig,
  SensorType,
  MotorType 
} from './index';

async function demonstrateEmbodimentSystem() {
  console.log('🤖 Starting Sensorimotor Data Integration Demonstration...\n');

  // 1. Configure the embodiment system
  const config: EmbodimentConfig = {
    sensors: [
      {
        id: 'camera_main',
        type: 'visual' as SensorType,
        enabled: true,
        frequency: 30, // 30 Hz
        precision: 0.01,
        range: [0, 1]
      },
      {
        id: 'imu_head',
        type: 'orientation' as SensorType,
        enabled: true,
        frequency: 100, // 100 Hz
        precision: 0.001,
        range: [-180, 180]
      },
      {
        id: 'touch_sensor',
        type: 'tactile' as SensorType,
        enabled: true,
        frequency: 50,
        precision: 0.1,
        range: [0, 100]
      }
    ],
    motors: [
      {
        id: 'head_pan',
        type: 'joint' as MotorType,
        enabled: true,
        maxSpeed: 180, // degrees/sec
        maxForce: 10,
        range: [-90, 90],
        safetyLimits: {
          maxVelocity: 90,
          maxAcceleration: 45,
          maxForce: 8,
          jointLimits: [-90, 90],
          collisionAvoidance: true
        }
      },
      {
        id: 'display_screen',
        type: 'display' as MotorType,
        enabled: true,
        maxSpeed: 60, // fps
        maxForce: 1,
        range: [0, 1],
        safetyLimits: {
          maxVelocity: 60,
          maxAcceleration: 30,
          maxForce: 1
        }
      }
    ],
    updateRate: 20, // 20 Hz processing
    bufferSize: 200,
    timeout: 500,
    errorHandling: {
      retryAttempts: 3,
      timeoutHandling: 'interpolate',
      dataLossThreshold: 0.05, // 5%
      latencyThreshold: 50 // 50ms
    }
  };

  try {
    // 2. Initialize core components
    console.log('📋 Initializing embodiment components...');
    
    const manager = new SensorimotorManager(config);
    const psystemIntegrator = new PSytemIntegrationEngine();
    const metaMonitor = new SensorimotorMetaMonitor();
    
    // Connect components
    manager.setPSystemIntegrator(psystemIntegrator);
    manager.setMetaCognitiveMonitor(metaMonitor);
    
    console.log('✅ Core components initialized\n');

    // 3. Set up virtual simulation for testing
    console.log('🌐 Creating virtual simulation environment...');
    
    const simulation = new VirtualSimulation();
    await simulation.createVirtualEnvironment({
      gravity: [0, 0, -9.81],
      temperature: 22,
      lighting: 0.8,
      noise_level: 0.1
    });

    // Add virtual sensors
    const virtualCamera = await simulation.addVirtualSensor('visual', {
      resolution: [640, 480],
      frameRate: 30,
      fieldOfView: 60
    });

    const virtualIMU = await simulation.addVirtualSensor('orientation', {
      range: 360,
      precision: 0.1
    });

    // Add virtual motors
    const virtualJoint = await simulation.addVirtualMotor('joint', {
      maxAngle: 180,
      speed: 50
    });

    console.log('✅ Virtual environment created with sensors and motors\n');

    // 4. Demonstrate perception integration
    console.log('👁️  Testing perception integration...');
    
    const testStimuli = await simulation.generateRandomStimuli();
    console.log(`Generated ${testStimuli.length} random stimuli`);
    
    for (const stimulus of testStimuli) {
      const memoryEntry = await psystemIntegrator.integratePerception([stimulus]);
      console.log(`  📊 Integrated ${stimulus.type} data (significance: ${memoryEntry.significance.toFixed(3)})`);
    }
    
    console.log('✅ Perception integration working\n');

    // 5. Demonstrate action generation
    console.log('🎯 Testing action generation...');
    
    const actions = await psystemIntegrator.generateAction(
      'visual_perception', 
      'orient_toward_stimulus'
    );
    
    console.log(`Generated ${actions.length} motor commands`);
    for (const action of actions) {
      console.log(`  🔧 ${action.type} command (priority: ${action.priority})`);
    }
    
    console.log('✅ Action generation working\n');

    // 6. Demonstrate meta-cognitive monitoring
    console.log('🧠 Testing meta-cognitive monitoring...');
    
    await metaMonitor.startMonitoring();
    
    // Let it monitor for a short time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const diagnostics = await metaMonitor.getDiagnostics();
    console.log(`  📈 Overall system health: ${(diagnostics.overallHealth * 100).toFixed(1)}%`);
    console.log(`  🔍 Monitoring ${Object.keys(diagnostics.sensorHealth).length} sensors`);
    console.log(`  ⚙️  Monitoring ${Object.keys(diagnostics.motorHealth).length} motors`);
    
    // Test self-diagnosis
    const hasLatencyIssues = await metaMonitor.detectLatencyIssues();
    const hasDataLoss = await metaMonitor.detectDataLoss();
    const hasIntegrationErrors = await metaMonitor.detectIntegrationErrors();
    
    console.log(`  ⏱️  Latency issues detected: ${hasLatencyIssues ? 'Yes' : 'No'}`);
    console.log(`  📉 Data loss detected: ${hasDataLoss ? 'Yes' : 'No'}`);
    console.log(`  ⚠️  Integration errors: ${hasIntegrationErrors ? 'Yes' : 'No'}`);
    
    await metaMonitor.stopMonitoring();
    console.log('✅ Meta-cognitive monitoring working\n');

    // 7. Demonstrate simulation scenarios
    console.log('🎮 Testing simulation scenarios...');
    
    await simulation.loadScenario('sensor_test');
    await simulation.startSimulation();
    
    console.log('  🏃 Running sensor test scenario...');
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const stats = simulation.getSimulationStats();
    console.log(`  📊 Simulation time: ${stats.time}ms, FPS: ${stats.fps}`);
    
    await simulation.stopSimulation();
    console.log('✅ Simulation scenarios working\n');

    // 8. Demonstrate behavior validation
    console.log('✅ Testing behavior validation...');
    
    const expectedBehavior = [1.0, 2.0, 3.0];
    const actualBehavior = [1.05, 1.98, 3.02];
    
    const isValid = await simulation.validateBehavior(expectedBehavior, actualBehavior);
    console.log(`  🎯 Behavior validation result: ${isValid ? 'PASS' : 'FAIL'}`);
    
    console.log('✅ Behavior validation working\n');

    // 9. Demonstrate integration memory queries
    console.log('🔍 Testing memory integration...');
    
    const memoryResults = await psystemIntegrator.queryMemory('visual_perception');
    console.log(`  📚 Found ${memoryResults.length} relevant memory entries`);
    
    if (memoryResults.length > 0) {
      const entry = memoryResults[0];
      console.log(`  📝 Most relevant entry: ${entry.context} (significance: ${entry.significance.toFixed(3)})`);
    }
    
    console.log('✅ Memory integration working\n');

    console.log('🎉 Sensorimotor Data Integration Demonstration Complete!');
    console.log('\n📋 Summary of Capabilities Demonstrated:');
    console.log('  ✓ Virtual/robotic sensor data ingestion');
    console.log('  ✓ Motor command generation and execution');
    console.log('  ✓ P-System integration for cognitive grounding');
    console.log('  ✓ Meta-cognitive self-diagnosis and monitoring');
    console.log('  ✓ Latency, data loss, and integration error detection');
    console.log('  ✓ Virtual simulation environment for testing');
    console.log('  ✓ Behavior validation and scenario testing');
    console.log('  ✓ Memory-based sensorimotor learning');

  } catch (error) {
    console.error('❌ Error during demonstration:', error);
    throw error;
  }
}

// Run demonstration if this file is executed directly
// Note: import.meta is not available in current TypeScript config
// This would work in a Node.js ES module environment
export { demonstrateEmbodimentSystem };