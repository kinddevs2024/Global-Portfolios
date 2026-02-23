import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { backendAuthedFetch } from "@/lib/auth/backendProxy";

export async function GET(request: Request) {
    try {
        await requireAuth(["admin"]);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unauthorized";
        return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 401 });
    }
    return backendAuthedFetch("/admin/scoring-weights", {}, request);
}

export async function PUT(request: Request) {
    try {
        await requireAuth(["admin"]);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unauthorized";
        return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 401 });
    }
    const body = await request.json().catch(() => ({}));
    return backendAuthedFetch("/admin/scoring-weights", { method: "PUT", body }, request);
}
