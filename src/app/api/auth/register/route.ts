import { NextResponse } from "next/server";
import { AUTH_REFRESH_TOKEN_COOKIE, AUTH_TOKEN_COOKIE, getBackendApiBase, getBackendApiUrl } from "@/lib/auth/backendAuth";

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

function getBackendRegisterUrlCandidates(request: Request) {
    const normalizedConfiguredBase = getBackendApiBase().replace(/\/$/, "");
    const configuredUrl = `${normalizedConfiguredBase}/auth/register`;

    const candidates = new Set<string>([
        configuredUrl,
        "http://127.0.0.1:4000/api/auth/register",
        "http://localhost:4000/api/auth/register",
    ]);

    try {
        const hostname = new URL(request.url).hostname;
        if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
            candidates.add(`http://${hostname}:4000/api/auth/register`);
        }
    } catch {
        // ignore URL parse issues
    }

    return Array.from(candidates);
}

export async function POST(request: Request) {
    const backendRegisterUrl = getBackendApiUrl("/auth/register");
    const backendRegisterCandidates = getBackendRegisterUrlCandidates(request);

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

        let backendResponse: Response | null = null;
        let lastNetworkError: string | null = null;

        for (const candidateUrl of backendRegisterCandidates) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);

            try {
                const response = await fetch(candidateUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, role }),
                    cache: "no-store",
                    signal: controller.signal,
                });

                backendResponse = response;
                break;
            } catch (candidateError) {
                if (candidateError instanceof Error && candidateError.name === "AbortError") {
                    lastNetworkError = `Timeout while calling ${candidateUrl}`;
                } else {
                    lastNetworkError = candidateError instanceof Error ? candidateError.message : "Unknown network error";
                }
            } finally {
                clearTimeout(timeout);
            }
        }

        if (!backendResponse) {
            console.error("[AUTH_REGISTER_BACKEND_UNREACHABLE]", {
                backendRegisterCandidates,
                lastNetworkError,
            });

            return NextResponse.json(
                {
                    error: "Auth backend is unavailable. Set BACKEND_API_URL and ensure backend is running on port 4000",
                },
                { status: 502 },
            );
        }

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
                backendRegisterCandidates,
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
