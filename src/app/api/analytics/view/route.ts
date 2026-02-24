import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db/mongoose";
import { PageViewModel } from "@/server/models/PageView";
import { SessionHeartbeatModel } from "@/server/models/SessionHeartbeat";
import { verifyToken } from "@/lib/auth/jwt";

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as { path?: string; sessionId?: string };
        const path = typeof body.path === "string" && body.path.length > 0 ? body.path : "/";
        const sessionId = typeof body.sessionId === "string" && body.sessionId.length > 0 ? body.sessionId : null;

        await connectToDatabase();

        let userId: string | null = null;
        try {
            const cookieStore = await cookies();
            const token = cookieStore.get("gp_token")?.value;
            if (token) {
                const payload = verifyToken(token);
                userId = payload.userId;
            }
        } catch {
            // unauthenticated view
        }

        const sid = sessionId ?? `anon-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

        await PageViewModel.create({
            path,
            sessionId: sid,
            userId: userId || undefined,
        });

        await SessionHeartbeatModel.findOneAndUpdate(
            { sessionId: sid },
            { $set: { sessionId: sid, userId: userId || undefined, lastSeenAt: new Date() } },
            { upsert: true, new: true },
        );

        return NextResponse.json({ ok: true, sessionId: sid });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : "Failed to record view" },
            { status: 500 },
        );
    }
}
