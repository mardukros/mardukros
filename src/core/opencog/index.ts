/**
 * OpenCog Integration Index
 * 
 * Exports all AtomSpace and PLN adapter components for integration
 * with OpenCog paradigms and probabilistic reasoning.
 */

// Core adapters
export { AtomSpaceAdapter } from './atomspace-adapter.js';
export { PLNAdapter, TruthValueOperations } from './pln-adapter.js';
export { KernelStateConverter } from './kernel-state-converter.js';

// Integration examples and demos
export * from './integration-examples.js';

// Types and interfaces
export type {
  // AtomSpace types
  Atom,
  Link,
  AtomSpace,
  AtomType,
  TruthValue,
  AtomAttentionValue,
  ConversionResult
} from './atomspace-adapter.js';

export type {
  // PLN types
  PLNQuery,
  PLNInferenceResult,
  PLNInferenceStep,
  PLNContext,
  PLNRuleType
} from './pln-adapter.js';

export type {
  // Converter types
  ConversionOptions,
  ConversionState,
  ConsistencyResult,
  SyncResult
} from './kernel-state-converter.js';

/**
 * Quick setup function for basic AtomSpace and PLN integration
 */
export function createOpenCogIntegration(options?: {
  enableConsistencyCheck?: boolean;
  includeMetaCognition?: boolean;
  attentionThreshold?: number;
  confidenceThreshold?: number;
}) {
  const converter = new KernelStateConverter({
    enableConsistencyCheck: options?.enableConsistencyCheck ?? true,
    includeMetaCognition: options?.includeMetaCognition ?? true,
    attentionThreshold: options?.attentionThreshold ?? 0.1,
    confidenceThreshold: options?.confidenceThreshold ?? 0.3,
    includeTensorData: true,
    maxTensorSize: 100000,
    preserveMetadata: true
  });

  return {
    converter,
    atomSpaceAdapter: converter.getAtomSpaceAdapter(),
    plnAdapter: converter.getPLNAdapter(),
    
    /**
     * Convert kernel state to AtomSpace with reasoning capabilities
     */
    async convertWithReasoning(cognitiveState: any, stateId: string = 'default') {
      const conversionResult = await converter.convertToAtomSpace(cognitiveState, stateId);
      
      return {
        conversionResult,
        atomSpace: converter.getAtomSpaceAdapter().getAtomSpace(),
        
        /**
         * Perform PLN reasoning on the converted state
         */
        async reason(query: any) {
          return await converter.performReasoningQuery(query, stateId);
        },
        
        /**
         * Check consistency and get insights
         */
        async checkConsistency() {
          return await converter.checkConsistency(stateId);
        },
        
        /**
         * Convert back to kernel state
         */
        async convertBack() {
          return await converter.convertFromAtomSpace(stateId);
        },
        
        /**
         * Verify reasoning traceability
         */
        verifyTraceability(inferenceResult: any) {
          return converter.verifyReasoningTraceability(inferenceResult, stateId);
        }
      };
    }
  };
}

/**
 * Utility function to create common PLN queries
 */
export function createPLNQueries() {
  return {
    /**
     * Create similarity query for finding related concepts
     */
    similarity(targets: string[], minConfidence: number = 0.3): PLNQuery {
      return {
        type: 'similarity',
        targets,
        minConfidence,
        useAttention: true,
        parameters: { threshold: 0.5 }
      };
    },
    
    /**
     * Create inheritance query for hierarchical relationships
     */
    inheritance(targets: string[], minConfidence: number = 0.4): PLNQuery {
      return {
        type: 'inheritance',
        targets,
        minConfidence,
        maxDepth: 3,
        useAttention: true,
        parameters: { depth: 2 }
      };
    },
    
    /**
     * Create implication query for causal relationships
     */
    implication(targets: string[], minConfidence: number = 0.3): PLNQuery {
      return {
        type: 'implication',
        targets,
        minConfidence,
        useAttention: true,
        parameters: { temporal: true }
      };
    },
    
    /**
     * Create evaluation query for predicate assessment
     */
    evaluation(targets: string[], minConfidence: number = 0.4): PLNQuery {
      return {
        type: 'evaluation',
        targets,
        minConfidence,
        useAttention: true,
        parameters: { context_aware: true }
      };
    },
    
    /**
     * Create conjunction query for combining concepts
     */
    conjunction(targets: string[], minConfidence: number = 0.5): PLNQuery {
      return {
        type: 'conjunction',
        targets,
        minConfidence,
        parameters: { strength_boost: 0.1 }
      };
    },
    
    /**
     * Create custom agentic grammar query
     */
    agenticGrammar(targets: string[], minConfidence: number = 0.2): PLNQuery {
      return {
        type: 'custom',
        targets,
        minConfidence,
        maxDepth: 4,
        useAttention: true,
        parameters: {
          agentic_mode: true,
          grammar_constraints: true,
          self_reference: true,
          meta_reasoning: true
        }
      };
    }
  };
}

/**
 * Constants for OpenCog integration
 */
export const OPENCOG_CONSTANTS = {
  ATOM_TYPES: {
    CONCEPT_NODE: 'ConceptNode',
    PREDICATE_NODE: 'PredicateNode',
    NUMBER_NODE: 'NumberNode',
    INHERITANCE_LINK: 'InheritanceLink',
    SIMILARITY_LINK: 'SimilarityLink',
    EVALUATION_LINK: 'EvaluationLink',
    IMPLICATION_LINK: 'ImplicationLink',
    AND_LINK: 'AndLink',
    OR_LINK: 'OrLink',
    NOT_LINK: 'NotLink',
    LIST_LINK: 'ListLink',
    EXECUTION_LINK: 'ExecutionLink'
  } as const,
  
  PLN_RULES: {
    DEDUCTION: 'DeductionRule',
    INDUCTION: 'InductionRule',
    ABDUCTION: 'AbductionRule',
    ANALOGICAL: 'AnalogicalRule',
    BAYES: 'BayesRule',
    MODUS_PONENS: 'ModusPonensRule',
    CONJUNCTION: 'ConjunctionRule',
    DISJUNCTION: 'DisjunctionRule',
    NEGATION: 'NegationRule',
    INHERITANCE: 'InheritanceRule',
    SIMILARITY: 'SimilarityRule',
    ATTENTION_ALLOCATION: 'AttentionAllocationRule'
  } as const,
  
  DEFAULT_THRESHOLDS: {
    CONFIDENCE: 0.3,
    ATTENTION: 0.1,
    STRENGTH: 0.2,
    CONSISTENCY: 0.7
  } as const,
  
  DEFAULT_LIMITS: {
    MAX_TENSOR_SIZE: 100000,
    MAX_INFERENCE_DEPTH: 5,
    MAX_RESULTS: 50,
    MAX_ATTENTION_ATOMS: 20
  } as const
} as const;

// Re-export key imports for convenience
import { KernelStateConverter } from './kernel-state-converter.js';
import { PLNQuery } from './pln-adapter.js';