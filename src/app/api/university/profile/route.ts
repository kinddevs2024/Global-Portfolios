import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/guards";
import { getOrCreateUniversity, updateUniversityProfile } from "@/server/services/university.service";

const updateSchema = z.object({
    name: z.string().trim().optional(),
    country: z.string().trim().optional(),
    tagline: z.string().trim().optional(),
    yearEstablished: z.number().int().min(1800).max(2100).optional().nullable(),
    numberOfStudents: z.number().int().min(0).optional().nullable(),
    logoShort: z.string().trim().optional(),
    logoLong: z.string().trim().optional(),
});

export async function GET() {
    try {
        const user = await requireAuth(["university", "admin"]);
        const university = await getOrCreateUniversity(user.userId);
        return NextResponse.json({ data: university });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch profile";
        const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
        return NextResponse.json({ error: message }, { status });
    }
}

export async function PUT(request: Request) {
    try {
        const user = await requireAuth(["university", "admin"]);
        const body = updateSchema.parse(await request.json());
        const university = await updateUniversityProfile(user.userId, {
            name: body.name,
            country: body.country,
            tagline: body.tagline ?? undefined,
            yearEstablished: body.yearEstablished ?? undefined,
            numberOfStudents: body.numberOfStudents ?? undefined,
            logoShort: body.logoShort,
            logoLong: body.logoLong,
        });
        return NextResponse.json({ data: university });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Invalid profile data" }, { status: 400 });
        }
        const message = error instanceof Error ? error.message : "Failed to update profile";
        const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
        return NextResponse.json({ error: message }, { status });
    }
}
