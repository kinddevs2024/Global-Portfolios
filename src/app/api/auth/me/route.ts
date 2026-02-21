import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
    AUTH_REFRESH_TOKEN_COOKIE,
    AUTH_TOKEN_COOKIE,
    getBackendApiUrl,
    parseBackendErrorMessage,
    shouldUseSecureAuthCookies,
} from "@/lib/auth/backendAuth";
import { verifyToken } from "@/lib/auth/jwt";
import { getUserById } from "@/server/services/auth.service";

type BackendUser = {
    _id: string;
    email: string;
    role: "student" | "university" | "admin";
    isVerified?: boolean;
};

type LocalUser = {
    _id: unknown;
    email?: string;
    role?: string;
    verificationStatus?: string;
};

async function fetchMeByAccessToken(token: string) {
    return fetch(getBackendApiUrl("/auth/me"), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });
}

export async function GET(request: Request) {
    try {
        const secureCookies = shouldUseSecureAuthCookies(request);
        const cookieStore = await cookies();
        const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
        const refreshToken = cookieStore.get(AUTH_REFRESH_TOKEN_COOKIE)?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            const localPayload = verifyToken(token);
            const localUser = await getUserById(localPayload.userId);
            const normalizedLocalUser = Array.isArray(localUser) ? localUser[0] : localUser;

            if (normalizedLocalUser && typeof normalizedLocalUser === "object" && "_id" in normalizedLocalUser) {
                const typedLocalUser = normalizedLocalUser as LocalUser;

                return NextResponse.json({
                    data: {
                        _id: String(typedLocalUser._id),
                        email: String(typedLocalUser.email ?? localPayload.email),
                        role: typedLocalUser.role ?? localPayload.role,
                        verificationStatus: typedLocalUser.verificationStatus ?? "pending",
                    },
                });
            }
        } catch {
            // token may belong to external backend, continue with backend /auth/me flow
        }

        let meResponse = await fetchMeByAccessToken(token);
        let currentToken = token;

        if (meResponse.status === 401 && refreshToken) {
            const refreshResponse = await fetch(getBackendApiUrl("/auth/refresh"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
                cache: "no-store",
            });

            if (refreshResponse.ok) {
                const refreshPayload = (await refreshResponse.json()) as { token: string };
                currentToken = refreshPayload.token;
                meResponse = await fetchMeByAccessToken(currentToken);
            }
        }

        if (!meResponse.ok) {
            const message = await parseBackendErrorMessage(meResponse, "Unauthorized");
            const unauthorizedResponse = NextResponse.json({ error: message }, { status: meResponse.status });
            unauthorizedResponse.cookies.set(AUTH_TOKEN_COOKIE, "", {
                httpOnly: true,
                sameSite: "lax",
                secure: secureCookies,
                path: "/",
                maxAge: 0,
            });
            return unauthorizedResponse;
        }

        const payload = (await meResponse.json()) as { user: BackendUser };
        const user = payload.user;

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const response = NextResponse.json({
            data: {
                _id: user._id,
                email: user.email,
                role: user.role,
                verificationStatus: user.isVerified ? "verified" : "pending",
            },
        });

        if (currentToken !== token) {
            response.cookies.set(AUTH_TOKEN_COOKIE, currentToken, {
                httpOnly: true,
                sameSite: "lax",
                secure: secureCookies,
                path: "/",
                maxAge: 60 * 60 * 24 * 7,
            });
        }

        return response;
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unauthorized";
        return NextResponse.json({ error: message }, { status: 401 });
    }
}
