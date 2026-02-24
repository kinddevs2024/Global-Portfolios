import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ConversationModel } from "@/server/models/Conversation";

export async function GET() {
    try {
        const user = await requireAuth(["student", "university", "admin"]);
        await connectToDatabase();

        const list = await ConversationModel.find({
            participants: user.userId,
        })
            .sort({ updatedAt: -1 })
            .lean();

        const items = list.map((c) => ({
            _id: (c as { _id: string })._id,
            updatedAt: (c as { updatedAt?: string }).updatedAt,
        }));

        return NextResponse.json({ items });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load conversations";
        const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
        return NextResponse.json({ error: msg }, { status });
    }
}
