import { NextResponse } from "next/server";
import { z } from "zod";
import {
    AUTH_REFRESH_TOKEN_COOKIE,
    AUTH_TOKEN_COOKIE,
    getBackendApiUrl,
    parseBackendErrorMessage,
} from "@/lib/auth/backendAuth";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

function formatLoginValidationError(error: z.ZodError) {
    const issue = error.issues[0];
    if (!issue) return "Некорректные данные входа";

    if (issue.path.includes("password")) {
        return "Введите пароль";
    }

    if (issue.path.includes("email")) {
        return "Введите корректный email";
    }

    return "Проверьте корректность введенных данных";
}

export async function POST(request: Request) {
    try {
        const body = loginSchema.parse(await request.json());
        const backendResponse = await fetch(getBackendApiUrl("/auth/login"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            cache: "no-store",
        });

        if (!backendResponse.ok) {
            const message = await parseBackendErrorMessage(backendResponse, "Неверный email или пароль");
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
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: formatLoginValidationError(error) }, { status: 400 });
        }

        console.error("[AUTH_LOGIN_ERROR]", error instanceof Error ? error.message : error);

        return NextResponse.json(
            { error: "Не удалось выполнить вход. Попробуйте еще раз" },
            { status: 500 },
        );
    }
}
