export declare class MardukError extends Error {
    code: string;
    details?: Record<string, unknown> | undefined;
    constructor(message: string, code: string, details?: Record<string, unknown> | undefined);
    toJSON(): {
        name: string;
        message: string;
        code: string;
        details: Record<string, unknown> | undefined;
        stack: string | undefined;
    };
}
//# sourceMappingURL=base-error.d.ts.map