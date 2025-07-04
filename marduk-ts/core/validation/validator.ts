import { ValidationResult, ValidationRule, Validator } from './types.js';

export class BaseValidator implements Validator {
  protected rules: ValidationRule[] = [];

  validate(data: unknown): ValidationResult {
    const errors: string[] = [];

    for (const rule of this.rules) {
      try {
        const value = this.getNestedValue(data, rule.field);
        if (!rule.validator(value)) {
          errors.push(rule.message);
        }
      } catch (error) {
        errors.push(`Error validating ${rule.field}: ${error.message}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  addRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  removeRule(field: string): void {
    this.rules = this.rules.filter(rule => rule.field !== field);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => 
      current && current[key], obj);
  }
}