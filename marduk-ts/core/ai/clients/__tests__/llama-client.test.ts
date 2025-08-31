import { LlamaCppClient, LlamaCppConfig } from '../llama-client';

describe('LlamaCppClient', () => {
  const mockConfig: LlamaCppConfig = {
    modelPath: '/path/to/test/model.gguf',
    contextSize: 1024,
    temperature: 0.7,
    threads: 2,
    gpuLayers: 0
  };

  beforeEach(() => {
    // Reset instance for each test
    (LlamaCppClient as any).instance = null;
  });

  describe('getInstance', () => {
    it('should create instance with config', () => {
      const client = LlamaCppClient.getInstance(mockConfig);
      expect(client).toBeInstanceOf(LlamaCppClient);
    });

    it('should return same instance on subsequent calls', () => {
      const client1 = LlamaCppClient.getInstance(mockConfig);
      const client2 = LlamaCppClient.getInstance();
      expect(client1).toBe(client2);
    });

    it('should throw error if no config provided for first call', () => {
      expect(() => LlamaCppClient.getInstance()).toThrow(
        'LlamaCppClient configuration required for first initialization'
      );
    });
  });

  describe('configuration', () => {
    it('should store configuration correctly', () => {
      const client = LlamaCppClient.getInstance(mockConfig);
      const config = client.getConfig();
      expect(config.modelPath).toBe(mockConfig.modelPath);
      expect(config.contextSize).toBe(mockConfig.contextSize);
      expect(config.temperature).toBe(mockConfig.temperature);
    });

    it('should use default values for optional config', () => {
      const minimalConfig: LlamaCppConfig = {
        modelPath: '/path/to/model.gguf'
      };
      const client = LlamaCppClient.getInstance(minimalConfig);
      const config = client.getConfig();
      expect(config.contextSize).toBe(2048);
      expect(config.temperature).toBe(0.7);
      expect(config.topP).toBe(0.9);
      expect(config.threads).toBe(4);
      expect(config.gpuLayers).toBe(0);
    });

    it('should update configuration', () => {
      const client = LlamaCppClient.getInstance(mockConfig);
      client.updateConfig({ temperature: 0.9, contextSize: 2048 });
      const config = client.getConfig();
      expect(config.temperature).toBe(0.9);
      expect(config.contextSize).toBe(2048);
    });
  });

  describe('initialization state', () => {
    it('should not be ready before initialization', () => {
      const client = LlamaCppClient.getInstance(mockConfig);
      expect(client.isReady()).toBe(false);
    });

    it('should throw error when calling generateResponse before initialization', async () => {
      const client = LlamaCppClient.getInstance(mockConfig);
      await expect(client.generateResponse({
        prompt: 'test',
        context: []
      })).rejects.toThrow('LlamaCpp client not initialized');
    });
  });

  describe('cleanup', () => {
    it('should cleanup resources without error', async () => {
      const client = LlamaCppClient.getInstance(mockConfig);
      await expect(client.cleanup()).resolves.not.toThrow();
      expect(client.isReady()).toBe(false);
    });
  });

  // Note: Full initialization and generation tests would require actual model files
  // and are better suited for integration tests rather than unit tests
});