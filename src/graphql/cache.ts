import NodeCache from 'node-cache';
import fs from 'fs';
import path from 'path';

const cache = new NodeCache({ stdTTL: 3600 }); // Cache TTL set to 1 hour

export function getCachedIntrospectionResult(key) {
  return cache.get(key);
}

export function setCachedIntrospectionResult(key, value) {
  cache.set(key, value);
}

export function invalidateCacheOnSchemaChange(schemaFilePath) {
  fs.watch(schemaFilePath, (eventType, filename) => {
    if (eventType === 'change') {
      cache.flushAll();
    }
  });
}

// Monitor schema files for changes to invalidate cache
const schemaFilePath = path.resolve(__dirname, 'schema.ts');
const resolversFilePath = path.resolve(__dirname, 'resolvers.ts');
invalidateCacheOnSchemaChange(schemaFilePath);
invalidateCacheOnSchemaChange(resolversFilePath);
