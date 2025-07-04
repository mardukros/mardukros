import { BaseMemoryItem } from '../types/memory-items.js';

/**
 * Formats an event memory item for display
 */
export function formatEventMemory(item: EventMemoryItem): string {
  let formatted = `[Event] ${item.content.title} (${new Date(item.content.timestamp).toISOString()})`;
  formatted += `\n${item.content.description}`;

  if (item.metadata.significance && item.metadata.significance > 0.8) {
    formatted += " [HIGH SIGNIFICANCE]";
  }

  if (item.content.actors && item.content.actors.length > 0) {
    formatted += `\nActors: ${item.content.actors.join(', ')}`;
  }

  return formatted;
}

/**
 * Formats a concept's relationships
 */
export function formatConceptRelationships(item: ConceptMemoryItem): string[] {
  if (!item.content.relationships || item.content.relationships.length === 0) {
    return [];
  }
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

  return item.content.relationships.map(rel => 
    `${item.content.name} ${rel.type} ${rel.target} (strength: ${rel.strength})`
  );
}

/**
 * Formats a procedural workflow for display
 */
export function formatProcedureWorkflow(workflow: ProceduralMemoryItem): string {
  let formatted = `${workflow.content.name}\n`;
  formatted += `Duration: ${workflow.content.estimated_duration || 0} minutes\n`;

  // Format success rate as percentage
  formatted += `Success Rate: ${((workflow.metadata.success_rate || 0) * 100).toFixed(1)}%\n`;

  // Format steps with numbers
  if (workflow.content.steps && workflow.content.steps.length > 0) {
    formatted += "Steps:\n";
    workflow.content.steps.forEach((step, index) => {
      formatted += `${index + 1}. ${step}\n`;
    });
  }

  // Add prerequisites if available
  if (workflow.content.prerequisites && workflow.content.prerequisites.length > 0) {
    formatted += `\nPrerequisites: ${workflow.content.prerequisites.join(', ')}`;
  }

  return formatted;
}

/**
 * Format a fact memory item
 */
export function formatFactMemory(item: FactMemoryItem): string {
  let formatted = `[Fact] ${item.content.statement}`;

  if (item.content.truth_value < 1) {
    formatted += ` (Confidence: ${(item.content.truth_value * 100).toFixed(1)}%)`;
  }

  if (item.content.sources && item.content.sources.length > 0) {
    formatted += `\nSources: ${item.content.sources.join(', ')}`;
  }

  return formatted;
}

/**
 * Format a memory item based on its type
 */
export function formatMemoryItem(item: any): string {
  switch (item.type) {
    case 'event':
      return formatEventMemory(item as EventMemoryItem);
    case 'concept':
      return `[Concept] ${(item as ConceptMemoryItem).content.name}: ${(item as ConceptMemoryItem).content.description}`;
    case 'fact':
      return formatFactMemory(item as FactMemoryItem);
    case 'procedure':
      return formatProcedureWorkflow(item as ProceduralMemoryItem);
    default:
      return `[Unknown Type] ${JSON.stringify(item.content)}`;
  }
}

// memory-types.js
// This file needs to be created separately.  This is a placeholder.
export interface EventMemoryItem { type: 'event'; content: { title: string; description: string; timestamp: number; actors?: string[]; }; metadata: { significance?: number; }; }
export interface FactMemoryItem { type: 'fact'; content: { statement: string; truth_value: number; sources?: string[]; }; metadata: {}; }
export interface ConceptMemoryItem { type: 'concept'; content: { name: string; description: string; relationships?: { type: string; target: string; strength: number; }[]; }; metadata: {}; }
export interface ProceduralMemoryItem { type: 'procedure'; content: { name: string; estimated_duration?: number; steps?: string[]; prerequisites?: string[]; }; metadata: { success_rate?: number; }; }