import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    MONGODB_URI: z.string().min(1).default("mongodb://127.0.0.1:27017/global-portfolios"),
    JWT_SECRET: z.string().min(16).default("change-this-in-production-please"),
    JWT_EXPIRES_IN: z.string().default("7d"),
});

export function getEnv() {
    return envSchema.parse({
        NODE_ENV: process.env.NODE_ENV,
        MONGODB_URI: process.env.MONGODB_URI,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    });
}
