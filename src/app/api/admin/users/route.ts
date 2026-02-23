import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/server/models/User";

export async function GET() {
    try {
        await requireAuth(["admin"]);
    } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        await connectToDatabase();
        const users = await UserModel.find({})
            .select("email role verificationStatus createdAt emailVerifiedAt")
            .sort({ createdAt: -1 })
            .lean();

        const list = users.map((u) => ({
            _id: String(u._id),
            email: u.email,
            role: u.role,
            verificationStatus: u.verificationStatus,
            createdAt: u.createdAt,
            emailVerifiedAt: u.emailVerifiedAt,
        }));

        return NextResponse.json({ items: list });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to list users";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
