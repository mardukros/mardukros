export declare const env: {
    openai: {
        apiKey: string;
        model: string;
        organization: string | undefined;
    };
    server: {
        port: number;
        host: string;
    };
    memory: {
        dataDir: string;
        backupDir: string;
    };
    logging: {
        level: string;
        file: string;
    };
};
export declare function validateEnv(): void;
export declare function loadEnv(): void;
//# sourceMappingURL=env.d.ts.map