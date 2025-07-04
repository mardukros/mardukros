import { BaseMemoryItem } from '../types/memory-items.js';

export interface IndexEntry {
  id: string;
  score: number;
}

export class MemoryIndex {
  private indices: Map<string, Map<string, Set<string>>> = new Map();
  private invertedIndex: Map<string, Set<string>> = new Map();

  addIndex(field: string): void {
    if (!this.indices.has(field)) {
      this.indices.set(field, new Map());
    }
  }

  indexItem(item: BaseMemoryItem): void {
    // Index metadata fields
    this.indices.forEach((index, field) => {
      const value = this.getFieldValue(item, field);
      if (value) {
        if (!index.has(value)) {
          index.set(value, new Set());
        }
        index.get(value)?.add(item.id);
      }
    });

    // Build inverted index for full-text search
    const terms = this.extractSearchTerms(item);
    terms.forEach(term => {
      if (!this.invertedIndex.has(term)) {
        this.invertedIndex.set(term, new Set());
      }
      this.invertedIndex.get(term)?.add(item.id);
    });
  }

  search(term: string): IndexEntry[] {
    const searchTerms = term.toLowerCase().split(/\s+/);
    const scores = new Map<string, number>();

    searchTerms.forEach(searchTerm => {
      this.invertedIndex.forEach((ids, indexTerm) => {
        if (indexTerm.includes(searchTerm)) {
          ids.forEach(id => {
            scores.set(id, (scores.get(id) || 0) + this.calculateScore(indexTerm, searchTerm));
          });
        }
      });
    });
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

    return Array.from(scores.entries())
      .map(([id, score]) => ({ id, score }))
      .sort((a, b) => b.score - a.score);
  }

  private getFieldValue(item: BaseMemoryItem, field: string): string | undefined {
    const value = field.split('.').reduce((obj, key) => 
      obj && typeof obj === 'object' ? (obj as Record<string, any>)[key] : undefined
    , item as Record<string, any>);
    return typeof value === 'string' ? value : undefined;
  }

  private extractSearchTerms(item: BaseMemoryItem): string[] {
    const terms = new Set<string>();

    // Extract terms from content
    if (typeof item.content === 'string') {
      item.content.toLowerCase().split(/\s+/).forEach(term => terms.add(term));
    } else if (typeof item.content === 'object' && item.content !== null) {
      JSON.stringify(item.content).toLowerCase().split(/\W+/).forEach(term => terms.add(term));
    }

    // Extract terms from metadata
    item.metadata.tags.forEach(tag => terms.add(tag.toLowerCase()));

    return Array.from(terms);
  }

  private calculateScore(indexTerm: string, searchTerm: string): number {
    let score = 1;
    
    // Exact match bonus
    if (indexTerm === searchTerm) {
      score += 0.5;
    }

    // Prefix match bonus
    if (indexTerm.startsWith(searchTerm)) {
      score += 0.3;
    }

    // Length penalty for very short terms
    if (searchTerm.length < 3) {
      score *= 0.7;
    }

    return score;
  }
}