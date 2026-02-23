import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { backendAuthedFetchRaw } from "@/lib/auth/backendProxy";

export async function GET(request: Request) {
    try {
        await requireAuth(["admin"]);
    } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { response, payload } = await backendAuthedFetchRaw(
            "/admin/users",
            {},
            request
        );
        if (!response.ok) {
            const message =
                payload && typeof payload === "object" && "message" in (payload as object)
                    ? String((payload as { message?: string }).message)
                    : "Failed to load users";
            return NextResponse.json({ error: message }, { status: response.status });
        }
        const data = payload as { items?: Array<Record<string, unknown>>; pagination?: unknown };
        const items = (data.items ?? []).map((u) => ({
            ...u,
            verificationStatus: u.isVerified ? "verified" : "pending",
        }));
        return NextResponse.json({ items, pagination: data.pagination });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Backend unavailable" },
            { status: 502 }
        );
    }
}
