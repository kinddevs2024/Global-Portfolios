import { NextResponse } from "next/server";
import { z } from "zod";
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
        const body = loginSchema.parse(await request.json());
        const result = await loginUser(body.email, body.password);

        const response = NextResponse.json({
            user: {
                id: result.user._id,
                email: result.user.email,
                role: result.user.role,
            },
        });

        response.cookies.set("gp_token", result.token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: formatLoginValidationError(error) }, { status: 400 });
        }

        if (error instanceof Error && error.message === "Invalid credentials") {
            return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
        }

        console.error("[AUTH_LOGIN_ERROR]", error instanceof Error ? error.message : error);

        return NextResponse.json(
            { error: "Не удалось выполнить вход. Попробуйте еще раз" },
            { status: 500 },
        );
    }
}
