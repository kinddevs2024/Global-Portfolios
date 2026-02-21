import { NextResponse } from "next/server";
import { AUTH_REFRESH_TOKEN_COOKIE, AUTH_TOKEN_COOKIE, getBackendApiUrl } from "@/lib/auth/backendAuth";

type RegisterBody = {
    email?: string;
    password?: string;
    role?: "student" | "university" | "admin";
};

function isValidEmail(value: string) {
    return /^\S+@\S+\.\S+$/.test(value);
}

async function safeReadError(response: Response, fallback: string) {
    try {
        const payload = (await response.json()) as { message?: string; error?: string };
        return payload.message ?? payload.error ?? fallback;
    } catch {
        return fallback;
    }
}

export async function POST(request: Request) {
    const backendRegisterUrl = getBackendApiUrl("/auth/register");

    try {
        const body = (await request.json()) as RegisterBody;
        const email = String(body.email ?? "").trim().toLowerCase();
        const password = String(body.password ?? "");
        const role = body.role;

        if (!email || !isValidEmail(email)) {
            return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
        }

        if (!role || !["student", "university", "admin"].includes(role)) {
            return NextResponse.json({ error: "Please select a valid account role" }, { status: 400 });
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const backendResponse = await fetch(backendRegisterUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, role }),
            cache: "no-store",
            signal: controller.signal,
        }).finally(() => clearTimeout(timeout));

        if (!backendResponse.ok) {
            const message = await safeReadError(backendResponse, "Registration failed. Please try again");
            return NextResponse.json({ error: message }, { status: backendResponse.status });
        }

        const result = (await backendResponse.json()) as {
            token: string;
            refreshToken: string;
            user: { id: string; email: string; role: "student" | "university" | "admin" };
        };

        const response = NextResponse.json({
            user: {
                id: result.user.id,
                email: result.user.email,
                role: result.user.role,
            },
        });

        response.cookies.set(AUTH_TOKEN_COOKIE, result.token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        response.cookies.set(AUTH_REFRESH_TOKEN_COOKIE, result.refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
        });

        return response;
    } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
            return NextResponse.json({ error: "Server timeout. Please try again" }, { status: 504 });
        }

        if (error instanceof TypeError) {
            console.error("[AUTH_REGISTER_BACKEND_UNREACHABLE]", {
                backendRegisterUrl,
                message: error.message,
            });

            return NextResponse.json(
                { error: "Auth backend is unavailable. Check BACKEND_API_URL and backend process" },
                { status: 502 },
            );
        }

        console.error("[AUTH_REGISTER_ERROR]", {
            backendRegisterUrl,
            error: error instanceof Error ? error.message : error,
        });

        return NextResponse.json(
            { error: "Registration failed. Please try again" },
            { status: 500 },
        );
    }
}
