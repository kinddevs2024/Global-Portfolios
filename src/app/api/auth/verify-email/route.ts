import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/server/models/User";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token || token.length < 32) {
        return NextResponse.json({ error: "Invalid or missing verification token" }, { status: 400 });
    }

    try {
        await connectToDatabase();

        const user = await UserModel.findOne({
            emailVerificationToken: token,
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid or expired verification link" }, { status: 400 });
        }

        user.emailVerificationToken = null;
        user.emailVerifiedAt = new Date();
        user.verificationStatus = "verified";
        await user.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[VERIFY_EMAIL_ERROR]", error);
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }
}
