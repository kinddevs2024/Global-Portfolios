import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
    AUTH_REFRESH_TOKEN_COOKIE,
    AUTH_TOKEN_COOKIE,
    getBackendApiUrl,
    parseBackendErrorMessage,
} from "@/lib/auth/backendAuth";

type BackendUser = {
    _id: string;
    email: string;
    role: "student" | "university" | "admin";
    isVerified?: boolean;
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

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
        const refreshToken = cookieStore.get(AUTH_REFRESH_TOKEN_COOKIE)?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
                secure: process.env.NODE_ENV === "production",
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
                secure: process.env.NODE_ENV === "production",
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
