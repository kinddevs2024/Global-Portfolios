import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { getUserById } from "@/server/services/auth.service";

export async function GET() {
    try {
        const session = await requireAuth();
        const user = await getUserById(session.userId);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ data: user });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unauthorized";
        return NextResponse.json({ error: message }, { status: 401 });
    }
}
