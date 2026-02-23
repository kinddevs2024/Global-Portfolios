import { cookies } from "next/headers";
import { getBackendApiUrl } from "@/lib/auth/backendAuth";
import { verifyToken } from "@/lib/auth/jwt";
import type { UserRole } from "@/types/auth";

type AuthPayload = { userId: string; role: string; email: string };

async function tryBackendAuth(token: string): Promise<AuthPayload | null> {
    try {
        const res = await fetch(getBackendApiUrl("/auth/me"), {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
        if (!res.ok) return null;
        const data = (await res.json()) as { user?: { userId?: string; _id?: string; id?: string; role?: string; email?: string } };
        const user = data.user;
        if (!user) return null;
        const userId = user.userId ?? user._id ?? user.id;
        if (!userId || !user.role) return null;
        return { userId: String(userId), role: user.role, email: user.email ?? "" };
    } catch {
        return null;
    }
}

export async function requireAuth(roles?: UserRole[]): Promise<AuthPayload> {
    const cookieStore = await cookies();
    const token = cookieStore.get("gp_token")?.value;

    if (!token) {
        throw new Error("Unauthorized");
    }

    let payload: AuthPayload;

    try {
        const local = verifyToken(token);
        payload = { userId: local.userId, role: local.role, email: local.email };
    } catch {
        const backend = await tryBackendAuth(token);
        if (!backend) throw new Error("Unauthorized");
        payload = backend;
    }

    if (roles && !roles.includes(payload.role as UserRole)) {
        throw new Error("Forbidden");
    }

    return payload;
}
