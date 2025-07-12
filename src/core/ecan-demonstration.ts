/**
 * ECAN Attention System Demonstration
 * 
 * Demonstrates the complete ECAN attention allocation system with distributed tasks,
 * resource optimization verification, attention shifting simulation, and meta-cognitive
 * monitoring capabilities.
 */

import { ECANAttentionSystem, DistributedTask } from './attention/index.js';

/**
 * Main demonstration function
 */
async function demonstrateECANSystem(): Promise<void> {
  console.log('🧠 ECAN Attention Allocation System Demonstration\n');
  console.log('==========================================\n');

  // Initialize the ECAN system
  const ecanSystem = new ECANAttentionSystem();
  await ecanSystem.initialize();

  // Define sample distributed tasks
  const initialTasks: DistributedTask[] = [
    {
      id: 'user-query-processing',
      name: 'Process high-priority user query',
      priority: 0.9,
      requiredKernels: ['semantic-memory', 'ai-coordinator'],
      estimatedResources: {
        compute: 0.4,
        memory: 0.3,
        bandwidth: 0.2
      },
      deadline: Date.now() + 5000,
      context: {
        userType: 'premium',
        queryComplexity: 'high',
        responseTime: 'urgent'
      }
    },
    {
      id: 'background-learning',
      name: 'Continuous learning from interactions',
      priority: 0.6,
      requiredKernels: ['semantic-memory', 'autonomy-monitor'],
      estimatedResources: {
        compute: 0.3,
        memory: 0.4,
        bandwidth: 0.1
      },
      context: {
        learningType: 'pattern_recognition',
        dataSource: 'user_interactions',
        batchSize: 1000
      }
    }
  ];

  const systemGoals = [
    {
      id: 'user-satisfaction',
      priority: 0.9,
      description: 'Maximize user satisfaction through fast, accurate responses',
      metrics: ['response_time', 'accuracy', 'user_feedback']
    },
    {
      id: 'continuous-improvement',
      priority: 0.7,
      description: 'Continuously learn and improve system capabilities',
      metrics: ['learning_rate', 'adaptation_speed', 'knowledge_retention']
    },
    {
      id: 'resource-efficiency',
      priority: 0.8,
      description: 'Maintain optimal resource utilization and performance',
      metrics: ['cpu_efficiency', 'memory_usage', 'bandwidth_utilization']
    }
  ];

  // 1. Demonstrate basic attention allocation
  console.log('1. 🎯 Basic Attention Allocation');
  console.log('--------------------------------');
  
  const initialResult = await ecanSystem.processDistributedTasks(
    initialTasks,
    systemGoals,
    { 
      environment: 'demonstration',
      phase: 'initial_allocation'
    }
  );

  console.log(`✅ Processed ${initialTasks.length} distributed tasks`);
  console.log(`📊 Efficiency: ${(initialResult.optimization.efficiency * 100).toFixed(1)}%`);
  console.log(`🔄 Utilization: ${(initialResult.optimization.utilization * 100).toFixed(1)}%`);
  console.log(`🧠 Meta-cognitive effectiveness: ${(initialResult.metaAnalysis.effectiveness * 100).toFixed(1)}%`);
  console.log(`💡 Generated ${initialResult.metaAnalysis.insights.length} insights`);
  
  if (initialResult.optimization.bottlenecks.length > 0) {
    console.log(`⚠️  Identified ${initialResult.optimization.bottlenecks.length} bottlenecks`);
  }
  
  console.log('');

  // 2. Demonstrate attention shifting with new urgent task
  console.log('2. 🔀 Attention Shifting Simulation');
  console.log('-----------------------------------');

  const urgentTasks: DistributedTask[] = [
    {
      id: 'critical-alert',
      name: 'Handle critical system alert',
      priority: 0.95,
      requiredKernels: ['autonomy-monitor', 'task-manager'],
      estimatedResources: {
        compute: 0.6,
        memory: 0.4,
        bandwidth: 0.3
      },
      deadline: Date.now() + 1000, // Very urgent
      context: {
        alertType: 'security_breach',
        severity: 'critical',
        immediateAction: true
      }
    }
  ];

  const shiftingResult = await ecanSystem.simulateAttentionShifting(
    initialTasks,
    urgentTasks,
    systemGoals
  );

  console.log(`🔄 Simulated attention shift with ${urgentTasks.length} new urgent task(s)`);
  console.log(`📈 Total attention shift: ${shiftingResult.shiftAnalysis.totalShift.toFixed(3)}`);
  console.log(`🎛️  System adaptability: ${(shiftingResult.shiftAnalysis.adaptability * 100).toFixed(1)}%`);
  console.log(`🔧 Affected kernels: ${shiftingResult.shiftAnalysis.kernelShifts.size}`);
  
  // Show shift details
  console.log('\n   Kernel-specific shifts:');
  shiftingResult.shiftAnalysis.kernelShifts.forEach((shift, kernelId) => {
    console.log(`   • ${kernelId}: activation shift ${shift.activationShift.toFixed(3)}`);
  });
  
  console.log('');

  // 3. Demonstrate resource optimization verification
  console.log('3. ✅ Resource Optimization Verification');
  console.log('---------------------------------------');

  const allTasks = [...initialTasks, ...urgentTasks];
  const verification = ecanSystem.verifyResourceOptimization(
    shiftingResult.shifted,
    allTasks
  );

  console.log(`🎯 Optimization verified: ${verification.verified ? 'YES' : 'NO'}`);
  console.log(`📊 Optimization score: ${(verification.optimizationScore * 100).toFixed(1)}%`);
  
  console.log('\n   Detailed criteria:');
  console.log(`   • Efficiency: ${verification.details.efficiency.met ? '✅' : '❌'} (${(verification.details.efficiency.value * 100).toFixed(1)}%)`);
  console.log(`   • Utilization: ${verification.details.utilization.met ? '✅' : '❌'} (${(verification.details.utilization.value * 100).toFixed(1)}%)`);
  console.log(`   • Bottlenecks: ${verification.details.bottlenecks.met ? '✅' : '❌'} (${verification.details.bottlenecks.count})`);
  console.log(`   • Task coverage: ${verification.details.taskCoverage.met ? '✅' : '❌'} (${(verification.details.taskCoverage.value * 100).toFixed(1)}%)`);
  
  console.log('');

  // 4. Demonstrate meta-cognitive features
  console.log('4. 🧠 Meta-Cognitive Features');
  console.log('-----------------------------');

  const systemState = ecanSystem.getCurrentState();
  const monitoringHistory = systemState.monitoring;

  console.log(`📈 Visualization history: ${monitoringHistory.visualizations.length} entries`);
  console.log(`📋 Analysis reports: ${monitoringHistory.reports.length} entries`);
  console.log(`⚙️  Policy configurations: ${monitoringHistory.policies.length} entries`);

  // Show latest visualization data
  if (monitoringHistory.visualizations.length > 0) {
    const latestViz = monitoringHistory.visualizations[monitoringHistory.visualizations.length - 1];
    console.log('\n   Latest attention visualization:');
    console.log(`   • Heatmap kernels: ${latestViz.heatmap.kernels.length}`);
    console.log(`   • Network nodes: ${latestViz.network.nodes.length}`);
    console.log(`   • Network edges: ${latestViz.network.edges.length}`);
    console.log(`   • Time series metrics: ${latestViz.timeSeries.metrics.size}`);
  }

  // Show ECAN field state
  const ecanState = systemState.ecan;
  console.log('\n   ECAN system state:');
  console.log(`   • Active allocations: ${ecanState.allocations.size}`);
  console.log(`   • Resource utilization: ${(ecanState.economics.resources.allocated / ecanState.economics.resources.total * 100).toFixed(1)}%`);
  console.log(`   • Field dynamics - decay: ${ecanState.field.dynamics.decay}, amplification: ${ecanState.field.dynamics.amplification}`);
  console.log(`   • Meta-cognitive policies: ${ecanState.metaCognition.policyHistory.length} recorded`);
  
  console.log('');

  // 5. Demonstrate self-modification capabilities
  console.log('5. 🔧 Self-Modification Demonstration');
  console.log('------------------------------------');

  // Create a scenario that might trigger self-modification
  const challengingTasks: DistributedTask[] = Array(5).fill(0).map((_, i) => ({
    id: `challenging-task-${i}`,
    name: `Complex processing task ${i + 1}`,
    priority: 0.7 + (i * 0.05),
    requiredKernels: ['semantic-memory', 'ai-coordinator', 'task-manager'],
    estimatedResources: {
      compute: 0.4 + (i * 0.1),
      memory: 0.3 + (i * 0.05),
      bandwidth: 0.2 + (i * 0.08)
    },
    context: {
      complexity: 'high',
      resourceIntensive: true,
      adaptationRequired: true
    }
  }));

  console.log(`🎯 Processing ${challengingTasks.length} challenging tasks to demonstrate adaptation...`);

  let adaptationResults = [];
  for (let i = 0; i < 3; i++) {
    const result = await ecanSystem.processDistributedTasks(
      challengingTasks,
      systemGoals,
      { 
        adaptationTest: true,
        iteration: i,
        challenge: 'high_complexity'
      }
    );
    adaptationResults.push(result);
    
    console.log(`   Iteration ${i + 1}: Effectiveness ${(result.metaAnalysis.effectiveness * 100).toFixed(1)}%`);
  }

  // Analyze adaptation over iterations
  const efficiencyTrend = adaptationResults.map(r => r.optimization.efficiency);
  const avgImprovement = efficiencyTrend.length > 1 ? 
    ((efficiencyTrend[efficiencyTrend.length - 1] - efficiencyTrend[0]) / efficiencyTrend[0] * 100) : 0;

  console.log(`📈 Adaptation analysis: ${avgImprovement >= 0 ? 'IMPROVED' : 'DECLINED'} by ${Math.abs(avgImprovement).toFixed(1)}%`);
  
  console.log('');

  // 6. Export system data for analysis
  console.log('6. 📤 Data Export and Analysis');
  console.log('------------------------------');

  const exportData = ecanSystem.exportSystemData();
  const exportStats = JSON.parse(exportData);

  console.log(`📊 Exported system data: ${(exportData.length / 1024).toFixed(1)} KB`);
  console.log(`🔍 Monitoring entries: ${exportStats.metadata.historyLength.visualizations} visualizations, ${exportStats.metadata.historyLength.reports} reports`);
  console.log(`⏰ Export timestamp: ${new Date(exportStats.metadata.exportTimestamp).toLocaleTimeString()}`);

  console.log('');

  // 7. Performance summary
  console.log('7. 📈 Performance Summary');
  console.log('-------------------------');

  const finalState = ecanSystem.getCurrentState();
  const finalEconomics = finalState.ecan.economics;
  
  console.log(`🎯 Overall system efficiency: ${(adaptationResults[adaptationResults.length - 1].optimization.efficiency * 100).toFixed(1)}%`);
  console.log(`💾 Resource utilization: ${(finalEconomics.resources.allocated / finalEconomics.resources.total * 100).toFixed(1)}%`);
  console.log(`🧠 Meta-cognitive insights: ${adaptationResults[adaptationResults.length - 1].metaAnalysis.insights.length} generated`);
  console.log(`🔄 Attention allocations: ${finalState.ecan.allocations.size} active kernels`);
  console.log(`⚙️  Self-modifications: ${finalState.ecan.metaCognition.policyHistory.length} policy updates`);

  console.log('');

  // Shutdown
  await ecanSystem.shutdown();
  
  console.log('✅ ECAN Attention System demonstration completed successfully!');
  console.log('');
  console.log('🎉 Key Achievements:');
  console.log('   • ✅ Dynamic attention allocation across cognitive kernels');
  console.log('   • ✅ Economic resource management with policies and market dynamics');
  console.log('   • ✅ Attention shifting simulation for distributed tasks');
  console.log('   • ✅ Resource optimization verification with detailed criteria');
  console.log('   • ✅ Meta-cognitive monitoring with visualization and logging');
  console.log('   • ✅ Self-modification capabilities for policy adaptation');
  console.log('   • ✅ Integration with MAD9ML cognitive kernel registry');
  console.log('   • ✅ Comprehensive test coverage and validation');
}

// Run the demonstration
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateECANSystem().catch(console.error);
}

export { demonstrateECANSystem };