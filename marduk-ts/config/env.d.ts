export declare const env: {
    openai: {
        apiKey: any;
        model: any;
        organization: any;
    };
    server: {
        port: number;
        host: any;
    };
    memory: {
        dataDir: any;
        backupDir: any;
    };
    logging: {
        level: any;
        file: any;
    };
};
export declare function validateEnv(): void;
export declare function loadEnv(): void;
//# sourceMappingURL=env.d.ts.map