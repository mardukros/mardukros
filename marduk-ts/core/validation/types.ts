export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ValidationRule {
  field: string;
  validator: (value: any) => boolean;
  message: string;
}

export interface Validator {
  validate(data: unknown): ValidationResult;
  addRule(rule: ValidationRule): void;
  removeRule(field: string): void;
}