/**
 * Context validation utility for AI Coordinator
 * Provides mechanisms to validate context data for accuracy and consistency
 */
import { logger } from '../../logging/logger.js';
/**
 * Types of validation issues that can be detected
 */
export var ValidationIssueType;
(function (ValidationIssueType) {
    ValidationIssueType["MALFORMED"] = "malformed";
    ValidationIssueType["OUTDATED"] = "outdated";
    ValidationIssueType["INCONSISTENT"] = "inconsistent";
    ValidationIssueType["CONTRADICTORY"] = "contradictory";
    ValidationIssueType["REDUNDANT"] = "redundant";
    ValidationIssueType["LOW_QUALITY"] = "low_quality";
    ValidationIssueType["SPAM"] = "spam";
})(ValidationIssueType || (ValidationIssueType = {}));
/**
 * Default validation options
 */
const DEFAULT_VALIDATION_OPTIONS = {
    validateFormat: true,
    validateConsistency: true,
    validateRelevance: true,
    validateAge: true,
    maxAgeMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    strictMode: false,
    minConfidence: 0.6,
    detectionThresholds: {
        redundancy: 0.85,
        contradiction: 0.7,
        outdated: 0.5
    }
};
/**
 * Context validation utility
 */
export class ContextValidator {
    options;
    /**
     * Create a new context validator
     * @param options Validation options
     */
    constructor(options = {}) {
        this.options = { ...DEFAULT_VALIDATION_OPTIONS, ...options };
    }
    /**
     * Validate a collection of context items
     * @param contextItems Context items to validate
     * @returns Validation result
     */
    validateItems(contextItems) {
        const startTime = performance.now();
        const issues = [];
        try {
            // Check individual items for format issues
            if (this.options.validateFormat) {
                contextItems.forEach((item, index) => {
                    const formatIssues = this.validateItemFormat(item, index.toString());
                    issues.push(...formatIssues);
                });
            }
            // Check for outdated items
            if (this.options.validateAge) {
                contextItems.forEach((item, index) => {
                    const ageIssues = this.validateItemAge(item, index.toString());
                    issues.push(...ageIssues);
                });
            }
            // Check for consistency across items
            if (this.options.validateConsistency && contextItems.length > 1) {
                const consistencyIssues = this.validateConsistency(contextItems);
                issues.push(...consistencyIssues);
            }
            // Check for relevance
            if (this.options.validateRelevance) {
                contextItems.forEach((item, index) => {
                    const relevanceIssues = this.validateItemRelevance(item, index.toString());
                    issues.push(...relevanceIssues);
                });
            }
        }
        catch (error) {
            logger.error('Error during context validation:', error);
            // Create a validation error issue
            issues.push({
                type: ValidationIssueType.MALFORMED,
                description: `Validation process error: ${error.message}`,
                severity: 'high',
                timestamp: new Date().toISOString(),
                affectedContent: 'Validation process'
            });
        }
        const endTime = performance.now();
        return {
            isValid: issues.length === 0,
            issues,
            timestamp: new Date().toISOString(),
            totalItemsChecked: contextItems.length,
            processedInMs: endTime - startTime
        };
    }
    /**
     * Validate context items in a cache
     * @param contextCache The context cache to validate
     * @returns Validation result
     */
    validateCache(contextCache) {
        const startTime = performance.now();
        const issues = [];
        try {
            // Convert cache to context items
            const contextItems = [];
            for (const [key, cacheItem] of contextCache.entries()) {
                // Validate basic cache item structure
                if (!cacheItem || !Array.isArray(cacheItem.context)) {
                    issues.push({
                        type: ValidationIssueType.MALFORMED,
                        description: 'Malformed cache item: missing or invalid context array',
                        severity: 'high',
                        itemKey: key,
                        timestamp: new Date().toISOString()
                    });
                    continue;
                }
                // Validate each context string in the cache item
                cacheItem.context.forEach((contextStr, idx) => {
                    if (typeof contextStr !== 'string') {
                        issues.push({
                            type: ValidationIssueType.MALFORMED,
                            description: 'Malformed context string in cache item',
                            severity: 'medium',
                            itemKey: key,
                            affectedContent: String(contextStr),
                            timestamp: new Date().toISOString()
                        });
                    }
                    // Create a pseudo context item for more detailed validation
                    const contextItem = {
                        content: contextStr,
                        source: 'cache',
                        type: 'cached_context',
                        metadata: {
                            cacheKey: key,
                            lastAccessed: cacheItem.lastAccessed,
                            createdAt: cacheItem.createdAt,
                            relevance: cacheItem.relevance
                        }
                    };
                    contextItems.push(contextItem);
                });
                // Check cache item age
                if (this.options.validateAge && cacheItem.createdAt) {
                    const age = Date.now() - cacheItem.createdAt;
                    if (age > (this.options.maxAgeMs || DEFAULT_VALIDATION_OPTIONS.maxAgeMs)) {
                        issues.push({
                            type: ValidationIssueType.OUTDATED,
                            description: `Cache item is outdated (${Math.round(age / (24 * 60 * 60 * 1000))} days old)`,
                            severity: 'medium',
                            itemKey: key,
                            timestamp: new Date().toISOString(),
                            metadata: { age, createdAt: cacheItem.createdAt }
                        });
                    }
                }
            }
            // Validate the content of the context items
            if (contextItems.length > 0) {
                const contentValidation = this.validateItems(contextItems);
                issues.push(...contentValidation.issues);
            }
        }
        catch (error) {
            logger.error('Error during cache validation:', error);
            issues.push({
                type: ValidationIssueType.MALFORMED,
                description: `Cache validation error: ${error.message}`,
                severity: 'high',
                timestamp: new Date().toISOString()
            });
        }
        const endTime = performance.now();
        return {
            isValid: issues.length === 0,
            issues,
            timestamp: new Date().toISOString(),
            totalItemsChecked: contextCache.size,
            processedInMs: endTime - startTime
        };
    }
    /**
     * Apply automated fixes to contexts based on validation issues
     * @param contextItems Context items to fix
     * @param validationResult Validation result containing issues
     * @returns Fixed context items and a list of applied fixes
     */
    applyFixes(contextItems, validationResult) {
        const fixedItems = [...contextItems];
        const appliedFixes = [];
        // Skip if no issues or items
        if (validationResult.issues.length === 0 || contextItems.length === 0) {
            return { fixedItems, appliedFixes };
        }
        // Group issues by type for more efficient fixing
        const issuesByType = new Map();
        for (const issue of validationResult.issues) {
            if (!issuesByType.has(issue.type)) {
                issuesByType.set(issue.type, []);
            }
            issuesByType.get(issue.type).push(issue);
        }
        // Fix malformed items
        if (issuesByType.has(ValidationIssueType.MALFORMED)) {
            for (const issue of issuesByType.get(ValidationIssueType.MALFORMED)) {
                if (issue.itemKey !== undefined) {
                    const itemIndex = parseInt(issue.itemKey);
                    if (!isNaN(itemIndex) && itemIndex >= 0 && itemIndex < fixedItems.length) {
                        // Try to fix the malformed item
                        if (this.fixMalformedItem(fixedItems[itemIndex])) {
                            appliedFixes.push(`Fixed malformed item: ${issue.description}`);
                        }
                    }
                }
            }
        }
        // Remove redundant items
        if (issuesByType.has(ValidationIssueType.REDUNDANT)) {
            const redundantIssues = issuesByType.get(ValidationIssueType.REDUNDANT);
            const itemsToRemove = new Set();
            for (const issue of redundantIssues) {
                if (issue.itemKey !== undefined) {
                    const itemIndex = parseInt(issue.itemKey);
                    if (!isNaN(itemIndex) && itemIndex >= 0 && itemIndex < fixedItems.length) {
                        itemsToRemove.add(itemIndex);
                    }
                }
            }
            // Remove redundant items (in reverse order to maintain indices)
            const indicesToRemove = Array.from(itemsToRemove).sort((a, b) => b - a);
            for (const index of indicesToRemove) {
                const removedItem = fixedItems[index];
                fixedItems.splice(index, 1);
                appliedFixes.push(`Removed redundant item: ${removedItem.content.substring(0, 30)}...`);
            }
        }
        // Fix outdated items by flagging them
        if (issuesByType.has(ValidationIssueType.OUTDATED)) {
            for (const issue of issuesByType.get(ValidationIssueType.OUTDATED)) {
                if (issue.itemKey !== undefined) {
                    const itemIndex = parseInt(issue.itemKey);
                    if (!isNaN(itemIndex) && itemIndex >= 0 && itemIndex < fixedItems.length) {
                        const item = fixedItems[itemIndex];
                        // Add an outdated flag to the item
                        if (!item.metadata) {
                            item.metadata = {};
                        }
                        item.metadata.outdated = true;
                        item.metadata.outdatedReason = issue.description;
                        // Modify content to indicate it's outdated
                        if (!item.content.includes('[OUTDATED]')) {
                            item.content = `[OUTDATED] ${item.content}`;
                            appliedFixes.push(`Marked item as outdated: ${item.content.substring(0, 30)}...`);
                        }
                    }
                }
            }
        }
        return { fixedItems, appliedFixes };
    }
    /**
     * Apply fixes to a context cache based on validation issues
     * @param contextCache Context cache to fix
     * @param validationResult Validation result containing issues
     * @returns A copy of the fixed cache and a list of applied fixes
     */
    applyFixesToCache(contextCache, validationResult) {
        const fixedCache = new Map(contextCache);
        const appliedFixes = [];
        // Skip if no issues
        if (validationResult.issues.length === 0) {
            return { fixedCache, appliedFixes };
        }
        // Process issues by cache key
        const issuesByCacheKey = new Map();
        for (const issue of validationResult.issues) {
            if (issue.itemKey) {
                if (!issuesByCacheKey.has(issue.itemKey)) {
                    issuesByCacheKey.set(issue.itemKey, []);
                }
                issuesByCacheKey.get(issue.itemKey).push(issue);
            }
        }
        // Apply fixes for each affected cache entry
        for (const [key, issues] of issuesByCacheKey.entries()) {
            const cacheItem = fixedCache.get(key);
            if (!cacheItem)
                continue;
            // Group issues by type
            const hasMalformed = issues.some(i => i.type === ValidationIssueType.MALFORMED);
            const hasOutdated = issues.some(i => i.type === ValidationIssueType.OUTDATED);
            const hasRedundant = issues.some(i => i.type === ValidationIssueType.REDUNDANT);
            // Handle malformed cache items
            if (hasMalformed && this.options.strictMode) {
                // In strict mode, remove malformed items entirely
                fixedCache.delete(key);
                appliedFixes.push(`Removed malformed cache item: ${key}`);
                continue;
            }
            // Handle outdated items
            if (hasOutdated) {
                if (this.options.strictMode) {
                    // In strict mode, remove outdated items
                    fixedCache.delete(key);
                    appliedFixes.push(`Removed outdated cache item: ${key}`);
                }
                else {
                    // In normal mode, mark as outdated
                    cacheItem.metadata = cacheItem.metadata || {};
                    cacheItem.metadata.outdated = true;
                    cacheItem.metadata.validationIssues = issues.map(i => i.type);
                    appliedFixes.push(`Marked cache item as outdated: ${key}`);
                }
                continue;
            }
            // Handle redundant items
            if (hasRedundant) {
                // Always remove redundant items
                fixedCache.delete(key);
                appliedFixes.push(`Removed redundant cache item: ${key}`);
            }
        }
        return { fixedCache, appliedFixes };
    }
    /**
     * Validate a single context item's format
     * @param item Context item to validate
     * @param itemKey Key or index of the item for reference
     * @returns Array of validation issues
     */
    validateItemFormat(item, itemKey) {
        const issues = [];
        // Check for missing required fields
        if (!item.content) {
            issues.push({
                type: ValidationIssueType.MALFORMED,
                description: 'Missing content field',
                severity: 'high',
                itemKey,
                timestamp: new Date().toISOString(),
                source: item.source
            });
        }
        else if (typeof item.content !== 'string') {
            issues.push({
                type: ValidationIssueType.MALFORMED,
                description: 'Content field must be a string',
                severity: 'high',
                itemKey,
                timestamp: new Date().toISOString(),
                source: item.source
            });
        }
        if (!item.source) {
            issues.push({
                type: ValidationIssueType.MALFORMED,
                description: 'Missing source field',
                severity: 'medium',
                itemKey,
                timestamp: new Date().toISOString()
            });
        }
        if (!item.type) {
            issues.push({
                type: ValidationIssueType.MALFORMED,
                description: 'Missing type field',
                severity: 'medium',
                itemKey,
                timestamp: new Date().toISOString(),
                source: item.source
            });
        }
        // Check for empty content
        if (item.content && item.content.trim() === '') {
            issues.push({
                type: ValidationIssueType.LOW_QUALITY,
                description: 'Empty content',
                severity: 'medium',
                itemKey,
                timestamp: new Date().toISOString(),
                source: item.source
            });
        }
        // Check for very short content (likely not useful)
        if (item.content && item.content.trim().length < 10) {
            issues.push({
                type: ValidationIssueType.LOW_QUALITY,
                description: 'Very short content, likely not useful',
                severity: 'low',
                itemKey,
                timestamp: new Date().toISOString(),
                affectedContent: item.content,
                source: item.source
            });
        }
        return issues;
    }
    /**
     * Validate a single context item's age
     * @param item Context item to validate
     * @param itemKey Key or index of the item for reference
     * @returns Array of validation issues
     */
    validateItemAge(item, itemKey) {
        const issues = [];
        if (!item.metadata?.timestamp) {
            return [];
        }
        try {
            const timestamp = new Date(item.metadata.timestamp).getTime();
            const now = Date.now();
            const age = now - timestamp;
            if (age > (this.options.maxAgeMs || DEFAULT_VALIDATION_OPTIONS.maxAgeMs)) {
                issues.push({
                    type: ValidationIssueType.OUTDATED,
                    description: `Item is outdated (${Math.round(age / (24 * 60 * 60 * 1000))} days old)`,
                    severity: 'medium',
                    itemKey,
                    timestamp: new Date().toISOString(),
                    source: item.source,
                    metadata: { age, timestamp }
                });
            }
        }
        catch (error) {
            issues.push({
                type: ValidationIssueType.MALFORMED,
                description: 'Invalid timestamp format',
                severity: 'low',
                itemKey,
                timestamp: new Date().toISOString(),
                source: item.source
            });
        }
        return issues;
    }
    /**
     * Validate a single context item's relevance
     * @param item Context item to validate
     * @param itemKey Key or index of the item for reference
     * @returns Array of validation issues
     */
    validateItemRelevance(item, itemKey) {
        const issues = [];
        if (item.metadata?.confidence !== undefined) {
            const confidence = item.metadata.confidence;
            if (typeof confidence === 'number' && confidence < (this.options.minConfidence || DEFAULT_VALIDATION_OPTIONS.minConfidence)) {
                issues.push({
                    type: ValidationIssueType.LOW_QUALITY,
                    description: `Low confidence score: ${confidence.toFixed(2)}`,
                    severity: 'low',
                    itemKey,
                    timestamp: new Date().toISOString(),
                    source: item.source,
                    metadata: { confidence }
                });
            }
        }
        return issues;
    }
    /**
     * Validate consistency across a set of context items
     * @param items Context items to validate for consistency
     * @returns Array of validation issues
     */
    validateConsistency(items) {
        const issues = [];
        // Check for redundant items (too similar to each other)
        for (let i = 0; i < items.length; i++) {
            for (let j = i + 1; j < items.length; j++) {
                const similarity = this.calculateTextSimilarity(items[i].content, items[j].content);
                if (similarity > (this.options.detectionThresholds?.redundancy || DEFAULT_VALIDATION_OPTIONS.detectionThresholds.redundancy)) {
                    issues.push({
                        type: ValidationIssueType.REDUNDANT,
                        description: `Redundant information with similarity ${similarity.toFixed(2)}`,
                        severity: 'medium',
                        itemKey: j.toString(), // Mark the later item as redundant
                        timestamp: new Date().toISOString(),
                        source: items[j].source,
                        metadata: {
                            similarity,
                            originalItemKey: i.toString(),
                            originalSource: items[i].source
                        }
                    });
                }
            }
        }
        // Check for potential contradictions
        // This is a simplified check - in a real system, more sophisticated
        // contradiction detection using NLP/semantics would be appropriate
        for (let i = 0; i < items.length; i++) {
            for (let j = i + 1; j < items.length; j++) {
                // Only check items from the same source type for contradictions
                if (items[i].type === items[j].type) {
                    const contradiction = this.detectContradiction(items[i].content, items[j].content);
                    if (contradiction.isContradiction) {
                        issues.push({
                            type: ValidationIssueType.CONTRADICTORY,
                            description: `Potential contradiction: ${contradiction.reason}`,
                            severity: 'high',
                            itemKey: `${i},${j}`,
                            timestamp: new Date().toISOString(),
                            source: items[i].source,
                            metadata: {
                                contradictionReason: contradiction.reason,
                                item1Source: items[i].source,
                                item2Source: items[j].source
                            }
                        });
                    }
                }
            }
        }
        return issues;
    }
    /**
     * Attempt to fix a malformed item
     * @param item Item to fix
     * @returns Whether the fix was applied
     */
    fixMalformedItem(item) {
        let fixed = false;
        // Ensure content is a string
        if (item.content === undefined || item.content === null) {
            item.content = '';
            fixed = true;
        }
        else if (typeof item.content !== 'string') {
            try {
                item.content = String(item.content);
                fixed = true;
            }
            catch {
                item.content = '';
                fixed = true;
            }
        }
        // Ensure source exists
        if (!item.source) {
            item.source = 'unknown';
            fixed = true;
        }
        // Ensure type exists
        if (!item.type) {
            item.type = 'unknown';
            fixed = true;
        }
        // Ensure metadata is an object
        if (item.metadata && typeof item.metadata !== 'object') {
            item.metadata = {};
            fixed = true;
        }
        return fixed;
    }
    /**
     * Calculate similarity between two text strings
     * Simple implementation - a real system would use more sophisticated
     * techniques like embeddings or semantic analysis
     */
    calculateTextSimilarity(text1, text2) {
        // Simple implementation using Jaccard similarity of words
        if (!text1 || !text2)
            return 0;
        const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
        const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 2));
        if (words1.size === 0 || words2.size === 0)
            return 0;
        const intersection = new Set([...words1].filter(word => words2.has(word)));
        const union = new Set([...words1, ...words2]);
        return intersection.size / union.size;
    }
    /**
     * Detect potential contradictions between two text strings
     * Simple implementation - a real system would use more sophisticated
     * NLP techniques
     */
    detectContradiction(text1, text2) {
        // This is a simplified placeholder for contradiction detection
        // In a real system, this would be implemented with NLP techniques
        // Look for simple negation patterns
        const text1Lower = text1.toLowerCase();
        const text2Lower = text2.toLowerCase();
        // Check for opposite statements about the same subject
        const containsNegationWords = (text) => {
            const negationWords = ['not', 'no', 'never', "doesn't", "don't", "isn't", "aren't", 'cannot', "can't"];
            return negationWords.some(word => text.includes(word));
        };
        const text1HasNegation = containsNegationWords(text1Lower);
        const text2HasNegation = containsNegationWords(text2Lower);
        // If one has negation and the other doesn't, and they're otherwise similar, 
        // it might be a contradiction
        if ((text1HasNegation && !text2HasNegation) || (!text1HasNegation && text2HasNegation)) {
            const similarity = this.calculateTextSimilarity(text1, text2);
            if (similarity > 0.5) {
                return {
                    isContradiction: true,
                    reason: 'One text negates a statement made in the other text'
                };
            }
        }
        // Look for opposing quantifiers (all vs. none, etc.)
        const opposingPairs = [
            ['all', 'none'],
            ['always', 'never'],
            ['everyone', 'no one'],
            ['everything', 'nothing'],
            ['must', 'must not'],
            ['required', 'prohibited']
        ];
        for (const [word1, word2] of opposingPairs) {
            if ((text1Lower.includes(word1) && text2Lower.includes(word2)) ||
                (text1Lower.includes(word2) && text2Lower.includes(word1))) {
                const similarity = this.calculateTextSimilarity(text1, text2);
                if (similarity > 0.3) {
                    return {
                        isContradiction: true,
                        reason: `Found opposing terms: "${word1}" and "${word2}"`
                    };
                }
            }
        }
        return { isContradiction: false, reason: '' };
    }
}
//# sourceMappingURL=context-validation.js.map