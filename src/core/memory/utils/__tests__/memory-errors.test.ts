import { 
  MemoryError, 
  ValidationError, 
  StorageError, 
  QueryError,
  handleMemoryError 
} from '../memory-errors.js';
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

describe('Memory Errors', () => {
  describe('MemoryError', () => {
    it('should create basic memory error', () => {
      const error = new MemoryError('Test error', 'TEST_ERROR');
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.name).toBe('MemoryError');
    });

    it('should include optional details', () => {
      const details = { foo: 'bar' };
      const error = new MemoryError('Test error', 'TEST_ERROR', details);
      
      expect(error.details).toEqual(details);
    });
  });

  describe('Specific Error Types', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid data');
      
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error instanceof MemoryError).toBe(true);
    });

    it('should create storage error', () => {
      const error = new StorageError('Storage failed');
      
      expect(error.code).toBe('STORAGE_ERROR');
      expect(error instanceof MemoryError).toBe(true);
    });

    it('should create query error', () => {
      const error = new QueryError('Invalid query');
      
      expect(error.code).toBe('QUERY_ERROR');
      expect(error instanceof MemoryError).toBe(true);
    });
  });

  describe('handleMemoryError', () => {
    it('should handle MemoryError instances', () => {
      const error = new MemoryError('Test error', 'TEST_ERROR');
      
      expect(() => handleMemoryError(error)).toThrow(MemoryError);
      expect(() => handleMemoryError(error)).toThrow('Test error');
    });

    it('should convert unknown errors', () => {
      const error = new Error('Unknown error');
      
      expect(() => handleMemoryError(error)).toThrow(MemoryError);
      expect(() => handleMemoryError(error)).toThrow('Unknown error');
    });

    it('should handle non-Error objects', () => {
      expect(() => handleMemoryError('string error')).toThrow(MemoryError);
      expect(() => handleMemoryError('string error')).toThrow('Unknown error');
    });
  });
});