import { NextResponse } from "next/server";
import { z } from "zod";
import { registerUser } from "@/server/services/auth.service";

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["student", "university", "investor", "admin"]),
});

function formatRegisterValidationError(error: z.ZodError) {
    const issue = error.issues[0];
    if (!issue) return "Некорректные данные регистрации";

    if (issue.path.includes("password")) {
        return "Пароль должен содержать минимум 8 символов";
    }

    if (issue.path.includes("email")) {
        return "Введите корректный email";
    }

    if (issue.path.includes("role")) {
        return "Выберите корректную роль аккаунта";
    }

    return "Проверьте корректность введенных данных";
}

export async function POST(request: Request) {
    try {
        const body = registerSchema.parse(await request.json());
        const result = await registerUser(body.email, body.password, body.role);

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
            return NextResponse.json({ error: formatRegisterValidationError(error) }, { status: 400 });
        }

        if (error instanceof Error && error.message === "User already exists") {
            return NextResponse.json({ error: "Пользователь с таким email уже существует" }, { status: 409 });
        }

        console.error("[AUTH_REGISTER_ERROR]", error instanceof Error ? error.message : error);

        return NextResponse.json(
            { error: "Не удалось зарегистрироваться. Попробуйте еще раз" },
            { status: 500 },
        );
    }
}
