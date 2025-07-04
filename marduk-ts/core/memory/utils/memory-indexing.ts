import { MemoryItem, MemoryQuery } from '../types/base-types.js';

export class MemoryIndex {
  private indices: Map<string, Map<string, Set<string | number>>> = new Map();

  addIndex(field: string): void {
    if (!this.indices.has(field)) {
      this.indices.set(field, new Map());
    }
  }

  indexItem(item: MemoryItem): void {
    this.indices.forEach((index, field) => {
      const value = this.getFieldValue(item, field);
      if (value !== undefined) {
        if (!index.has(value)) {
          index.set(value, new Set());
        }
        index.get(value)?.add(item.id);
      }
    });
  }

  findItems(query: MemoryQuery, items: Map<string | number, MemoryItem>): MemoryItem[] {
    const matchingIds = new Set<string | number>();
    let isFirstIndex = true;

    this.indices.forEach((index, field) => {
      const value = this.getQueryValue(query, field);
      if (value !== undefined) {
        const ids = index.get(value) || new Set();
        if (isFirstIndex) {
          ids.forEach(id => matchingIds.add(id));
          isFirstIndex = false;
        } else {
          // Intersect with existing matches
          for (const id of matchingIds) {
            if (!ids.has(id)) {
              matchingIds.delete(id);
            }
          }
        }
      }
    });

    return Array.from(matchingIds)
      .map(id => items.get(id))
      .filter((item): item is MemoryItem => item !== undefined);
  }

  private getFieldValue(item: MemoryItem, field: string): string | undefined {
    const parts = field.split('.');
    let value: any = item;
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) break;
    }
    return typeof value === 'string' ? value : undefined;
  }

  private getQueryValue(query: MemoryQuery, field: string): string | undefined {
    if (field === 'type') return query.type;
    if (field === 'term') return query.term;
    return undefined;
  }
}