import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/server/models/User";

const accountUpdateSchema = z.object({
    firstName: z.string().trim().max(80).optional(),
    lastName: z.string().trim().max(80).optional(),
    avatarUrl: z.string().trim().max(1000).optional(),
    preferredLanguage: z.string().trim().min(2).max(20).optional(),
    themeMode: z.enum(["light", "dark", "system"]).optional(),
});

type LeanUser = {
    _id: unknown;
    email?: string;
    role?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    preferredLanguage?: string;
    themeMode?: "light" | "dark" | "system";
    verificationStatus?: string;
};

function normalizeLeanUser(value: unknown): LeanUser | null {
    if (!value) return null;
    const candidate = Array.isArray(value) ? value[0] : value;
    if (!candidate || typeof candidate !== "object" || !("_id" in candidate)) {
        return null;
    }
    return candidate as LeanUser;
}

export async function GET() {
    try {
        const auth = await requireAuth();
        await connectToDatabase();

        const user = await UserModel.findById(auth.userId)
            .select("_id email role firstName lastName avatarUrl preferredLanguage themeMode verificationStatus")
            .lean();
        const normalizedUser = normalizeLeanUser(user);

        if (!normalizedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            data: {
                _id: String(normalizedUser._id),
                email: normalizedUser.email ?? "",
                role: normalizedUser.role ?? "student",
                firstName: normalizedUser.firstName ?? "",
                lastName: normalizedUser.lastName ?? "",
                avatarUrl: normalizedUser.avatarUrl ?? "",
                preferredLanguage: normalizedUser.preferredLanguage ?? "auto",
                themeMode: normalizedUser.themeMode ?? "system",
                verificationStatus: normalizedUser.verificationStatus ?? "pending",
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unauthorized";
        const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
        return NextResponse.json({ error: message }, { status });
    }
}

export async function PUT(request: Request) {
    try {
        const auth = await requireAuth();
        const payload = accountUpdateSchema.parse(await request.json());

        await connectToDatabase();
        const updated = await UserModel.findByIdAndUpdate(
            auth.userId,
            {
                ...(payload.firstName !== undefined ? { firstName: payload.firstName } : {}),
                ...(payload.lastName !== undefined ? { lastName: payload.lastName } : {}),
                ...(payload.avatarUrl !== undefined ? { avatarUrl: payload.avatarUrl } : {}),
                ...(payload.preferredLanguage !== undefined ? { preferredLanguage: payload.preferredLanguage } : {}),
                ...(payload.themeMode !== undefined ? { themeMode: payload.themeMode } : {}),
            },
            { new: true },
        )
            .select("_id email role firstName lastName avatarUrl preferredLanguage themeMode verificationStatus")
            .lean();
        const normalizedUpdated = normalizeLeanUser(updated);

        if (!normalizedUpdated) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            data: {
                _id: String(normalizedUpdated._id),
                email: normalizedUpdated.email ?? "",
                role: normalizedUpdated.role ?? "student",
                firstName: normalizedUpdated.firstName ?? "",
                lastName: normalizedUpdated.lastName ?? "",
                avatarUrl: normalizedUpdated.avatarUrl ?? "",
                preferredLanguage: normalizedUpdated.preferredLanguage ?? "auto",
                themeMode: normalizedUpdated.themeMode ?? "system",
                verificationStatus: normalizedUpdated.verificationStatus ?? "pending",
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Invalid account data" }, { status: 400 });
        }

        const message = error instanceof Error ? error.message : "Failed to update account";
        const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
        return NextResponse.json({ error: message }, { status });
    }
}
