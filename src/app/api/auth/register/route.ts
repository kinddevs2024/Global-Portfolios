import { NextResponse } from "next/server";
import { AUTH_TOKEN_COOKIE, shouldUseSecureAuthCookies } from "@/lib/auth/backendAuth";
import { sendVerificationEmail } from "@/lib/email";
import { registerUser } from "@/server/services/auth.service";

type RegisterBody = {
    email?: string;
    password?: string;
    role?: "student" | "university" | "admin";
};

const PUBLIC_ROLES = ["student", "university"] as const;

function isValidEmail(value: string) {
    return /^\S+@\S+\.\S+$/.test(value);
}

export async function POST(request: Request) {
    const secureCookies = shouldUseSecureAuthCookies(request);

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

        if (!role || !PUBLIC_ROLES.includes(role as (typeof PUBLIC_ROLES)[number])) {
            return NextResponse.json({ error: "Please select Student or University" }, { status: 400 });
        }

        const { user, token, verificationToken } = await registerUser(email, password, role);

        let baseUrl: string;
        try {
            baseUrl = new URL(request.url).origin;
        } catch {
            baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3005");
        }
        await sendVerificationEmail(email, verificationToken, baseUrl);

        const response = NextResponse.json({
            user: {
                id: String(user._id),
                email: user.email,
                role: user.role,
            },
            requiresVerification: true,
        });

        response.cookies.set(AUTH_TOKEN_COOKIE, token, {
            httpOnly: true,
            sameSite: "lax",
            secure: secureCookies,
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;
    } catch (error) {
        const message = error instanceof Error ? error.message : "Registration failed";
        const status = message === "User already exists" ? 409 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}
