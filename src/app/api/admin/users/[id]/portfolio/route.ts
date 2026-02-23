import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db/mongoose";
import { StudentModel } from "@/server/models/Student";

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
        const student = await StudentModel.findOne({ userId }).lean();
        if (!student) return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
        return NextResponse.json({ data: { ...student, _id: String(student._id) } });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch portfolio";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
