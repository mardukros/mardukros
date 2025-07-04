import { BaseValidator } from './validator.js';
import { aiRules } from './rules.js';
import { AiRequest } from '../ai/types/ai-types.js';

export class AiValidator extends BaseValidator {
  constructor() {
    super();
    aiRules.forEach(rule => this.addRule(rule));
  }

  validateAiRequest(request: AiRequest): ReturnType<BaseValidator['validate']> {
    return this.validate(request);
  }
}