/**
 * Utility class for managing text embeddings and vector similarity
 */
export declare class VectorSimilarity {
    private static instance;
    private openai;
    private embeddingCache;
    private constructor();
    static getInstance(): VectorSimilarity;
    /**
     * Generate embedding vector for text
     * @param text Text to convert to embedding vector
     * @returns Numeric vector embedding
     */
    getEmbedding(text: string): Promise<number[]>;
    /**
     * Calculate cosine similarity between two vectors
     * @param vec1 First vector
     * @param vec2 Second vector
     * @returns Similarity score between 0-1
     */
    calculateCosineSimilarity(vec1: number[], vec2: number[]): number;
    /**
     * Calculate semantic similarity between two text strings
     * @param text1 First text
     * @param text2 Second text
     * @returns Similarity score between 0-1
     */
    calculateSimilarity(text1: string, text2: string): Promise<number>;
    /**
     * Calculate similarities between one text and multiple others
     * @param query Text to compare against
     * @param texts Array of texts to compare
     * @returns Array of similarity scores (0-1)
     */
    calculateBatchSimilarities(query: string, texts: string[]): Promise<{
        text: string;
        score: number;
    }[]>;
    /**
     * Preprocess text to improve embedding quality
     * @param text Raw text
     * @returns Processed text
     */
    private preprocessText;
    /**
     * Generate a cache key for embeddings
     * @param text Text to create key for
     * @returns Cache key
     */
    private generateCacheKey;
}
//# sourceMappingURL=vector-similarity.d.ts.map