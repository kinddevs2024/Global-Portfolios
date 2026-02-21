import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/server/models/User";

const passwordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
});

export async function PATCH(request: Request) {
    try {
        const auth = await requireAuth();
        const body = passwordSchema.parse(await request.json());

        await connectToDatabase();
        const user = await UserModel.findById(auth.userId).select("_id passwordHash");

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const isCurrentValid = await bcrypt.compare(body.currentPassword, user.passwordHash);
        if (!isCurrentValid) {
            return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
        }

        const newHash = await bcrypt.hash(body.newPassword, 10);
        user.passwordHash = newHash;
        await user.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
        }

        const message = error instanceof Error ? error.message : "Failed to change password";
        const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
        return NextResponse.json({ error: message }, { status });
    }
}
