import jwt from "jsonwebtoken";
import { getEnv } from "@/lib/config/env";
import type { UserRole } from "@/types/auth";

export interface TokenPayload {
    userId: string;
    role: UserRole;
    email: string;
}

export function signToken(payload: TokenPayload) {
    const { JWT_SECRET, JWT_EXPIRES_IN } = getEnv();
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload {
    const { JWT_SECRET } = getEnv();
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
