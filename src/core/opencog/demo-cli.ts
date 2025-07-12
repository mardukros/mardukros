#!/usr/bin/env node

/**
 * OpenCog AtomSpace & PLN Integration CLI Demo
 * 
 * Command-line interface for demonstrating the AtomSpace and PLN adapters
 * with interactive reasoning queries and consistency checks.
 */

import { runCompleteIntegrationDemo } from './integration-examples.js';

async function main() {
  console.log('🚀 OpenCog AtomSpace & PLN Integration Demo\n');
  
  try {
    await runCompleteIntegrationDemo();
  } catch (error) {
    console.error('❌ Demo failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}