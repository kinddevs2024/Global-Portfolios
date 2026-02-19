import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import type { UserRole } from "@/types/auth";

export async function requireAuth(roles?: UserRole[]) {
    const cookieStore = await cookies();
    const token = cookieStore.get("gp_token")?.value;

    if (!token) {
        throw new Error("Unauthorized");
    }

    const payload = verifyToken(token);

    if (roles && !roles.includes(payload.role)) {
        throw new Error("Forbidden");
    }

    return payload;
}
