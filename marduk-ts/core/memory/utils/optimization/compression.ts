import { MemoryItem } from '../../types/base-types.js';

export class MemoryCompressor {
  private readonly BATCH_SIZE = 100;

  async compressItems(items: Map<string | number, MemoryItem>): Promise<void> {
    const itemBatches = this.batchItems(Array.from(items.values()));
    
    for (const batch of itemBatches) {
      await Promise.all(batch.map(async item => {
        if (typeof item.content === 'string') {
          item.content = await this.compressString(item.content);
        } else if (typeof item.content === 'object') {
          item.content = await this.compressObject(item.content);
        }
      }));
    }
  }

  private batchItems<T>(items: T[]): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += this.BATCH_SIZE) {
      batches.push(items.slice(i, i + this.BATCH_SIZE));
    }
    return batches;
  }

  private async compressString(str: string): Promise<string> {
    return str.replace(/\s+/g, ' ').trim();
  }

  private async compressObject(obj: any): Promise<any> {
    const compressed: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;
      
      if (typeof value === 'string') {
        compressed[key] = await this.compressString(value);
      } else if (typeof value === 'object') {
        compressed[key] = await this.compressObject(value);
      } else {
        compressed[key] = value;
      }
    }

    return compressed;
  }
}