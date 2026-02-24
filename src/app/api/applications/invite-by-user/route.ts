import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAuth } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ApplicationModel } from "@/server/models/Application";

export async function POST(request: Request) {
    try {
        const user = await requireAuth(["university", "admin"]);
        const body = (await request.json().catch(() => ({}))) as { targetUserId?: string; message?: string };
        const targetUserId = body.targetUserId;
        if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
            return NextResponse.json({ error: "Invalid target user" }, { status: 400 });
        }

        await connectToDatabase();

        const existing = await ApplicationModel.findOne({
            fromUserId: user.userId,
            toUserId: targetUserId,
            initiatedBy: "university",
        });
        if (existing) {
            return NextResponse.json({ message: "Invite already sent", _id: existing._id }, { status: 200 });
        }

        const app = await ApplicationModel.create({
            fromUserId: user.userId,
            toUserId: targetUserId,
            status: "pending",
            message: body.message ?? "",
            initiatedBy: "university",
        });

        return NextResponse.json({ _id: app._id, message: "Invite sent" });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to send invite";
        const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
        return NextResponse.json({ error: msg }, { status });
    }
}
