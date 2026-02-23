import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/guards";
import { backendAuthedFetchRaw } from "@/lib/auth/backendProxy";

/** Map backend UniversityProfile to frontend shape (universityInfo.name etc.). */
function mapProfileToFrontend(p: {
    _id?: string;
    universityName?: string;
    country?: string;
    description?: string;
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

const updateSchema = z.object({
    name: z.string().trim().optional(),
    country: z.string().trim().optional(),
    tagline: z.string().trim().optional(),
    yearEstablished: z.number().int().min(1800).max(2100).optional().nullable(),
    numberOfStudents: z.number().int().min(0).optional().nullable(),
    logoShort: z.string().trim().optional(),
    logoLong: z.string().trim().optional(),
    outreachMessage: z.string().trim().max(5000).optional(),
});

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
        const { response, payload } = await backendAuthedFetchRaw("/universities/me", {}, request);
        let profile = payload as Record<string, unknown> | null;

        if (response.status === 404) {
            const createRes = await backendAuthedFetchRaw(
                "/universities",
                {
                    method: "POST",
                    body: { universityName: "My University", country: "" },
                },
                request
            );
            if (!createRes.response.ok) {
                const message =
                    createRes.payload && typeof createRes.payload === "object" && "message" in (createRes.payload as object)
                        ? String((createRes.payload as { message?: string }).message)
                        : "Failed to create profile";
                return NextResponse.json({ error: message }, { status: createRes.response.status });
            }
            profile = createRes.payload as Record<string, unknown>;
        } else if (!response.ok) {
            const message =
                profile && typeof profile === "object" && "message" in profile
                    ? String(profile.message)
                    : "Failed to fetch profile";
            return NextResponse.json({ error: message }, { status: response.status });
        }

        const data = mapProfileToFrontend(profile as Parameters<typeof mapProfileToFrontend>[0]);
        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Backend unavailable" },
            { status: 502 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        await requireAuth(["university", "admin"]);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unauthorized";
        return NextResponse.json(
            { error: msg },
            { status: msg === "Forbidden" ? 403 : 401 }
        );
    }

    let body: z.infer<typeof updateSchema>;
    try {
        body = updateSchema.parse(await request.json());
    } catch {
        return NextResponse.json({ error: "Invalid profile data" }, { status: 400 });
    }

    try {
        const { response: meRes, payload: mePayload } = await backendAuthedFetchRaw("/universities/me", {}, request);
        let profileId: string | null = null;
        if (meRes.ok && mePayload && typeof mePayload === "object" && "_id" in mePayload) {
            profileId = String((mePayload as { _id: string })._id);
        }
        if (!profileId) {
            const createRes = await backendAuthedFetchRaw(
                "/universities",
                { method: "POST", body: { universityName: "My University", country: "" } },
                request
            );
            if (!createRes.response.ok) {
                return NextResponse.json(
                    { error: "University profile not found" },
                    { status: 404 }
                );
            }
            const created = createRes.payload as { _id?: string };
            profileId = created._id ? String(created._id) : null;
        }
        if (!profileId) {
            return NextResponse.json({ error: "Profile ID missing" }, { status: 500 });
        }

        const backendBody: Record<string, unknown> = {};
        if (body.name !== undefined) backendBody.universityName = body.name;
        if (body.country !== undefined) backendBody.country = body.country;
        if (body.tagline !== undefined) backendBody.tagline = body.tagline;
        if (body.yearEstablished !== undefined) backendBody.yearEstablished = body.yearEstablished;
        if (body.numberOfStudents !== undefined) backendBody.numberOfStudents = body.numberOfStudents;
        if (body.logoShort !== undefined) backendBody.logoShort = body.logoShort;
        if (body.logoLong !== undefined) backendBody.logoLong = body.logoLong;
        if (body.outreachMessage !== undefined) backendBody.outreachMessage = body.outreachMessage;

        const { response: putRes, payload: putPayload } = await backendAuthedFetchRaw(
            `/universities/${profileId}`,
            { method: "PUT", body: backendBody },
            request
        );
        if (!putRes.ok) {
            const message =
                putPayload && typeof putPayload === "object" && "message" in (putPayload as object)
                    ? String((putPayload as { message?: string }).message)
                    : "Failed to update profile";
            return NextResponse.json({ error: message }, { status: putRes.status });
        }
        const data = mapProfileToFrontend((putPayload as Record<string, unknown>) as Parameters<typeof mapProfileToFrontend>[0]);
        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Backend unavailable" },
            { status: 502 }
        );
    }
}
