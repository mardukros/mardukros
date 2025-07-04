declare class Logger {
    private static instance;
    private logger;
    private constructor();
    static getInstance(): Logger;
    info(message: string, metadata?: object): void;
    warn(message: string, metadata?: object): void;
    error(message: string, error?: Error, metadata?: object): void;
    debug(message: string, metadata?: object): void;
    rotateLog(): Promise<void>;
}
export declare const logger: Logger;
export {};
//# sourceMappingURL=logger.d.ts.map