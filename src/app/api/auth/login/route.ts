import { NextResponse } from "next/server";
import { z } from "zod";
import {
    AUTH_REFRESH_TOKEN_COOKIE,
    AUTH_TOKEN_COOKIE,
    getBackendApiUrl,
    parseBackendErrorMessage,
    shouldUseSecureAuthCookies,
} from "@/lib/auth/backendAuth";
import { loginUser } from "@/server/services/auth.service";

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
        const secureCookies = shouldUseSecureAuthCookies(request);
        const body = loginSchema.parse(await request.json());
        let backendResponse: Response;

        try {
            backendResponse = await fetch(getBackendApiUrl("/auth/login"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                cache: "no-store",
            });
        } catch (networkError) {
            if (!(networkError instanceof TypeError)) {
                throw networkError;
            }

            // Fallback: local DB login only. Never create a user here — login is login, not register.
            const { user, token } = await loginUser(body.email, body.password);
            const fallbackResponse = NextResponse.json({
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    role: user.role,
                },
            });

            fallbackResponse.cookies.set(AUTH_TOKEN_COOKIE, token, {
                httpOnly: true,
                sameSite: "lax",
                secure: secureCookies,
                path: "/",
                maxAge: 60 * 60 * 24 * 7,
            });

            fallbackResponse.cookies.set(AUTH_REFRESH_TOKEN_COOKIE, "", {
                httpOnly: true,
                sameSite: "lax",
                secure: secureCookies,
                path: "/",
                maxAge: 0,
            });

            return fallbackResponse;
        }

        if (!backendResponse.ok) {
            const message = await parseBackendErrorMessage(backendResponse, "Неверный email или пароль");
            const err = message.toLowerCase();
            const hint = (backendResponse.status === 401 && (err.includes("invalid") || err.includes("credentials")))
                ? " Если вы ещё не регистрировались, перейдите в Регистрация."
                : "";
            return NextResponse.json({ error: message + hint }, { status: backendResponse.status });
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
            secure: secureCookies,
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        response.cookies.set(AUTH_REFRESH_TOKEN_COOKIE, result.refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: secureCookies,
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
        });

        return response;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: formatLoginValidationError(error) }, { status: 400 });
        }

        if (error instanceof Error && error.message === "Invalid credentials") {
            return NextResponse.json({
                error: "Неверный email или пароль. Если вы ещё не регистрировались, перейдите в Регистрация.",
            }, { status: 401 });
        }

        if (error instanceof Error && error.message.startsWith("Please verify your email")) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }

        console.error("[AUTH_LOGIN_ERROR]", error instanceof Error ? error.message : error);

        return NextResponse.json(
            { error: "Не удалось выполнить вход. Попробуйте еще раз" },
            { status: 500 },
        );
    }
}
