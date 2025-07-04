import { AiRequest, AiResponse } from '../types/ai-types.js';
export declare function validateAiRequest(request: AiRequest): {
    valid: boolean;
    errors: string[];
};
export declare function enrichAiRequest(request: Partial<AiRequest>): AiRequest;
export declare function formatAiResponse(response: AiResponse): string;
//# sourceMappingURL=ai-utils.d.ts.map