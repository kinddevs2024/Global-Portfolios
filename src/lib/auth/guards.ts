import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import type { UserRole } from "@/types/auth";

type AuthPayload = { userId: string; role: string; email: string };

export async function requireAuth(roles?: UserRole[]): Promise<AuthPayload> {
    const cookieStore = await cookies();
    const token = cookieStore.get("gp_token")?.value;

    if (!token) {
        throw new Error("Unauthorized");
    }

    try {
        const local = verifyToken(token);
        const payload: AuthPayload = { userId: local.userId, role: local.role, email: local.email };
        if (roles && !roles.includes(payload.role as UserRole)) {
            throw new Error("Forbidden");
        }
        return payload;
    } catch (e) {
        if (e instanceof Error && (e.message === "Unauthorized" || e.message === "Forbidden")) throw e;
        throw new Error("Unauthorized");
    }
}
