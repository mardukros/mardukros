import OpenAI from 'openai';
import { env } from '../../../config/env.js';
import LRUCache from 'lru-cache';
/**
 * Utility class for managing text embeddings and vector similarity
 */
export class VectorSimilarity {
    static instance;
    openai;
    // Cache embeddings to avoid redundant API calls
    embeddingCache = new LRUCache({
        max: 500, // Store up to 500 embeddings
        ttl: 1000 * 60 * 60 * 24 // Cache for 24 hours
    });
    constructor() {
        this.openai = new OpenAI({
            apiKey: env.openai.apiKey,
            organization: env.openai.organization
        });
    }
    static getInstance() {
        if (!VectorSimilarity.instance) {
            VectorSimilarity.instance = new VectorSimilarity();
        }
        return VectorSimilarity.instance;
    }
    /**
     * Generate embedding vector for text
     * @param text Text to convert to embedding vector
     * @returns Numeric vector embedding
     */
    async getEmbedding(text) {
        const cacheKey = this.generateCacheKey(text);
        const cachedEmbedding = this.embeddingCache.get(cacheKey);
        if (cachedEmbedding) {
            return cachedEmbedding;
        }
        try {
            const response = await this.openai.embeddings.create({
                model: 'text-embedding-ada-002', // Or the latest embedding model
                input: this.preprocessText(text)
            });
            const embedding = response.data[0].embedding;
            this.embeddingCache.set(cacheKey, embedding);
            return embedding;
        }
        catch (error) {
            console.error('Error generating embedding:', error);
            throw new Error('Failed to generate embedding vector');
        }
    }
    /**
     * Calculate cosine similarity between two vectors
     * @param vec1 First vector
     * @param vec2 Second vector
     * @returns Similarity score between 0-1
     */
    calculateCosineSimilarity(vec1, vec2) {
        if (vec1.length !== vec2.length) {
            throw new Error('Vectors must have the same dimension');
        }
        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;
        for (let i = 0; i < vec1.length; i++) {
            dotProduct += vec1[i] * vec2[i];
            norm1 += vec1[i] * vec1[i];
            norm2 += vec2[i] * vec2[i];
        }
        if (norm1 === 0 || norm2 === 0)
            return 0;
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }
    /**
     * Calculate semantic similarity between two text strings
     * @param text1 First text
     * @param text2 Second text
     * @returns Similarity score between 0-1
     */
    async calculateSimilarity(text1, text2) {
        try {
            const [embedding1, embedding2] = await Promise.all([
                this.getEmbedding(text1),
                this.getEmbedding(text2)
            ]);
            return this.calculateCosineSimilarity(embedding1, embedding2);
        }
        catch (error) {
            console.error('Error calculating similarity:', error);
            return 0; // Default to 0 similarity on error
        }
    }
    /**
     * Calculate similarities between one text and multiple others
     * @param query Text to compare against
     * @param texts Array of texts to compare
     * @returns Array of similarity scores (0-1)
     */
    async calculateBatchSimilarities(query, texts) {
        try {
            const queryEmbedding = await this.getEmbedding(query);
            // Process embeddings in parallel batches to avoid rate limits
            const batchSize = 20;
            const results = [];
            for (let i = 0; i < texts.length; i += batchSize) {
                const batch = texts.slice(i, i + batchSize);
                const batchEmbeddings = await Promise.all(batch.map(text => this.getEmbedding(text)));
                for (let j = 0; j < batch.length; j++) {
                    results.push({
                        text: batch[j],
                        score: this.calculateCosineSimilarity(queryEmbedding, batchEmbeddings[j])
                    });
                }
            }
            return results;
        }
        catch (error) {
            console.error('Error in batch similarity calculation:', error);
            return texts.map(text => ({ text, score: 0 }));
        }
    }
    /**
     * Preprocess text to improve embedding quality
     * @param text Raw text
     * @returns Processed text
     */
    preprocessText(text) {
        // Basic preprocessing - normalize whitespace and limit length
        return text
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 8000); // OpenAI has token limits for embeddings
    }
    /**
     * Generate a cache key for embeddings
     * @param text Text to create key for
     * @returns Cache key
     */
    generateCacheKey(text) {
        // Simple hash function for text to keep cache keys manageable
        const normalized = this.preprocessText(text);
        return `embed:${normalized.slice(0, 100)}`;
    }
}
//# sourceMappingURL=vector-similarity.js.map