import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { getUniversityDashboard } from "@/server/services/university.service";

export async function GET() {
    try {
        const user = await requireAuth(["university", "admin"]);
        const dashboard = await getUniversityDashboard(user.userId);
        return NextResponse.json({ data: dashboard });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch dashboard";
        const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
        return NextResponse.json({ error: message }, { status });
    }
}
