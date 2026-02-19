import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/guards";
import { getStudentByUserId, upsertStudentProfile } from "@/server/services/student.service";

const profileSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    country: z.string().min(1),
    age: z.number().int().min(10).max(99),
    language: z.string().min(1),
    gpa: z.number().min(0).max(4),
    examResults: z.array(z.string()).default([]),
    recommendationLetters: z.array(z.string()).default([]),
    skills: z.array(z.string()).default([]),
    technologies: z.array(z.string()).default([]),
    projectName: z.string().default("Main Project"),
    projectComplexity: z.number().min(0).max(100).default(0),
    projectUsers: z.number().min(0).default(0),
    academicScore: z.number().min(0).max(100),
    olympiadScore: z.number().min(0).max(150),
    projectScore: z.number().min(0).max(120),
    skillsScore: z.number().min(0).max(80),
    activityScore: z.number().min(0).max(50),
    aiPotentialScore: z.number().min(0).max(100),
    hasGrant: z.boolean().default(false),
});

export async function GET() {
    try {
        const user = await requireAuth(["student"]);
        const profile = await getStudentByUserId(user.userId);
        return NextResponse.json({ data: profile });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch profile";
        const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
        return NextResponse.json({ error: message }, { status });
    }
}

export async function PUT(request: Request) {
    try {
        const user = await requireAuth(["student"]);
        const body = profileSchema.parse(await request.json());
        const profile = await upsertStudentProfile(user.userId, body);
        return NextResponse.json({ data: profile });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to save profile";
        const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
        return NextResponse.json({ error: message }, { status });
    }
}
