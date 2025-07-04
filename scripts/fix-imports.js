
#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

// File extensions to process
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
// Directories to exclude
const EXCLUDE_DIRS = ['node_modules', 'dist', '.git'];

// RegExp for finding imports without .js extension
const IMPORT_REGEX = /import\s+(?:{[^}]*}|\*\s+as\s+[^\s;]+|[^\s;,]+)\s+from\s+['"]([^'"]+)['"]/g;
// RegExp for CommonJS require statement detection
const REQUIRE_REGEX = /(?:const|let|var)\s+(?:{[^}]*}|\*\s+as\s+[^\s;]+|[^\s;,]+)\s+=\s+require\(['"]([^'"]+)['"]\)/g;
// RegExp for detecting require.main === module
const MAIN_MODULE_REGEX = /require\.main\s*===\s*module/g;

async function findFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(entry.name)) {
        files.push(...(await findFiles(fullPath)));
      }
    } else if (entry.isFile() && EXTENSIONS.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

async function fixImports(files) {
  let fixedFiles = 0;
  
  for (const file of files) {
    let content = await fs.readFile(file, 'utf8');
    let originalContent = content;
    
    // Fix imports without .js extension
    content = content.replace(IMPORT_REGEX, (match, importPath) => {
      // Only add .js to relative imports without extensions
      if (importPath.startsWith('.') && !path.extname(importPath)) {
        return match.replace(`'${importPath}'`, `'${importPath}.js'`).replace(`"${importPath}"`, `"${importPath}.js"`);
      }
      return match;
    });
    
    // Fix require.main === module pattern
    if (MAIN_MODULE_REGEX.test(content)) {
      content = content.replace(MAIN_MODULE_REGEX, 
        `import.meta.url.endsWith(process.argv[1].replace('file://', ''))`);
    }
    
    // Only write if changed
    if (content !== originalContent) {
      await fs.writeFile(file, content, 'utf8');
      console.log(`Fixed imports in: ${file}`);
      fixedFiles++;
    }
  }
  
  return fixedFiles;
}

async function main() {
  console.log('⚡ INITIATING NEURAL PATHWAY REALIGNMENT! ⚡');
  console.log('Scanning TypeScript files to fix ES Module imports...');
  
  const files = await findFiles(ROOT_DIR);
  console.log(`Found ${files.length} files to analyze`);
  
  const fixedCount = await fixImports(files);
  console.log(`\n✅ Import transformation complete! Fixed ${fixedCount} files.`);
  console.log('⚡ COGNITIVE ARCHITECTURE HARMONIZED! ⚡');
}

main().catch(error => {
  console.error('Error fixing imports:', error);
  process.exit(1);
});
