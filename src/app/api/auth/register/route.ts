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
    try {
        const body = (await request.json()) as RegisterBody;
        const email = String(body.email ?? "").trim().toLowerCase();
        const password = String(body.password ?? "");
        const role = body.role;

        if (!email || !isValidEmail(email)) {
            return NextResponse.json({ error: "Введите корректный email" }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: "Пароль должен содержать минимум 8 символов" }, { status: 400 });
        }

        if (!role || !["student", "university", "admin"].includes(role)) {
            return NextResponse.json({ error: "Выберите корректную роль аккаунта" }, { status: 400 });
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const backendResponse = await fetch(getBackendApiUrl("/auth/register"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, role }),
            cache: "no-store",
            signal: controller.signal,
        }).finally(() => clearTimeout(timeout));

        if (!backendResponse.ok) {
            const message = await safeReadError(backendResponse, "Не удалось зарегистрироваться. Попробуйте еще раз");
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
            return NextResponse.json({ error: "Сервер долго отвечает. Попробуйте еще раз" }, { status: 504 });
        }

        console.error("[AUTH_REGISTER_ERROR]", error instanceof Error ? error.message : error);

        return NextResponse.json(
            { error: "Не удалось зарегистрироваться. Попробуйте еще раз" },
            { status: 500 },
        );
    }
}
