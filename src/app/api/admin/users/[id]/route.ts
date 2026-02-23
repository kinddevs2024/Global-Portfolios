import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { backendAuthedFetchRaw } from "@/lib/auth/backendProxy";

function mapUser(u: Record<string, unknown>) {
    return {
        ...u,
        verificationStatus: u.isVerified ? "verified" : "pending",
    };
}

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
            `/admin/users/${id}`,
            {},
            request
        );
        if (!response.ok) {
            const message =
                payload && typeof payload === "object" && "message" in (payload as object)
                    ? String((payload as { message?: string }).message)
                    : "User not found";
            return NextResponse.json({ error: message }, { status: response.status });
        }
        const data = mapUser((payload as Record<string, unknown>) || {});
        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Backend unavailable" },
            { status: 502 }
        );
    }
}

export async function PATCH(request: Request, { params }: Params) {
    try {
        await requireAuth(["admin"]);
    } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const body = (await request.json()) as { role?: string };
    const role = body.role;
    if (!role || !["student", "university", "admin"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    try {
        const { response, payload } = await backendAuthedFetchRaw(
            `/admin/users/${id}`,
            { method: "PATCH", body: { role } },
            request
        );
        if (!response.ok) {
            const message =
                payload && typeof payload === "object" && "message" in (payload as object)
                    ? String((payload as { message?: string }).message)
                    : "Update failed";
            return NextResponse.json({ error: message }, { status: response.status });
        }
        const data = mapUser((payload as Record<string, unknown>) || {});
        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Backend unavailable" },
            { status: 502 }
        );
    }
}

export async function DELETE(request: Request, { params }: Params) {
    try {
        await requireAuth(["admin"]);
    } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    try {
        const { response, payload } = await backendAuthedFetchRaw(
            `/admin/users/${id}`,
            { method: "DELETE" },
            request
        );
        if (!response.ok) {
            const message =
                payload && typeof payload === "object" && "message" in (payload as object)
                    ? String((payload as { message?: string }).message)
                    : "Delete failed";
            return NextResponse.json({ error: message }, { status: response.status });
        }
        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Backend unavailable" },
            { status: 502 }
        );
    }
}
