import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UniversityModel } from "@/server/models/University";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
    try {
        await requireAuth(["admin"]);
    } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: userId } = await params;
    try {
        await connectToDatabase();
        const university = await UniversityModel.findOne({ userId }).lean();
        if (!university) return NextResponse.json({ error: "University profile not found" }, { status: 404 });
        return NextResponse.json({ data: { ...university, _id: String(university._id) } });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch university";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
