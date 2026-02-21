import { NextResponse } from "next/server";
import { AUTH_REFRESH_TOKEN_COOKIE, AUTH_TOKEN_COOKIE, shouldUseSecureAuthCookies } from "@/lib/auth/backendAuth";

export async function POST(request: Request) {
    const secureCookies = shouldUseSecureAuthCookies(request);
    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_TOKEN_COOKIE, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: secureCookies,
        path: "/",
        maxAge: 0,
    });

    response.cookies.set(AUTH_REFRESH_TOKEN_COOKIE, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: secureCookies,
        path: "/",
        maxAge: 0,
    });

    return response;
}
