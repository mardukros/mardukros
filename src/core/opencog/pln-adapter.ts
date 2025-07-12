/**
 * PLN (Probabilistic Logic Networks) Adapter
 * 
 * Implements bidirectional adapter for PLN reasoning over AtomSpace,
 * enabling probabilistic inference and reasoning across agentic grammar.
 */

import { AtomSpace, Atom, Link, TruthValue, AtomType } from './atomspace-adapter.js';

/**
 * PLN Rule types for different kinds of inference
 */
export type PLNRuleType = 
  | 'DeductionRule'
  | 'InductionRule'
  | 'AbductionRule'
  | 'AnalogicalRule'
  | 'BayesRule'
  | 'ModusPonensRule'
  | 'ConjunctionRule'
  | 'DisjunctionRule'
  | 'NegationRule'
  | 'InheritanceRule'
  | 'SimilarityRule'
  | 'IntensionalInheritanceRule'
  | 'ExtensionalInheritanceRule'
  | 'AttentionAllocationRule';

/**
 * PLN Inference context
 */
export interface PLNContext {
  /** Maximum inference depth */
  maxDepth: number;
  /** Confidence threshold for results */
  confidenceThreshold: number;
  /** Maximum number of results to return */
  maxResults: number;
  /** Rule weights for combining evidence */
  ruleWeights: Map<PLNRuleType, number>;
  /** Attention bias for focusing inference */
  attentionBias: number;
  /** Temporal window for episodic reasoning */
  temporalWindow: number;
  /** Include meta-cognitive reasoning */
  includeMetaCognition: boolean;
}

/**
 * PLN Inference step
 */
export interface PLNInferenceStep {
  /** Rule applied */
  rule: PLNRuleType;
  /** Input atoms */
  inputs: string[]; // atom IDs
  /** Output atom */
  output: string; // atom ID
  /** Truth value computed */
  truthValue: TruthValue;
  /** Confidence in this step */
  confidence: number;
  /** Reasoning trace */
  reasoning: string;
  /** Step index in inference chain */
  stepIndex: number;
}

/**
 * PLN Inference result
 */
export interface PLNInferenceResult {
  /** Query that was processed */
  query: PLNQuery;
  /** Final conclusions */
  conclusions: Atom[];
  /** Inference steps taken */
  steps: PLNInferenceStep[];
  /** Overall confidence */
  confidence: number;
  /** Reasoning trace */
  trace: string[];
  /** Inference time in milliseconds */
  duration: number;
  /** Success/failure status */
  success: boolean;
  /** Error messages if any */
  errors: string[];
  /** Meta-cognitive insights */
  metaInsights: string[];
}

/**
 * PLN Query interface
 */
export interface PLNQuery {
  /** Type of query */
  type: 'inheritance' | 'similarity' | 'evaluation' | 'implication' | 'conjunction' | 'custom';
  /** Target atoms or patterns to query */
  targets: string[]; // atom names or IDs
  /** Query parameters */
  parameters: Record<string, any>;
  /** Optional context restrictions */
  context?: string[];
  /** Required confidence level */
  minConfidence?: number;
  /** Maximum inference depth */
  maxDepth?: number;
  /** Enable attention-guided inference */
  useAttention?: boolean;
}

/**
 * Truth value operations for PLN
 */
export class TruthValueOperations {
  
  /**
   * Deduction: P(A->C) from P(A->B) and P(B->C)
   */
  static deduction(ab: TruthValue, bc: TruthValue): TruthValue {
    const strength = ab.strength * bc.strength;
    const confidence = Math.min(ab.confidence, bc.confidence) * 0.9; // slight penalty for inference
    return { strength, confidence, count: Math.min(ab.count || 1, bc.count || 1) };
  }

  /**
   * Induction: P(B->A) from P(A->B) and P(A)
   */
  static induction(ab: TruthValue, a: TruthValue): TruthValue {
    const strength = (ab.strength * a.strength) / Math.max(0.01, a.strength);
    const confidence = Math.min(ab.confidence, a.confidence) * 0.8; // higher penalty for induction
    return { strength: Math.min(1.0, strength), confidence, count: Math.min(ab.count || 1, a.count || 1) };
  }

  /**
   * Abduction: P(A) from P(A->B) and P(B)
   */
  static abduction(ab: TruthValue, b: TruthValue): TruthValue {
    const strength = (ab.strength * b.strength) / Math.max(0.01, ab.strength);
    const confidence = Math.min(ab.confidence, b.confidence) * 0.7; // highest penalty for abduction
    return { strength: Math.min(1.0, strength), confidence, count: Math.min(ab.count || 1, b.count || 1) };
  }

  /**
   * Conjunction: P(A ∧ B)
   */
  static conjunction(a: TruthValue, b: TruthValue): TruthValue {
    const strength = a.strength * b.strength;
    const confidence = Math.min(a.confidence, b.confidence) * 0.95;
    return { strength, confidence, count: Math.min(a.count || 1, b.count || 1) };
  }

  /**
   * Disjunction: P(A ∨ B)
   */
  static disjunction(a: TruthValue, b: TruthValue): TruthValue {
    const strength = a.strength + b.strength - (a.strength * b.strength);
    const confidence = Math.min(a.confidence, b.confidence) * 0.95;
    return { strength, confidence, count: Math.min(a.count || 1, b.count || 1) };
  }

  /**
   * Negation: P(¬A)
   */
  static negation(a: TruthValue): TruthValue {
    return { 
      strength: 1.0 - a.strength, 
      confidence: a.confidence * 0.9,
      count: a.count 
    };
  }

  /**
   * Bayes rule: P(A|B) from P(B|A), P(A), P(B)
   */
  static bayes(ba: TruthValue, a: TruthValue, b: TruthValue): TruthValue {
    const strength = (ba.strength * a.strength) / Math.max(0.01, b.strength);
    const confidence = Math.min(ba.confidence, Math.min(a.confidence, b.confidence)) * 0.85;
    return { strength: Math.min(1.0, strength), confidence, count: Math.min(ba.count || 1, Math.min(a.count || 1, b.count || 1)) };
  }

  /**
   * Inheritance transitivity: P(A->C) from P(A->B) and P(B->C)
   */
  static inheritanceTransitivity(ab: TruthValue, bc: TruthValue): TruthValue {
    return this.deduction(ab, bc); // Same as deduction for inheritance chains
  }

  /**
   * Similarity symmetry: P(B~A) from P(A~B)
   */
  static similaritySymmetry(ab: TruthValue): TruthValue {
    return { ...ab }; // Similarity is symmetric
  }

  /**
   * Attention-weighted combination
   */
  static attentionWeighted(tv1: TruthValue, tv2: TruthValue, attention1: number, attention2: number): TruthValue {
    const totalAttention = attention1 + attention2;
    if (totalAttention === 0) return tv1;
    
    const w1 = attention1 / totalAttention;
    const w2 = attention2 / totalAttention;
    
    return {
      strength: w1 * tv1.strength + w2 * tv2.strength,
      confidence: w1 * tv1.confidence + w2 * tv2.confidence,
      count: Math.max(tv1.count || 1, tv2.count || 1)
    };
  }
}

/**
 * PLN Adapter for probabilistic reasoning
 */
export class PLNAdapter {
  private atomSpace: AtomSpace;
  private context: PLNContext;
  private inferenceHistory: PLNInferenceResult[] = [];

  constructor(atomSpace: AtomSpace, context?: Partial<PLNContext>) {
    this.atomSpace = atomSpace;
    this.context = {
      maxDepth: 5,
      confidenceThreshold: 0.1,
      maxResults: 50,
      ruleWeights: new Map([
        ['DeductionRule', 1.0],
        ['InductionRule', 0.8],
        ['AbductionRule', 0.6],
        ['BayesRule', 0.9],
        ['ConjunctionRule', 0.95],
        ['InheritanceRule', 1.0],
        ['SimilarityRule', 0.9],
        ['AttentionAllocationRule', 0.7]
      ]),
      attentionBias: 0.1,
      temporalWindow: 3600000, // 1 hour in milliseconds
      includeMetaCognition: true,
      ...context
    };
  }

  /**
   * Process a PLN query and return inference results
   */
  public async processQuery(query: PLNQuery): Promise<PLNInferenceResult> {
    const startTime = Date.now();
    const result: PLNInferenceResult = {
      query,
      conclusions: [],
      steps: [],
      confidence: 0,
      trace: [],
      duration: 0,
      success: false,
      errors: [],
      metaInsights: []
    };

    try {
      result.trace.push(`Starting PLN query: ${query.type} with targets: ${query.targets.join(', ')}`);

      // Find target atoms
      const targetAtoms = this.findTargetAtoms(query.targets);
      if (targetAtoms.length === 0) {
        result.errors.push('No target atoms found for query');
        return result;
      }

      // Perform inference based on query type
      switch (query.type) {
        case 'inheritance':
          await this.inferInheritance(targetAtoms, result);
          break;
        case 'similarity':
          await this.inferSimilarity(targetAtoms, result);
          break;
        case 'evaluation':
          await this.inferEvaluation(targetAtoms, result);
          break;
        case 'implication':
          await this.inferImplication(targetAtoms, result);
          break;
        case 'conjunction':
          await this.inferConjunction(targetAtoms, result);
          break;
        case 'custom':
          await this.inferCustom(targetAtoms, result);
          break;
      }

      // Apply attention-guided filtering if enabled
      if (query.useAttention) {
        this.applyAttentionFiltering(result);
      }

      // Meta-cognitive analysis
      if (this.context.includeMetaCognition) {
        this.performMetaCognitiveAnalysis(result);
      }

      // Filter by confidence threshold
      result.conclusions = result.conclusions.filter(atom => 
        atom.truthValue.confidence >= (query.minConfidence || this.context.confidenceThreshold)
      );

      // Calculate overall confidence
      result.confidence = this.calculateOverallConfidence(result);
      result.success = result.conclusions.length > 0;
      result.duration = Date.now() - startTime;

      result.trace.push(`Completed PLN query in ${result.duration}ms with ${result.conclusions.length} conclusions`);
      
      // Store in history
      this.inferenceHistory.push(result);

    } catch (error) {
      result.errors.push(`PLN inference error: ${error instanceof Error ? error.message : String(error)}`);
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Infer inheritance relationships
   */
  private async inferInheritance(targetAtoms: Atom[], result: PLNInferenceResult): Promise<void> {
    result.trace.push('Inferring inheritance relationships...');

    for (const atom of targetAtoms) {
      // Find existing inheritance links
      const inheritanceLinks = this.findLinksWithAtom(atom.id, 'InheritanceLink');
      
      for (const link of inheritanceLinks) {
        // Apply inheritance transitivity
        await this.applyInheritanceTransitivity(link, result);
      }

      // Find similarity links and infer inheritance
      const similarityLinks = this.findLinksWithAtom(atom.id, 'SimilarityLink');
      for (const link of similarityLinks) {
        await this.inferInheritanceFromSimilarity(link, result);
      }
    }
  }

  /**
   * Infer similarity relationships
   */
  private async inferSimilarity(targetAtoms: Atom[], result: PLNInferenceResult): Promise<void> {
    result.trace.push('Inferring similarity relationships...');

    for (let i = 0; i < targetAtoms.length; i++) {
      for (let j = i + 1; j < targetAtoms.length; j++) {
        const similarity = this.calculateSimilarity(targetAtoms[i], targetAtoms[j]);
        if (similarity.confidence >= this.context.confidenceThreshold) {
          const similarityAtom = this.createSimilarityAtom(targetAtoms[i], targetAtoms[j], similarity);
          result.conclusions.push(similarityAtom);
          
          result.steps.push({
            rule: 'SimilarityRule',
            inputs: [targetAtoms[i].id, targetAtoms[j].id],
            output: similarityAtom.id,
            truthValue: similarity,
            confidence: similarity.confidence,
            reasoning: `Computed similarity between ${targetAtoms[i].name} and ${targetAtoms[j].name}`,
            stepIndex: result.steps.length
          });
        }
      }
    }
  }

  /**
   * Infer evaluation relationships
   */
  private async inferEvaluation(targetAtoms: Atom[], result: PLNInferenceResult): Promise<void> {
    result.trace.push('Inferring evaluation relationships...');

    for (const atom of targetAtoms) {
      // Find predicates that could evaluate this atom
      const predicates = this.atomSpace.typeIndex.get('PredicateNode') || new Set();
      
      for (const predicateId of predicates) {
        const predicate = this.atomSpace.atoms.get(predicateId);
        if (!predicate) continue;

        const evaluation = this.evaluatePredicate(predicate, atom);
        if (evaluation.confidence >= this.context.confidenceThreshold) {
          const evaluationAtom = this.createEvaluationAtom(predicate, atom, evaluation);
          result.conclusions.push(evaluationAtom);
          
          result.steps.push({
            rule: 'BayesRule',
            inputs: [predicate.id, atom.id],
            output: evaluationAtom.id,
            truthValue: evaluation,
            confidence: evaluation.confidence,
            reasoning: `Evaluated ${predicate.name} on ${atom.name}`,
            stepIndex: result.steps.length
          });
        }
      }
    }
  }

  /**
   * Infer implication relationships
   */
  private async inferImplication(targetAtoms: Atom[], result: PLNInferenceResult): Promise<void> {
    result.trace.push('Inferring implication relationships...');

    for (let i = 0; i < targetAtoms.length; i++) {
      for (let j = 0; j < targetAtoms.length; j++) {
        if (i === j) continue;

        const implication = this.calculateImplication(targetAtoms[i], targetAtoms[j]);
        if (implication.confidence >= this.context.confidenceThreshold) {
          const implicationAtom = this.createImplicationAtom(targetAtoms[i], targetAtoms[j], implication);
          result.conclusions.push(implicationAtom);
          
          result.steps.push({
            rule: 'ModusPonensRule',
            inputs: [targetAtoms[i].id, targetAtoms[j].id],
            output: implicationAtom.id,
            truthValue: implication,
            confidence: implication.confidence,
            reasoning: `Inferred implication from ${targetAtoms[i].name} to ${targetAtoms[j].name}`,
            stepIndex: result.steps.length
          });
        }
      }
    }
  }

  /**
   * Infer conjunction relationships
   */
  private async inferConjunction(targetAtoms: Atom[], result: PLNInferenceResult): Promise<void> {
    result.trace.push('Inferring conjunction relationships...');

    // Combine pairs of atoms with conjunction
    for (let i = 0; i < targetAtoms.length; i++) {
      for (let j = i + 1; j < targetAtoms.length; j++) {
        const conjunction = TruthValueOperations.conjunction(
          targetAtoms[i].truthValue,
          targetAtoms[j].truthValue
        );

        if (conjunction.confidence >= this.context.confidenceThreshold) {
          const conjunctionAtom = this.createConjunctionAtom(targetAtoms[i], targetAtoms[j], conjunction);
          result.conclusions.push(conjunctionAtom);
          
          result.steps.push({
            rule: 'ConjunctionRule',
            inputs: [targetAtoms[i].id, targetAtoms[j].id],
            output: conjunctionAtom.id,
            truthValue: conjunction,
            confidence: conjunction.confidence,
            reasoning: `Conjoined ${targetAtoms[i].name} and ${targetAtoms[j].name}`,
            stepIndex: result.steps.length
          });
        }
      }
    }
  }

  /**
   * Perform custom inference based on query parameters
   */
  private async inferCustom(targetAtoms: Atom[], result: PLNInferenceResult): Promise<void> {
    result.trace.push('Performing custom inference...');
    
    // This would be extended based on specific custom inference needs
    // For now, apply a combination of different inference types
    
    await this.inferInheritance(targetAtoms, result);
    await this.inferSimilarity(targetAtoms, result);
    
    // Apply meta-reasoning
    if (this.context.includeMetaCognition) {
      await this.performMetaReasoning(targetAtoms, result);
    }
  }

  /**
   * Apply inheritance transitivity
   */
  private async applyInheritanceTransitivity(link: Link, result: PLNInferenceResult): Promise<void> {
    if (link.outgoing.length < 2) return;

    const [sourceId, targetId] = link.outgoing;
    
    // Find other inheritance links with target as source
    const transitiveLinks = this.findLinksWithAtom(targetId, 'InheritanceLink').filter(l => 
      l.outgoing[0] === targetId && l.id !== link.id
    );

    for (const transitiveLink of transitiveLinks) {
      const finalTargetId = transitiveLink.outgoing[1];
      
      // Apply transitivity: A->B, B->C => A->C
      const newTruthValue = TruthValueOperations.inheritanceTransitivity(
        link.truthValue,
        transitiveLink.truthValue
      );

      if (newTruthValue.confidence >= this.context.confidenceThreshold) {
        const transitiveAtom = this.createInheritanceAtom(sourceId, finalTargetId, newTruthValue);
        result.conclusions.push(transitiveAtom);
        
        result.steps.push({
          rule: 'InheritanceRule',
          inputs: [link.id, transitiveLink.id],
          output: transitiveAtom.id,
          truthValue: newTruthValue,
          confidence: newTruthValue.confidence,
          reasoning: `Transitive inheritance: ${sourceId} -> ${targetId} -> ${finalTargetId}`,
          stepIndex: result.steps.length
        });
      }
    }
  }

  /**
   * Infer inheritance from similarity
   */
  private async inferInheritanceFromSimilarity(link: Link, result: PLNInferenceResult): Promise<void> {
    if (link.outgoing.length < 2) return;

    const [atom1Id, atom2Id] = link.outgoing;
    
    // Find inheritance links for either atom
    const inheritanceLinks1 = this.findLinksWithAtom(atom1Id, 'InheritanceLink');
    const inheritanceLinks2 = this.findLinksWithAtom(atom2Id, 'InheritanceLink');

    // If A~B and A->C, then B->C (with reduced confidence)
    for (const inhLink of inheritanceLinks1) {
      if (inhLink.outgoing[0] === atom1Id) {
        const targetId = inhLink.outgoing[1];
        const newTruthValue = TruthValueOperations.deduction(
          link.truthValue,
          inhLink.truthValue
        );
        newTruthValue.confidence *= 0.8; // Reduce confidence for similarity-based inference

        if (newTruthValue.confidence >= this.context.confidenceThreshold) {
          const inheritanceAtom = this.createInheritanceAtom(atom2Id, targetId, newTruthValue);
          result.conclusions.push(inheritanceAtom);
          
          result.steps.push({
            rule: 'AnalogicalRule',
            inputs: [link.id, inhLink.id],
            output: inheritanceAtom.id,
            truthValue: newTruthValue,
            confidence: newTruthValue.confidence,
            reasoning: `Analogical inheritance: ${atom1Id}~${atom2Id}, ${atom1Id}->${targetId} => ${atom2Id}->${targetId}`,
            stepIndex: result.steps.length
          });
        }
      }
    }
  }

  /**
   * Perform meta-cognitive reasoning
   */
  private async performMetaReasoning(targetAtoms: Atom[], result: PLNInferenceResult): Promise<void> {
    result.trace.push('Performing meta-cognitive reasoning...');

    // Analyze reasoning patterns
    const reasoningPatterns = this.analyzeReasoningPatterns(result.steps);
    
    // Generate meta-insights
    for (const pattern of reasoningPatterns) {
      result.metaInsights.push(`Reasoning pattern detected: ${pattern}`);
    }

    // Self-evaluation of inference quality
    const qualityScore = this.evaluateInferenceQuality(result);
    result.metaInsights.push(`Inference quality score: ${qualityScore.toFixed(2)}`);

    // Attention allocation recommendations
    const attentionRecommendations = this.generateAttentionRecommendations(result);
    for (const rec of attentionRecommendations) {
      result.metaInsights.push(`Attention recommendation: ${rec}`);
    }
  }

  /**
   * Apply attention-guided filtering
   */
  private applyAttentionFiltering(result: PLNInferenceResult): void {
    result.trace.push('Applying attention-guided filtering...');

    // Sort conclusions by attention value
    result.conclusions.sort((a, b) => {
      const attentionA = a.attentionValue.sti + a.attentionValue.lti + a.attentionValue.vlti;
      const attentionB = b.attentionValue.sti + b.attentionValue.lti + b.attentionValue.vlti;
      return attentionB - attentionA;
    });

    // Apply attention bias to truth values
    for (const conclusion of result.conclusions) {
      const totalAttention = conclusion.attentionValue.sti + conclusion.attentionValue.lti + conclusion.attentionValue.vlti;
      const attentionBoost = 1.0 + (totalAttention * this.context.attentionBias);
      conclusion.truthValue.confidence *= Math.min(1.0, attentionBoost);
    }

    // Limit results based on attention threshold
    const attentionThreshold = this.calculateAttentionThreshold(result.conclusions);
    result.conclusions = result.conclusions.filter(atom => {
      const totalAttention = atom.attentionValue.sti + atom.attentionValue.lti + atom.attentionValue.vlti;
      return totalAttention >= attentionThreshold;
    });
  }

  /**
   * Perform meta-cognitive analysis
   */
  private performMetaCognitiveAnalysis(result: PLNInferenceResult): void {
    result.trace.push('Performing meta-cognitive analysis...');

    // Analyze inference chain complexity
    const complexity = this.calculateInferenceComplexity(result.steps);
    result.metaInsights.push(`Inference complexity: ${complexity.toFixed(2)}`);

    // Identify potential reasoning errors
    const errors = this.identifyReasoningErrors(result.steps);
    for (const error of errors) {
      result.metaInsights.push(`Potential reasoning error: ${error}`);
    }

    // Suggest alternative reasoning paths
    const alternatives = this.suggestAlternativeReasoningPaths(result);
    for (const alt of alternatives) {
      result.metaInsights.push(`Alternative reasoning path: ${alt}`);
    }

    // Evaluate coherence with existing knowledge
    const coherenceScore = this.evaluateCoherence(result.conclusions);
    result.metaInsights.push(`Knowledge coherence score: ${coherenceScore.toFixed(2)}`);
  }

  // Helper methods

  private findTargetAtoms(targets: string[]): Atom[] {
    const atoms: Atom[] = [];
    for (const target of targets) {
      // Try to find by ID first
      const atomById = this.atomSpace.atoms.get(target);
      if (atomById) {
        atoms.push(atomById);
        continue;
      }

      // Try to find by name
      const atomsByName = this.queryAtomsByName(target);
      atoms.push(...atomsByName);
    }
    return atoms;
  }

  private queryAtomsByName(name: string): Atom[] {
    const atomIds = this.atomSpace.nameIndex.get(name) || new Set();
    return Array.from(atomIds).map(id => this.atomSpace.atoms.get(id)!).filter(Boolean);
  }

  private findLinksWithAtom(atomId: string, linkType?: AtomType): Link[] {
    const links: Link[] = [];
    
    const linkIds = linkType ? 
      (this.atomSpace.typeIndex.get(linkType) || new Set()) :
      new Set([...this.atomSpace.links.keys()]);

    for (const linkId of linkIds) {
      const link = this.atomSpace.links.get(linkId);
      if (link && link.outgoing.includes(atomId)) {
        links.push(link);
      }
    }
    
    return links;
  }

  private calculateSimilarity(atom1: Atom, atom2: Atom): TruthValue {
    // Simple similarity calculation based on metadata and attention
    let similarity = 0.0;
    let confidence = 0.5;

    // Compare metadata
    const metadata1 = atom1.metadata;
    const metadata2 = atom2.metadata;
    
    const commonKeys = Object.keys(metadata1).filter(key => key in metadata2);
    if (commonKeys.length > 0) {
      similarity += 0.3;
      confidence += 0.2;
    }

    // Compare attention values
    const attention1 = atom1.attentionValue.sti + atom1.attentionValue.lti;
    const attention2 = atom2.attentionValue.sti + atom2.attentionValue.lti;
    const attentionSim = 1.0 - Math.abs(attention1 - attention2) / Math.max(attention1, attention2, 1.0);
    similarity += attentionSim * 0.4;

    // Compare truth values
    const truthSim = 1.0 - Math.abs(atom1.truthValue.strength - atom2.truthValue.strength);
    similarity += truthSim * 0.3;

    return { 
      strength: Math.min(1.0, similarity), 
      confidence: Math.min(1.0, confidence),
      count: 1 
    };
  }

  private calculateImplication(atom1: Atom, atom2: Atom): TruthValue {
    // Calculate implication strength based on co-occurrence and patterns
    let strength = 0.5;
    let confidence = 0.3;

    // Check if atoms appear together in links
    const links1 = this.findLinksWithAtom(atom1.id);
    const links2 = this.findLinksWithAtom(atom2.id);
    
    const commonLinks = links1.filter(link1 => 
      links2.some(link2 => link2.outgoing.some(atomId => link1.outgoing.includes(atomId)))
    );

    if (commonLinks.length > 0) {
      strength += 0.3;
      confidence += 0.4;
    }

    // Consider temporal ordering for episodic memory
    if (atom1.metadata.type === 'episodic_memory' && atom2.metadata.type === 'episodic_memory') {
      const time1 = atom1.metadata.timestamp || 0;
      const time2 = atom2.metadata.timestamp || 0;
      if (time1 < time2) {
        strength += 0.2;
        confidence += 0.2;
      }
    }

    return { 
      strength: Math.min(1.0, strength), 
      confidence: Math.min(1.0, confidence),
      count: 1 
    };
  }

  private evaluatePredicate(predicate: Atom, target: Atom): TruthValue {
    // Evaluate how well a predicate applies to a target
    let strength = 0.5;
    let confidence = 0.6;

    // Check metadata compatibility
    if (predicate.metadata.type && target.metadata.type) {
      if (predicate.metadata.type === target.metadata.type) {
        strength += 0.3;
        confidence += 0.2;
      }
    }

    // Check if they appear in evaluation links together
    const evaluationLinks = this.findLinksWithAtom(predicate.id, 'EvaluationLink');
    const targetInEvaluations = evaluationLinks.some(link => link.outgoing.includes(target.id));
    
    if (targetInEvaluations) {
      strength += 0.4;
      confidence += 0.3;
    }

    return { 
      strength: Math.min(1.0, strength), 
      confidence: Math.min(1.0, confidence),
      count: 1 
    };
  }

  // Atom creation methods

  private createSimilarityAtom(atom1: Atom, atom2: Atom, truthValue: TruthValue): Atom {
    return {
      id: `similarity_${atom1.id}_${atom2.id}_${Date.now()}`,
      type: 'SimilarityLink',
      name: `similarity_${atom1.name}_${atom2.name}`,
      truthValue,
      attentionValue: {
        sti: (atom1.attentionValue.sti + atom2.attentionValue.sti) / 2,
        lti: (atom1.attentionValue.lti + atom2.attentionValue.lti) / 2,
        vlti: (atom1.attentionValue.vlti + atom2.attentionValue.vlti) / 2
      },
      metadata: {
        inferred: true,
        inferenceType: 'similarity',
        sourceAtoms: [atom1.id, atom2.id]
      },
      source: {
        kernelId: 'pln_adapter',
        tensorComponent: 'similarity_inference'
      }
    };
  }

  private createInheritanceAtom(sourceId: string, targetId: string, truthValue: TruthValue): Atom {
    return {
      id: `inheritance_${sourceId}_${targetId}_${Date.now()}`,
      type: 'InheritanceLink',
      name: `inheritance_${sourceId}_${targetId}`,
      truthValue,
      attentionValue: { sti: 0.3, lti: 0.2, vlti: 0.1 },
      metadata: {
        inferred: true,
        inferenceType: 'inheritance',
        sourceAtoms: [sourceId, targetId]
      },
      source: {
        kernelId: 'pln_adapter',
        tensorComponent: 'inheritance_inference'
      }
    };
  }

  private createEvaluationAtom(predicate: Atom, target: Atom, truthValue: TruthValue): Atom {
    return {
      id: `evaluation_${predicate.id}_${target.id}_${Date.now()}`,
      type: 'EvaluationLink',
      name: `evaluation_${predicate.name}_${target.name}`,
      truthValue,
      attentionValue: {
        sti: Math.max(predicate.attentionValue.sti, target.attentionValue.sti),
        lti: (predicate.attentionValue.lti + target.attentionValue.lti) / 2,
        vlti: (predicate.attentionValue.vlti + target.attentionValue.vlti) / 2
      },
      metadata: {
        inferred: true,
        inferenceType: 'evaluation',
        sourceAtoms: [predicate.id, target.id]
      },
      source: {
        kernelId: 'pln_adapter',
        tensorComponent: 'evaluation_inference'
      }
    };
  }

  private createImplicationAtom(source: Atom, target: Atom, truthValue: TruthValue): Atom {
    return {
      id: `implication_${source.id}_${target.id}_${Date.now()}`,
      type: 'ImplicationLink',
      name: `implication_${source.name}_${target.name}`,
      truthValue,
      attentionValue: {
        sti: (source.attentionValue.sti + target.attentionValue.sti) / 2,
        lti: Math.max(source.attentionValue.lti, target.attentionValue.lti),
        vlti: (source.attentionValue.vlti + target.attentionValue.vlti) / 2
      },
      metadata: {
        inferred: true,
        inferenceType: 'implication',
        sourceAtoms: [source.id, target.id]
      },
      source: {
        kernelId: 'pln_adapter',
        tensorComponent: 'implication_inference'
      }
    };
  }

  private createConjunctionAtom(atom1: Atom, atom2: Atom, truthValue: TruthValue): Atom {
    return {
      id: `conjunction_${atom1.id}_${atom2.id}_${Date.now()}`,
      type: 'AndLink',
      name: `conjunction_${atom1.name}_${atom2.name}`,
      truthValue,
      attentionValue: {
        sti: Math.min(atom1.attentionValue.sti, atom2.attentionValue.sti),
        lti: Math.min(atom1.attentionValue.lti, atom2.attentionValue.lti),
        vlti: Math.min(atom1.attentionValue.vlti, atom2.attentionValue.vlti)
      },
      metadata: {
        inferred: true,
        inferenceType: 'conjunction',
        sourceAtoms: [atom1.id, atom2.id]
      },
      source: {
        kernelId: 'pln_adapter',
        tensorComponent: 'conjunction_inference'
      }
    };
  }

  // Analysis and utility methods

  private calculateOverallConfidence(result: PLNInferenceResult): number {
    if (result.conclusions.length === 0) return 0;
    
    const confidences = result.conclusions.map(atom => atom.truthValue.confidence);
    const avgConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    
    // Weight by number of inference steps (more steps = lower confidence)
    const stepPenalty = Math.max(0.1, 1.0 - (result.steps.length * 0.05));
    
    return avgConfidence * stepPenalty;
  }

  private calculateAttentionThreshold(conclusions: Atom[]): number {
    if (conclusions.length === 0) return 0;
    
    const attentionValues = conclusions.map(atom => 
      atom.attentionValue.sti + atom.attentionValue.lti + atom.attentionValue.vlti
    );
    
    const avgAttention = attentionValues.reduce((sum, att) => sum + att, 0) / attentionValues.length;
    return avgAttention * 0.5; // Use 50% of average as threshold
  }

  private analyzeReasoningPatterns(steps: PLNInferenceStep[]): string[] {
    const patterns: string[] = [];
    
    // Count rule usage
    const ruleCounts = new Map<PLNRuleType, number>();
    steps.forEach(step => {
      ruleCounts.set(step.rule, (ruleCounts.get(step.rule) || 0) + 1);
    });

    // Identify dominant reasoning patterns
    for (const [rule, count] of ruleCounts.entries()) {
      if (count > steps.length * 0.3) {
        patterns.push(`Heavy use of ${rule} (${count}/${steps.length} steps)`);
      }
    }

    // Check for circular reasoning
    const atomUsage = new Map<string, number>();
    steps.forEach(step => {
      step.inputs.forEach(atomId => {
        atomUsage.set(atomId, (atomUsage.get(atomId) || 0) + 1);
      });
    });

    for (const [atomId, count] of atomUsage.entries()) {
      if (count > 3) {
        patterns.push(`Potential circular reasoning involving atom ${atomId}`);
      }
    }

    return patterns;
  }

  private evaluateInferenceQuality(result: PLNInferenceResult): number {
    let quality = 0.5;

    // Factor in confidence levels
    if (result.confidence > 0.8) quality += 0.3;
    else if (result.confidence > 0.6) quality += 0.2;
    else if (result.confidence > 0.4) quality += 0.1;

    // Factor in reasoning diversity
    const uniqueRules = new Set(result.steps.map(step => step.rule)).size;
    quality += Math.min(0.2, uniqueRules * 0.05);

    // Factor in conclusion coherence
    const coherence = this.evaluateCoherence(result.conclusions);
    quality += coherence * 0.3;

    return Math.min(1.0, quality);
  }

  private generateAttentionRecommendations(result: PLNInferenceResult): string[] {
    const recommendations: string[] = [];

    // Find low-attention high-confidence conclusions
    const undervalued = result.conclusions.filter(atom => {
      const totalAttention = atom.attentionValue.sti + atom.attentionValue.lti + atom.attentionValue.vlti;
      return atom.truthValue.confidence > 0.8 && totalAttention < 0.3;
    });

    if (undervalued.length > 0) {
      recommendations.push(`Increase attention for ${undervalued.length} high-confidence conclusions`);
    }

    // Find high-attention low-confidence conclusions
    const overvalued = result.conclusions.filter(atom => {
      const totalAttention = atom.attentionValue.sti + atom.attentionValue.lti + atom.attentionValue.vlti;
      return atom.truthValue.confidence < 0.4 && totalAttention > 0.7;
    });

    if (overvalued.length > 0) {
      recommendations.push(`Reduce attention for ${overvalued.length} low-confidence conclusions`);
    }

    return recommendations;
  }

  private calculateInferenceComplexity(steps: PLNInferenceStep[]): number {
    if (steps.length === 0) return 0;

    // Base complexity from number of steps
    let complexity = steps.length * 0.1;

    // Add complexity for rule diversity
    const uniqueRules = new Set(steps.map(step => step.rule)).size;
    complexity += uniqueRules * 0.05;

    // Add complexity for inference depth
    const maxDepth = Math.max(...steps.map(step => step.stepIndex));
    complexity += maxDepth * 0.02;

    return complexity;
  }

  private identifyReasoningErrors(steps: PLNInferenceStep[]): string[] {
    const errors: string[] = [];

    // Check for confidence degradation
    steps.forEach(step => {
      if (step.confidence < 0.1) {
        errors.push(`Very low confidence in step ${step.stepIndex}: ${step.reasoning}`);
      }
    });

    // Check for contradictory conclusions
    const conclusions = steps.map(step => step.output);
    const contradictions = this.findContradictions(conclusions);
    errors.push(...contradictions);

    return errors;
  }

  private findContradictions(conclusionIds: string[]): string[] {
    // This would implement contradiction detection logic
    // For now, return empty array as placeholder
    return [];
  }

  private suggestAlternativeReasoningPaths(result: PLNInferenceResult): string[] {
    const alternatives: string[] = [];

    // Suggest using underutilized rules
    const allRules: PLNRuleType[] = [
      'DeductionRule', 'InductionRule', 'AbductionRule', 'BayesRule',
      'ConjunctionRule', 'DisjunctionRule', 'AnalogicalRule'
    ];

    const usedRules = new Set(result.steps.map(step => step.rule));
    const unusedRules = allRules.filter(rule => !usedRules.has(rule));

    if (unusedRules.length > 0) {
      alternatives.push(`Consider using ${unusedRules.join(', ')} for alternative reasoning paths`);
    }

    // Suggest meta-cognitive reflection
    if (!this.context.includeMetaCognition) {
      alternatives.push('Enable meta-cognitive reasoning for deeper insights');
    }

    return alternatives;
  }

  private evaluateCoherence(conclusions: Atom[]): number {
    if (conclusions.length < 2) return 1.0;

    let coherenceSum = 0;
    let comparisons = 0;

    // Compare each pair of conclusions for coherence
    for (let i = 0; i < conclusions.length; i++) {
      for (let j = i + 1; j < conclusions.length; j++) {
        const coherence = this.calculatePairCoherence(conclusions[i], conclusions[j]);
        coherenceSum += coherence;
        comparisons++;
      }
    }

    return comparisons > 0 ? coherenceSum / comparisons : 1.0;
  }

  private calculatePairCoherence(atom1: Atom, atom2: Atom): number {
    // Simple coherence measure based on truth value consistency
    const strengthDiff = Math.abs(atom1.truthValue.strength - atom2.truthValue.strength);
    const confidenceDiff = Math.abs(atom1.truthValue.confidence - atom2.truthValue.confidence);
    
    return 1.0 - ((strengthDiff + confidenceDiff) / 2);
  }

  /**
   * Get inference history
   */
  public getInferenceHistory(): PLNInferenceResult[] {
    return [...this.inferenceHistory];
  }

  /**
   * Clear inference history
   */
  public clearHistory(): void {
    this.inferenceHistory = [];
  }

  /**
   * Update PLN context
   */
  public updateContext(newContext: Partial<PLNContext>): void {
    this.context = { ...this.context, ...newContext };
  }

  /**
   * Get current context
   */
  public getContext(): PLNContext {
    return { ...this.context };
  }
}