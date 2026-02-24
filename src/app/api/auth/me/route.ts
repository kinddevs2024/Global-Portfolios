import { NextResponse } from "next/server";
import { AUTH_TOKEN_COOKIE, shouldUseSecureAuthCookies } from "@/lib/auth/backendAuth";
import { verifyToken } from "@/lib/auth/jwt";
import { getUserById } from "@/server/services/auth.service";
import { cookies } from "next/headers";

type LocalUser = {
    _id: unknown;
    email?: string;
    role?: string;
    verificationStatus?: string;
    emailVerifiedAt?: Date | null;
};

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const localPayload = verifyToken(token);
        const localUser = await getUserById(localPayload.userId);
        const normalizedLocalUser = Array.isArray(localUser) ? localUser[0] : localUser;

        if (!normalizedLocalUser || typeof normalizedLocalUser !== "object" || !("_id" in normalizedLocalUser)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const typedLocalUser = normalizedLocalUser as LocalUser;

        return NextResponse.json({
            data: {
                _id: String(typedLocalUser._id),
                email: String(typedLocalUser.email ?? localPayload.email),
                role: typedLocalUser.role ?? localPayload.role,
                verificationStatus: typedLocalUser.verificationStatus ?? "pending",
                emailVerified: !!typedLocalUser.emailVerifiedAt,
            },
        });
    } catch {
        const secureCookies = shouldUseSecureAuthCookies(request);
        const unauthorizedResponse = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        unauthorizedResponse.cookies.set(AUTH_TOKEN_COOKIE, "", {
            httpOnly: true,
            sameSite: "lax",
            secure: secureCookies,
            path: "/",
            maxAge: 0,
        });
        return unauthorizedResponse;
    }
}
