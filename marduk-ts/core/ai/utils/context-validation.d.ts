/**
 * Context validation utility for AI Coordinator
 * Provides mechanisms to validate context data for accuracy and consistency
 */
import { ContextItem } from './context-sources.js';
import { ContextCacheItem } from './context-persistence.js';
/**
 * Types of validation issues that can be detected
 */
export declare enum ValidationIssueType {
    MALFORMED = "malformed",
    OUTDATED = "outdated",
    INCONSISTENT = "inconsistent",
    CONTRADICTORY = "contradictory",
    REDUNDANT = "redundant",
    LOW_QUALITY = "low_quality",
    SPAM = "spam"
}
/**
 * Validation issue detected in context data
 */
export interface ValidationIssue {
    type: ValidationIssueType;
    description: string;
    severity: 'low' | 'medium' | 'high';
    itemKey?: string;
    affectedContent?: string;
    timestamp: string;
    source?: string;
    resolution?: 'ignored' | 'removed' | 'fixed';
    metadata?: any;
}
/**
 * Result of a validation operation
 */
export interface ValidationResult {
    isValid: boolean;
    issues: ValidationIssue[];
    timestamp: string;
    totalItemsChecked: number;
    processedInMs: number;
}
/**
 * Options for validation operations
 */
export interface ValidationOptions {
    validateFormat?: boolean;
    validateConsistency?: boolean;
    validateRelevance?: boolean;
    validateAge?: boolean;
    maxAgeMs?: number;
    strictMode?: boolean;
    minConfidence?: number;
    detectionThresholds?: {
        redundancy?: number;
        contradiction?: number;
        outdated?: number;
    };
}
/**
 * Context validation utility
 */
export declare class ContextValidator {
    private options;
    /**
     * Create a new context validator
     * @param options Validation options
     */
    constructor(options?: ValidationOptions);
    /**
     * Validate a collection of context items
     * @param contextItems Context items to validate
     * @returns Validation result
     */
    validateItems(contextItems: ContextItem[]): ValidationResult;
    /**
     * Validate context items in a cache
     * @param contextCache The context cache to validate
     * @returns Validation result
     */
    validateCache(contextCache: Map<string, ContextCacheItem>): ValidationResult;
    /**
     * Apply automated fixes to contexts based on validation issues
     * @param contextItems Context items to fix
     * @param validationResult Validation result containing issues
     * @returns Fixed context items and a list of applied fixes
     */
    applyFixes(contextItems: ContextItem[], validationResult: ValidationResult): {
        fixedItems: ContextItem[];
        appliedFixes: string[];
    };
    /**
     * Apply fixes to a context cache based on validation issues
     * @param contextCache Context cache to fix
     * @param validationResult Validation result containing issues
     * @returns A copy of the fixed cache and a list of applied fixes
     */
    applyFixesToCache(contextCache: Map<string, ContextCacheItem>, validationResult: ValidationResult): {
        fixedCache: Map<string, ContextCacheItem>;
        appliedFixes: string[];
    };
    /**
     * Validate a single context item's format
     * @param item Context item to validate
     * @param itemKey Key or index of the item for reference
     * @returns Array of validation issues
     */
    private validateItemFormat;
    /**
     * Validate a single context item's age
     * @param item Context item to validate
     * @param itemKey Key or index of the item for reference
     * @returns Array of validation issues
     */
    private validateItemAge;
    /**
     * Validate a single context item's relevance
     * @param item Context item to validate
     * @param itemKey Key or index of the item for reference
     * @returns Array of validation issues
     */
    private validateItemRelevance;
    /**
     * Validate consistency across a set of context items
     * @param items Context items to validate for consistency
     * @returns Array of validation issues
     */
    private validateConsistency;
    /**
     * Attempt to fix a malformed item
     * @param item Item to fix
     * @returns Whether the fix was applied
     */
    private fixMalformedItem;
    /**
     * Calculate similarity between two text strings
     * Simple implementation - a real system would use more sophisticated
     * techniques like embeddings or semantic analysis
     */
    private calculateTextSimilarity;
    /**
     * Detect potential contradictions between two text strings
     * Simple implementation - a real system would use more sophisticated
     * NLP techniques
     */
    private detectContradiction;
}
//# sourceMappingURL=context-validation.d.ts.map