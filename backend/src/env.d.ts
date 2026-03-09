declare namespace NodeJS {
    interface ProcessEnv {
        MONGODB_URI: string;
        PORT: string;
        JWT_SECRET: string;
        TOKEN_TTL: string;
        CLIENT_ORIGIN: string;
        CLIENT_ORIGIN_LOCAL: string;
    }
}
