import { NextResponse } from "next/server";
import { AUTH_REFRESH_TOKEN_COOKIE, AUTH_TOKEN_COOKIE } from "@/lib/auth/backendAuth";

export async function POST() {
    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_TOKEN_COOKIE, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
    });

    response.cookies.set(AUTH_REFRESH_TOKEN_COOKIE, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
    });

    return response;
}
