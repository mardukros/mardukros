import { execSync } from 'child_process';
import { rimraf } from 'rimraf';

// Clean dist directory
console.log('Cleaning dist directory...');
await rimraf('./dist');

// Run TypeScript compiler
console.log('Compiling TypeScript...');
execSync('tsc', { stdio: 'inherit' });

console.log('Build completed successfully!');