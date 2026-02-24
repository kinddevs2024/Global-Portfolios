import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ScoringConfigModel } from "@/server/models/ScoringConfig";
import { updateScoringWeights } from "@/server/services/admin.service";

const weightsSchema = z.object({
    academic: z.number().min(0),
    olympiad: z.number().min(0),
    projects: z.number().min(0),
    skills: z.number().min(0),
    activity: z.number().min(0),
    aiPotential: z.number().min(0),
});

export async function GET() {
    try {
        await requireAuth(["admin"]);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unauthorized";
        return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 401 });
    }
    try {
        await connectToDatabase();
        const config = await ScoringConfigModel.findOne().lean();
        const weights = config
            ? {
                academic: config.academic ?? 1,
                olympiad: config.olympiad ?? 1,
                projects: config.projects ?? 1,
                skills: config.skills ?? 1,
                activity: config.activity ?? 1,
                aiPotential: config.aiPotential ?? 1,
            }
            : { academic: 1, olympiad: 1, projects: 1, skills: 1, activity: 1, aiPotential: 1 };
        return NextResponse.json({ weights });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to load weights" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const user = await requireAuth(["admin"]);
        const body = weightsSchema.parse(await request.json());
        const config = await updateScoringWeights(user.userId, body);
        return NextResponse.json({ data: config });
    } catch (e) {
        if (e instanceof z.ZodError) {
            return NextResponse.json({ error: "Invalid weights" }, { status: 400 });
        }
        const msg = e instanceof Error ? e.message : "Failed to update weights";
        const status = msg === "Forbidden" ? 403 : 401;
        return NextResponse.json({ error: msg }, { status });
    }
}
