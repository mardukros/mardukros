import { BaseValidator } from './validator.js';
import { memoryRules } from './rules.js';
import { MemoryItem } from '../memory/types/base-types.js';

export class MemoryValidator extends BaseValidator {
  constructor() {
    super();
    memoryRules.forEach(rule => this.addRule(rule));
  }

  validateMemoryItem(item: MemoryItem): ReturnType<BaseValidator['validate']> {
    return this.validate(item);
  }
}