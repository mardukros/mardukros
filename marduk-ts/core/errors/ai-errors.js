import { MardukError } from './base-error.js';
export class AiError extends MardukError {
    constructor(message, code, details) {
        super(message, `AI_${code}`, details);
    }
}
export class AiApiError extends AiError {
    constructor(message, details) {
        super(message, 'API_ERROR', details);
    }
}
export class AiValidationError extends AiError {
    constructor(message, details) {
        super(message, 'VALIDATION_ERROR', details);
    }
}
export class AiContextError extends AiError {
    constructor(message, details) {
        super(message, 'CONTEXT_ERROR', details);
    }
}
//# sourceMappingURL=ai-errors.js.map