import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { listStudents } from "@/server/services/student.service";
import type { RankingTier } from "@/types/student";

const rankingTiers: RankingTier[] = ["Bronze", "Silver", "Gold", "Platinum", "Elite"];

export async function GET(request: Request) {
    try {
        await requireAuth(["investor", "university", "admin"]);

        const { searchParams } = new URL(request.url);
        const rawTier = searchParams.get("rankingTier") ?? undefined;
        const rankingTier = rawTier && rankingTiers.includes(rawTier as RankingTier)
            ? (rawTier as RankingTier)
            : undefined;

        const students = await listStudents({
            country: searchParams.get("country") ?? undefined,
            technology: searchParams.get("technology") ?? undefined,
            skill: searchParams.get("skill") ?? undefined,
            minGpa: searchParams.get("minGpa") ? Number(searchParams.get("minGpa")) : undefined,
            minAiPotential: searchParams.get("minAiPotential")
                ? Number(searchParams.get("minAiPotential"))
                : undefined,
            rankingTier,
        });

        return NextResponse.json({ data: students });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load candidates";
        const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
        return NextResponse.json({ error: message }, { status });
    }
}
