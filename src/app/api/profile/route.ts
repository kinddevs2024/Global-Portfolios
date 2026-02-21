import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/guards";
import { getStudentByUserId, upsertStudentProfile } from "@/server/services/student.service";
import {
    AUTH_TOKEN_COOKIE,
    fetchBackendWithFallback,
    parseBackendErrorMessage,
} from "@/lib/auth/backendAuth";

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

async function syncBackendStudentProfile(body: z.infer<typeof profileSchema>, request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

    if (!token) {
        throw new Error("Unauthorized");
    }

    const backendPayload = {
        firstName: body.firstName,
        lastName: body.lastName,
        country: body.country,
        GPA: body.gpa,
        skills: body.skills,
        languages: [body.language],
        education: body.examResults,
        internships: body.recommendationLetters,
        projects: [body.projectName],
        awards: [],
        motivationText: "",
        videoPresentationLink: "",
        visibilitySettings: {
            GPAVisible: true,
            certificationsVisible: true,
            internshipsVisible: true,
            projectsVisible: true,
            awardsVisible: true,
        },
    };

    const { response } = await fetchBackendWithFallback(
        "/students",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(backendPayload),
            cache: "no-store",
        },
        request,
    );

    if (response.status === 409) {
        return;
    }

    if (!response.ok) {
        const message = await parseBackendErrorMessage(response, "Failed to sync backend student profile");
        throw new Error(message);
    }
}

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

        try {
            await syncBackendStudentProfile(body, request);
        } catch (syncError) {
            console.warn("[PROFILE_BACKEND_SYNC_WARNING]", syncError instanceof Error ? syncError.message : syncError);
        }

        return NextResponse.json({ data: profile });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to save profile";
        const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
        return NextResponse.json({ error: message }, { status });
    }
}
