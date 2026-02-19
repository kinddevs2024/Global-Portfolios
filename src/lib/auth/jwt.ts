import jwt from "jsonwebtoken";
import { getEnv } from "@/lib/config/env";
import type { UserRole } from "@/types/auth";
import type { SignOptions } from "jsonwebtoken";

export interface TokenPayload {
    userId: string;
    role: UserRole;
    email: string;
}

export function signToken(payload: TokenPayload) {
    const { JWT_SECRET, JWT_EXPIRES_IN } = getEnv();
    const expiresIn = JWT_EXPIRES_IN as SignOptions["expiresIn"];
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): TokenPayload {
    const { JWT_SECRET } = getEnv();
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
