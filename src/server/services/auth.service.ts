import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/server/models/User";
import { signToken } from "@/lib/auth/jwt";
import type { UserRole } from "@/types/auth";

export async function registerUser(email: string, password: string, role: UserRole) {
    await connectToDatabase();

    const existing = await UserModel.findOne({ email });
    if (existing) {
        throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await UserModel.create({ email, passwordHash, role });

    const token = signToken({
        userId: created._id.toString(),
        role: created.role,
        email: created.email,
    });

    return { user: created, token };
}

export async function loginUser(email: string, password: string) {
    await connectToDatabase();

    const user = await UserModel.findOne({ email });
    if (!user) {
        throw new Error("Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
        throw new Error("Invalid credentials");
    }

    const token = signToken({
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
    });

    return { user, token };
}

export async function getUserById(userId: string) {
    await connectToDatabase();
    return UserModel.findById(userId).select("_id email role verificationStatus createdAt").lean();
}
