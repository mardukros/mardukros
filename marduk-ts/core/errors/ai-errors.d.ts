import { MardukError } from './base-error.js';
export declare class AiError extends MardukError {
    constructor(message: string, code: string, details?: Record<string, unknown>);
}
export declare class AiApiError extends AiError {
    constructor(message: string, details?: Record<string, unknown>);
}
export declare class AiValidationError extends AiError {
    constructor(message: string, details?: Record<string, unknown>);
}
export declare class AiContextError extends AiError {
    constructor(message: string, details?: Record<string, unknown>);
}
//# sourceMappingURL=ai-errors.d.ts.map