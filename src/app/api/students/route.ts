import { NextResponse } from "next/server";
import { listStudents, createStudentProfile } from "@/server/services/student.service";
import type { RankingTier } from "@/types/student";

const rankingTiers: RankingTier[] = ["Bronze", "Silver", "Gold", "Platinum", "Elite"];

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const rawTier = searchParams.get("rankingTier") ?? undefined;
        const rankingTier = rawTier && rankingTiers.includes(rawTier as RankingTier)
            ? (rawTier as RankingTier)
            : undefined;

        const filters = {
            country: searchParams.get("country") ?? undefined,
            rankingTier,
            technology: searchParams.get("technology") ?? undefined,
            skill: searchParams.get("skill") ?? undefined,
            language: searchParams.get("language") ?? undefined,
            minGpa: searchParams.get("minGpa") ? Number(searchParams.get("minGpa")) : undefined,
            maxGpa: searchParams.get("maxGpa") ? Number(searchParams.get("maxGpa")) : undefined,
            minAiPotential: searchParams.get("minAiPotential")
                ? Number(searchParams.get("minAiPotential"))
                : undefined,
            hasGrant: searchParams.get("hasGrant") ? searchParams.get("hasGrant") === "true" : undefined,
        };

        const students = await listStudents(filters);
        return NextResponse.json({ data: students });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch students" },
            { status: 400 },
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as Record<string, unknown>;
        const student = await createStudentProfile(body);
        return NextResponse.json({ data: student }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to create student" },
            { status: 400 },
        );
    }
}
