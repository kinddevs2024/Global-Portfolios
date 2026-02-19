import { NextResponse } from "next/server";
import { getStudentById } from "@/server/services/student.service";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const student = await getStudentById(params.id);

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        return NextResponse.json({ data: student });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch student" },
            { status: 400 },
        );
    }
}
