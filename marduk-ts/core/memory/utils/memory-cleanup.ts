import { MemoryItem } from '../types/base-types.js';

export async function cleanupMemory(
  items: Map<string | number, MemoryItem>,
  capacity: number
): Promise<void> {
  if (items.size <= capacity) return;

  const itemsArray = Array.from(items.entries());
  itemsArray.sort((a, b) => {
    const aAccessed = (a[1].metadata?.lastAccessed as number) || 0;
    const bAccessed = (b[1].metadata?.lastAccessed as number) || 0;
    return aAccessed - bAccessed;
  });

  // Remove oldest 10% of items
  const removeCount = Math.floor(items.size * 0.1);
  itemsArray.slice(0, removeCount).forEach(([id]) => items.delete(id));
}

export function calculateMemoryUsage(items: Map<string | number, MemoryItem>): number {
  return Array.from(items.values()).reduce((total, item) => {
    return total + JSON.stringify(item).length;
  }, 0);
}