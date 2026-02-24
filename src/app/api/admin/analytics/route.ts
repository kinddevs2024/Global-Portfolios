import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db/mongoose";
import { PageViewModel } from "@/server/models/PageView";
import { SessionHeartbeatModel } from "@/server/models/SessionHeartbeat";

const ONLINE_TTL_MS = 2 * 60 * 1000; // 2 minutes

export async function GET() {
    try {
        await requireAuth(["admin"]);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unauthorized";
        return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 401 });
    }
    try {
        await connectToDatabase();

        const [pageViewsAgg, onlineCount] = await Promise.all([
            PageViewModel.aggregate([
                { $group: { _id: "$path", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $project: { path: "$_id", count: 1, _id: 0 } },
            ]),
            SessionHeartbeatModel.countDocuments({
                lastSeenAt: { $gte: new Date(Date.now() - ONLINE_TTL_MS) },
            }),
        ]);

        const pageViews = pageViewsAgg.map((r: { path: string; count: number }) => ({ path: r.path, count: r.count }));

        return NextResponse.json({ pageViews, onlineNow: onlineCount });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : "Failed to load analytics" },
            { status: 500 },
        );
    }
}
