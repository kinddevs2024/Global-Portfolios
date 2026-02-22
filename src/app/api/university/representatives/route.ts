import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/guards";
import { listRepresentatives, addRepresentative } from "@/server/services/university.service";

const addSchema = z.object({
    email: z.string().email(),
    name: z.string().trim().optional(),
});

export async function GET() {
    try {
        const user = await requireAuth(["university", "admin"]);
        const reps = await listRepresentatives(user.userId);
        return NextResponse.json({ data: reps });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch representatives";
        const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
        return NextResponse.json({ error: message }, { status });
    }
}

export async function POST(request: Request) {
    try {
        const user = await requireAuth(["university", "admin"]);
        const body = addSchema.parse(await request.json());
        const rep = await addRepresentative(user.userId, body.email, body.name);
        return NextResponse.json({ data: rep });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Invalid email" }, { status: 400 });
        }
        const message = error instanceof Error ? error.message : "Failed to add representative";
        const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : message === "Representative already invited" ? 409 : 400;
        return NextResponse.json({ error: message }, { status });
    }
}
