import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel, type UserDocument } from "@/server/models/User";
import { signToken } from "@/lib/auth/jwt";
import type { UserRole } from "@/types/auth";

export async function registerUser(
    email: string,
    password: string,
    role: UserRole,
): Promise<{ user: UserDocument; token: string; verificationToken: string }> {
    await connectToDatabase();

    const existing = await UserModel.findOne({ email });
    if (existing) {
        throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const created = (await UserModel.create({
        email,
        passwordHash,
        role,
        emailVerificationToken: verificationToken,
    })) as unknown as UserDocument;

    const token = signToken({
        userId: created._id.toString(),
        role: created.role,
        email: created.email,
    });

    return { user: created, token, verificationToken };
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
    return UserModel.findById(userId).select("_id email role verificationStatus createdAt emailVerifiedAt").lean();
}

export async function resendVerificationEmail(userId: string): Promise<{
    alreadyVerified: boolean;
    sent: boolean;
    verificationToken?: string;
    email?: string;
}> {
    await connectToDatabase();
    const user = await UserModel.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    if (user.emailVerifiedAt) {
        return { alreadyVerified: true, sent: false };
    }
    const verificationToken = crypto.randomBytes(32).toString("hex");
    await UserModel.findByIdAndUpdate(userId, { emailVerificationToken: verificationToken });
    return { alreadyVerified: false, sent: true, verificationToken, email: user.email };
}
