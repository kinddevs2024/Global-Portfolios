import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/server/models/User";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
    try {
        await requireAuth(["admin"]);
    } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    try {
        await connectToDatabase();
        const user = await UserModel.findById(id).select("-passwordHash -emailVerificationToken").lean() as { _id: unknown; [key: string]: unknown } | null;
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
        return NextResponse.json({ data: { ...user, _id: String(user._id) } });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch user";
        return NextResponse.json({ error: message }, { status: 500 });
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
    if (!role || !["student", "university", "investor", "admin"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    try {
        await connectToDatabase();
        const user = await UserModel.findByIdAndUpdate(id, { role }, { new: true })
            .select("-passwordHash -emailVerificationToken")
            .lean() as { _id: unknown; [key: string]: unknown } | null;
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
        return NextResponse.json({ data: { ...user, _id: String(user._id) } });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update user";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(_request: Request, { params }: Params) {
    try {
        await requireAuth(["admin"]);
    } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    try {
        await connectToDatabase();
        const user = await UserModel.findByIdAndDelete(id);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
        return NextResponse.json({ ok: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete user";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
