import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ConversationModel } from "@/server/models/Conversation";
import { MessageModel } from "@/server/models/Message";

type Params = { params: Promise<{ conversationId: string }> };

export async function GET(request: Request, { params }: Params) {
    try {
        const user = await requireAuth(["student", "university", "admin"]);
        const { conversationId } = await params;

        await connectToDatabase();
        const conv = await ConversationModel.findById(conversationId).lean();
        if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

        const participants = (conv as { participants?: unknown[] }).participants ?? [];
        if (!participants.some((p) => String(p) === user.userId)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const messages = await MessageModel.find({ conversationId })
            .sort({ createdAt: 1 })
            .lean();

        return NextResponse.json({ items: messages });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load messages";
        const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
        return NextResponse.json({ error: msg }, { status });
    }
}

export async function POST(request: Request, { params }: Params) {
    try {
        const user = await requireAuth(["student", "university", "admin"]);
        const { conversationId } = await params;
        const body = (await request.json().catch(() => ({}))) as { text?: string };
        const text = String(body.text ?? "").trim();
        if (!text) return NextResponse.json({ error: "Message text required" }, { status: 400 });

        await connectToDatabase();
        const conv = await ConversationModel.findById(conversationId).lean();
        if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

        const participants = (conv as { participants?: unknown[] }).participants ?? [];
        if (!participants.some((p) => String(p) === user.userId)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const message = await MessageModel.create({
            conversationId,
            senderId: user.userId,
            text,
        });

        return NextResponse.json({ _id: message._id, text: message.text, createdAt: message.createdAt });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to send message";
        const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
        return NextResponse.json({ error: msg }, { status });
    }
}
