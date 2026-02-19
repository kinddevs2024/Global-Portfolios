import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/guards";
import { updateScoringWeights } from "@/server/services/admin.service";

const weightsSchema = z.object({
    academic: z.number().min(0),
    olympiad: z.number().min(0),
    projects: z.number().min(0),
    skills: z.number().min(0),
    activity: z.number().min(0),
    aiPotential: z.number().min(0),
});

export async function PUT(request: Request) {
    try {
        const user = await requireAuth(["admin"]);
        const body = weightsSchema.parse(await request.json());

        const config = await updateScoringWeights(user.userId, body);
        return NextResponse.json({ data: config });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update weights";
        const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
        return NextResponse.json({ error: message }, { status });
    }
}
