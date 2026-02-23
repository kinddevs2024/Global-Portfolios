import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { backendAuthedFetchRaw } from "@/lib/auth/backendProxy";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
    try {
        await requireAuth(["admin"]);
    } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    try {
        const { response, payload } = await backendAuthedFetchRaw(
            `/admin/users/${id}/portfolio`,
            {},
            request
        );
        if (!response.ok) {
            return NextResponse.json(
                { error: "Portfolio not found" },
                { status: response.status }
            );
        }
        const profile = payload ?? null;
        return NextResponse.json({ data: profile });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Backend unavailable" },
            { status: 502 }
        );
    }
}
