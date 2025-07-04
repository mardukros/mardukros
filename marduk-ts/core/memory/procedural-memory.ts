import { BaseMemory } from './base-memory.js';
import { TaskMessage } from '../types/messages.js';

interface Workflow {
  id: number;
  title: string;
  steps: string[];
  tags?: string[];
}

export class ProceduralMemory extends BaseMemory {
  private workflows: Map<number, Workflow> = new Map();

  constructor() {
    super('procedural_memory');
    this.initializeWorkflows();
  }

  private initializeWorkflows(): void {
    this.addWorkflow({
      id: 1,
      title: "Chaos Theory Analysis",
      steps: [
        "Define objectives",
        "Collect data",
        "Run simulations",
        "Analyze results"
      ],
      tags: ["analysis", "chaos-theory", "research"]
    });

    this.addWorkflow({
      id: 2,
      title: "Bug Resolution Workflow",
      steps: [
        "Identify issue",
        "Reproduce bug",
        "Fix code",
        "Test solution",
        "Document fix"
      ],
      tags: ["debugging", "maintenance", "quality"]
    });
  }

  private addWorkflow(workflow: Workflow): void {
    this.workflows.set(workflow.id, workflow);
  }

  protected handleMessage(message: TaskMessage): void {
    if (message.type === 'task') {
      if (message.query.includes('workflow')) {
        const workflows = this.queryWorkflows(message.query);
        this.sendResponse(message.task_id, workflows);
      } else if (message.query.includes('steps')) {
        const steps = this.getWorkflowSteps(message.query);
        this.sendResponse(message.task_id, steps);
      }
    }
  }

  private queryWorkflows(query: string): string[] {
    const results: string[] = [];
    this.workflows.forEach(workflow => {
      if (this.matchesQuery(workflow, query)) {
        results.push(this.formatWorkflow(workflow));
      }
    });
    return results;
  }

  private getWorkflowSteps(query: string): string[] {
    const workflow = Array.from(this.workflows.values())
      .find(w => this.matchesQuery(w, query));
    
    return workflow ? workflow.steps : [];
  }

  private matchesQuery(workflow: Workflow, query: string): boolean {
    const searchTerm = query.toLowerCase();
    return (
      workflow.title.toLowerCase().includes(searchTerm) ||
      workflow.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      workflow.steps.some(step => step.toLowerCase().includes(searchTerm))
    );
  }

  private formatWorkflow(workflow: Workflow): string {
    return `${workflow.title}:\n${workflow.steps.map((step, index) => 
      `  ${index + 1}. ${step}`
    ).join('\n')}`;
  }
}