import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAuth } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ConversationModel } from "@/server/models/Conversation";

export async function POST(request: Request) {
    try {
        const user = await requireAuth(["student", "university", "admin"]);
        const body = (await request.json().catch(() => ({}))) as { participantUserId?: string };
        const participantUserId = body.participantUserId;
        if (!participantUserId || !mongoose.Types.ObjectId.isValid(participantUserId)) {
            return NextResponse.json({ error: "Invalid participant" }, { status: 400 });
        }

        const uid = user.userId;
        const pid = participantUserId;
        const sorted = [uid, pid].sort();

        await connectToDatabase();

        let conv = await ConversationModel.findOne({
            participants: { $all: sorted, $size: 2 },
        }).lean();

        if (!conv) {
            const created = await ConversationModel.create({
                participants: sorted,
            });
            conv = created.toObject ? created.toObject() : (created as unknown as { _id: string });
        }

        return NextResponse.json({ _id: (conv as { _id: string })._id });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to start chat";
        const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
        return NextResponse.json({ error: msg }, { status });
    }
}
