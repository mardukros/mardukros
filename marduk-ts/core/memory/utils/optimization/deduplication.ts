import { MemoryItem } from '../../types/base-types.js';

export class MemoryDeduplicator {
  private readonly SIMILARITY_THRESHOLD = 0.7;

  async deduplicateItems(items: Map<string | number, MemoryItem>): Promise<void> {
    const itemArray = Array.from(items.values());
    const duplicates = new Set<string | number>();

    for (let i = 0; i < itemArray.length; i++) {
      if (duplicates.has(itemArray[i].id)) continue;

      for (let j = i + 1; j < itemArray.length; j++) {
        if (duplicates.has(itemArray[j].id)) continue;

        const similarity = this.calculateSimilarity(itemArray[i], itemArray[j]);
        if (similarity > this.SIMILARITY_THRESHOLD) {
          const itemToRemove = this.selectItemToRemove(itemArray[i], itemArray[j]);
          duplicates.add(itemToRemove.id);
        }
      }
    }

    duplicates.forEach(id => items.delete(id));
  }

  private calculateSimilarity(item1: MemoryItem, item2: MemoryItem): number {
    if (item1.type !== item2.type) return 0;

    let similarity = 0;
    let totalWeight = 0;

    const contentSimilarity = this.compareContent(item1.content, item2.content);
    similarity += contentSimilarity * 0.6;
    totalWeight += 0.6;

    if (item1.metadata && item2.metadata) {
      const metadataSimilarity = this.compareMetadata(item1.metadata, item2.metadata);
      similarity += metadataSimilarity * 0.4;
      totalWeight += 0.4;
    }

    return totalWeight > 0 ? similarity / totalWeight : 0;
  }

  private compareContent(content1: unknown, content2: unknown): number {
    if (typeof content1 !== typeof content2) return 0;

    if (typeof content1 === 'string' && typeof content2 === 'string') {
      return this.calculateStringSimilarity(content1, content2);
    }

    if (typeof content1 === 'object' && typeof content2 === 'object') {
      return this.calculateObjectSimilarity(content1, content2);
    }

    return content1 === content2 ? 1 : 0;
  }

  private compareMetadata(metadata1: Record<string, unknown>, metadata2: Record<string, unknown>): number {
    const keys = new Set([...Object.keys(metadata1), ...Object.keys(metadata2)]);
    let totalSimilarity = 0;
    let comparedFields = 0;

    for (const key of keys) {
      if (key in metadata1 && key in metadata2) {
        totalSimilarity += this.compareContent(metadata1[key], metadata2[key]);
        comparedFields++;
      }
    }

    return comparedFields > 0 ? totalSimilarity / comparedFields : 0;
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1;

    const distance = this.levenshteinDistance(str1, str2);
    return 1 - distance / maxLength;
  }

  private calculateObjectSimilarity(obj1: any, obj2: any): number {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    const allKeys = new Set([...keys1, ...keys2]);

    let totalSimilarity = 0;
    let comparedFields = 0;

    for (const key of allKeys) {
      if (key in obj1 && key in obj2) {
        totalSimilarity += this.compareContent(obj1[key], obj2[key]);
        comparedFields++;
      }
    }

    return comparedFields > 0 ? totalSimilarity / comparedFields : 0;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j - 1] + 1,
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1
          );
        }
      }
    }

    return dp[m][n];
  }

  private selectItemToRemove(item1: MemoryItem, item2: MemoryItem): MemoryItem {
    const confidence1 = (item1.metadata?.confidence as number) || 0;
    const confidence2 = (item2.metadata?.confidence as number) || 0;

    if (confidence1 !== confidence2) {
      return confidence1 < confidence2 ? item1 : item2;
    }

    const timestamp1 = (item1.metadata?.lastAccessed as number) || 0;
    const timestamp2 = (item2.metadata?.lastAccessed as number) || 0;

    return timestamp1 < timestamp2 ? item1 : item2;
  }
}