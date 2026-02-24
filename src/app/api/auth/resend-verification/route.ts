import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { sendVerificationEmail } from "@/lib/email";
import { resendVerificationEmail } from "@/server/services/auth.service";

export async function POST(request: Request) {
    try {
        const auth = await requireAuth();
        const result = await resendVerificationEmail(auth.userId);

        if (result.alreadyVerified) {
            return NextResponse.json({ alreadyVerified: true, sent: false });
        }

        if (!result.sent || !result.verificationToken || !result.email) {
            return NextResponse.json({ error: "Failed to prepare verification email" }, { status: 500 });
        }

        let baseUrl: string;
        try {
            baseUrl = new URL(request.url).origin;
        } catch {
            baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3005");
        }
        await sendVerificationEmail(result.email, result.verificationToken, baseUrl);

        return NextResponse.json({ sent: true });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unauthorized";
        const status = msg === "Unauthorized" || msg === "Forbidden" ? (msg === "Forbidden" ? 403 : 401) : 500;
        return NextResponse.json({ error: msg }, { status });
    }
}
