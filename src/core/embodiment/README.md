# Sensorimotor Data Integration for Marduk AGI Framework

This module provides comprehensive sensorimotor data integration capabilities for the Marduk AGI Framework, enabling grounding of cognition in perception and action.

## Overview

The sensorimotor integration system consists of several key components:

### Core Components

1. **Embodiment Manager** (`SensorimotorManager`) - Central orchestration of all sensorimotor components
2. **P-System Integrator** (`PSytemIntegrationEngine`) - Cognitive grounding through memory integration
3. **Meta-Cognitive Monitor** (`SensorimotorMetaMonitor`) - Self-diagnosis and optimization
4. **Virtual Simulation** (`VirtualSimulation`) - Testing and validation environment

### Key Features

- **Multi-modal Sensor Support**: Visual, auditory, tactile, proprioceptive, and custom sensor types
- **Motor Control**: Joint control, displays, speech synthesis, and custom actuators
- **Cognitive Integration**: Maps sensorimotor data to memory representations
- **Self-Diagnosis**: Detects latency issues, data loss, and integration errors
- **Virtual Testing**: Comprehensive simulation environment for validation

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 Embodiment Manager                      │
├───────────────┬───────────────┬───────────────┬─────────┤
│ Sensor Layer  │ Motor Layer   │ P-System      │ Meta-   │
│               │               │ Integration   │ Monitor │
├───────────────┼───────────────┼───────────────┼─────────┤
│ - Visual      │ - Joint       │ - Memory      │ - Health│
│ - Audio       │ - Linear      │ - Context     │ - Errors│
│ - Tactile     │ - Display     │ - Learning    │ - Optim │
│ - Position    │ - Speech      │ - Association │ - Repair│
└───────────────┴───────────────┴───────────────┴─────────┘
```

## Usage

### Basic Setup

```typescript
import { 
  SensorimotorManager, 
  PSytemIntegrationEngine,
  SensorimotorMetaMonitor,
  EmbodimentConfig 
} from './embodiment';

// Configure the embodiment system
const config: EmbodimentConfig = {
  sensors: [
    {
      id: 'camera_main',
      type: 'visual',
      enabled: true,
      frequency: 30,
      precision: 0.01
    }
  ],
  motors: [
    {
      id: 'head_pan',
      type: 'joint',
      enabled: true,
      maxSpeed: 180,
      maxForce: 10,
      safetyLimits: {
        maxVelocity: 90,
        jointLimits: [-90, 90]
      }
    }
  ],
  updateRate: 20,
  bufferSize: 200,
  timeout: 500
};

// Initialize components
const manager = new SensorimotorManager(config);
const psystemIntegrator = new PSytemIntegrationEngine();
const metaMonitor = new SensorimotorMetaMonitor();

// Connect components
manager.setPSystemIntegrator(psystemIntegrator);
manager.setMetaCognitiveMonitor(metaMonitor);

// Start processing
await manager.startProcessing();
```

### Virtual Testing

```typescript
import { VirtualSimulation } from './embodiment';

const simulation = new VirtualSimulation();

// Create virtual environment
await simulation.createVirtualEnvironment({
  gravity: [0, 0, -9.81],
  temperature: 22,
  lighting: 0.8
});

// Add virtual sensors and motors
const virtualCamera = await simulation.addVirtualSensor('visual', {
  resolution: [640, 480],
  frameRate: 30
});

const virtualJoint = await simulation.addVirtualMotor('joint', {
  maxAngle: 180,
  speed: 50
});

// Run test scenarios
await simulation.loadScenario('sensor_test');
await simulation.startSimulation();
```

## Data Types

### Sensor Data
```typescript
interface SensorData {
  timestamp: number;
  source: string;
  type: SensorType;
  value: SensorValue;
  quality: DataQuality;
  calibration?: CalibrationData;
}
```

### Motor Commands
```typescript
interface MotorCommand {
  timestamp: number;
  source: string;
  type: MotorType;
  target: MotorTarget;
  priority: number;
  constraints?: MotorConstraints;
}
```

### Quality Metrics
```typescript
interface DataQuality {
  reliability: number;  // 0-1 scale
  latency: number;      // milliseconds
  completeness: number; // 0-1 scale
  errorFlags: string[];
}
```

## Meta-Cognitive Capabilities

The system includes self-diagnostic and optimization features:

### Self-Diagnosis
- **Latency Detection**: Monitors processing delays and response times
- **Data Loss Detection**: Identifies missing or corrupted sensor data
- **Integration Errors**: Detects cognitive mapping failures

### Self-Repair
- **Automatic Calibration**: Re-calibrates sensors when issues are detected
- **Reconnection Attempts**: Recovers from component failures
- **Data Flow Optimization**: Adjusts processing parameters for performance

### Health Monitoring
```typescript
const diagnostics = await metaMonitor.getDiagnostics();
console.log(`System Health: ${diagnostics.overallHealth * 100}%`);
console.log(`Sensor Count: ${Object.keys(diagnostics.sensorHealth).length}`);
console.log(`Motor Count: ${Object.keys(diagnostics.motorHealth).length}`);
```

## Testing

The module includes comprehensive tests covering:

- Perception integration
- Action generation
- Meta-cognitive monitoring
- Simulation environments
- Behavior validation

Run tests with:
```bash
npm test src/core/embodiment/__tests__/
```

## Integration with Marduk Framework

The sensorimotor system integrates with the existing Marduk framework through:

1. **Memory Systems**: Stores sensorimotor experiences in episodic and procedural memory
2. **Task System**: Receives action goals and generates motor commands
3. **AI System**: Uses sensorimotor context for improved responses
4. **Autonomy System**: Self-monitors and optimizes sensorimotor processing

## Future Extensions

- Hardware interfaces for real robots
- Advanced sensor fusion algorithms
- Learning-based motor control
- Emotional expression mapping
- Multi-agent coordination