import { saveToFile, loadFromFile } from '../persistence-utils.js';
import { BaseMemoryItem } from '../../types/memory-items.js';
import { promises as fs } from 'fs';
import { join } from 'path';

jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    readFile: jest.fn()
  }
}));

describe('Persistence Utilities', () => {
  const testDir = 'test-dir';
  const testFile = 'test.json';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveToFile', () => {
    it('should save items to file', async () => {
      const items = new Map<string, BaseMemoryItem>();
      items.set('1', {
        id: '1',
        type: 'test',
        metadata: {
          lastAccessed: Date.now(),
          tags: ['tag1']
        }
      });

      await saveToFile(items, testDir, testFile);

      expect(fs.mkdir).toHaveBeenCalledWith(testDir, { recursive: true });
      expect(fs.writeFile).toHaveBeenCalledWith(
        join(testDir, testFile),
        expect.any(String),
        undefined
      );
    });
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

    it('should handle errors', async () => {
      const error = new Error('Write error');
      (fs.writeFile as jest.Mock).mockRejectedValue(error);
// Consider extracting this duplicated code into a shared function

      const items = new Map<string, BaseMemoryItem>();
      await expect(saveToFile(items, testDir, testFile)).rejects.toThrow(error);
    });
  });

  describe('loadFromFile', () => {
    it('should load items from file', async () => {
      const testData = [
        ['1', {
          id: '1',
          type: 'test',
          metadata: {
            lastAccessed: Date.now(),
            tags: ['tag1']
          }
        }]
      ];

      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(testData));

      const items = await loadFromFile<BaseMemoryItem>(testDir, testFile);
      expect(items.size).toBe(1);
      expect(items.get('1')).toBeDefined();
    });

    it('should handle missing file', async () => {
      const error = new Error('File not found');
      (error as NodeJS.ErrnoException).code = 'ENOENT';
      (fs.readFile as jest.Mock).mockRejectedValue(error);

      const items = await loadFromFile<BaseMemoryItem>(testDir, testFile);
      expect(items.size).toBe(0);
    });

    it('should handle other errors', async () => {
      const error = new Error('Read error');
      (fs.readFile as jest.Mock).mockRejectedValue(error);

      await expect(loadFromFile(testDir, testFile)).rejects.toThrow(error);
    });
  });
});