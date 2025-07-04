/**
 * Types for text embeddings and vector operations
 */

export interface EmbeddingVector {
  /**
   * Numeric vector representation of text
   */
  embedding: number[];
  
  /**
   * Original text that was embedded
   */
  text: string;
  
  /**
   * Model used for embedding
   */
  model?: string;
  
  /**
   * Timestamp when embedding was created
   */
  timestamp?: string;
}

export interface EmbeddingResponse {
  /**
   * Array of embeddings returned by the API
   */
  data: {
    embedding: number[];
    index: number;
    object: string;
  }[];
  
  /**
   * Model used for the embeddings
   */
  model: string;
  
  /**
   * Token usage information
   */
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface SimilarityResult {
  /**
   * Original text being compared
   */
  text: string;
  
  /**
   * Similarity score (0-1 where 1 is identical)
   */
  score: number;
}

export interface EmbeddingOptions {
  /**
   * Model to use for generating embeddings
   */
  model?: string;
  
  /**
   * Whether to use cache for embeddings
   */
  useCache?: boolean;
  
  /**
   * Maximum age of cached embeddings to use (ms)
   */
  cacheMaxAge?: number;
}
