import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { backendAuthedFetchRaw } from "@/lib/auth/backendProxy";

function mapProfileToFrontend(p: {
    _id?: string;
    universityName?: string;
    country?: string;
    tagline?: string;
    yearEstablished?: number | null;
    numberOfStudents?: number | null;
    logoShort?: string;
    logoLong?: string;
    outreachMessage?: string;
    isVerified?: boolean;
}) {
    return {
        _id: p._id,
        universityInfo: {
            name: p.universityName ?? "",
            country: p.country ?? "",
            verifiedStatus: p.isVerified ?? false,
            tagline: p.tagline ?? "",
            yearEstablished: p.yearEstablished ?? null,
            numberOfStudents: p.numberOfStudents ?? null,
            logoShort: p.logoShort ?? "",
            logoLong: p.logoLong ?? "",
        },
        outreachMessage: p.outreachMessage ?? "",
    };
}

/** Map backend student item to frontend discovery shape. */
function mapStudent(s: { _id?: string; userId?: string; firstName?: string; lastName?: string; ratingScore?: number }) {
    return {
        _id: s._id,
        userId: s.userId,
        personalInfo: { firstName: s.firstName, lastName: s.lastName },
        globalScore: s.ratingScore ?? 0,
        rankingTier: undefined as string | undefined,
    };
}

export async function GET(request: Request) {
    try {
        await requireAuth(["university", "admin"]);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unauthorized";
        return NextResponse.json(
            { error: msg },
            { status: msg === "Forbidden" ? 403 : 401 }
        );
    }

    try {
        const { response: meRes, payload: mePayload } = await backendAuthedFetchRaw("/universities/me", {}, request);
        let profile = mePayload as Record<string, unknown> | null;

        if (meRes.status === 404) {
            const createRes = await backendAuthedFetchRaw(
                "/universities",
                { method: "POST", body: { universityName: "My University", country: "" } },
                request
            );
            if (!createRes.response.ok) {
                return NextResponse.json(
                    { error: "Failed to create university profile" },
                    { status: createRes.response.status }
                );
            }
            profile = createRes.payload as Record<string, unknown>;
        } else if (!meRes.ok) {
            return NextResponse.json(
                { error: profile && typeof profile === "object" && "message" in profile ? String(profile.message) : "Failed to load profile" },
                { status: meRes.status }
            );
        }

        const university = mapProfileToFrontend(profile as Parameters<typeof mapProfileToFrontend>[0]);

        const searchRes = await backendAuthedFetchRaw(
            "/students/search?limit=100&sortBy=ratingScore&sortOrder=desc",
            {},
            request
        );
        let students: ReturnType<typeof mapStudent>[] = [];
        if (searchRes.response.ok && searchRes.payload && typeof searchRes.payload === "object" && "items" in (searchRes.payload as object)) {
            const items = (searchRes.payload as { items?: unknown[] }).items ?? [];
            students = items.map((s) => mapStudent((s as Record<string, unknown>) as Parameters<typeof mapStudent>[0]));
        }

        const analytics = {
            totalCandidates: students.length,
            eliteCandidates: students.filter((s) => s.rankingTier === "Elite").length,
            averageGlobalScore:
                students.length > 0
                    ? Number((students.reduce((sum, s) => sum + (s.globalScore ?? 0), 0) / students.length).toFixed(2))
                    : 0,
        };

        return NextResponse.json({
            data: { university, students, analytics },
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Backend unavailable" },
            { status: 502 }
        );
    }
}
