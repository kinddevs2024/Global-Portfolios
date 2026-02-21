import { Schema, model, models, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
    {
        email: { type: String, required: true, unique: true, index: true },
        passwordHash: { type: String, required: true },
        role: { type: String, enum: ["student", "university", "investor", "admin"], required: true },
        verificationStatus: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
        firstName: { type: String, default: "" },
        lastName: { type: String, default: "" },
        avatarUrl: { type: String, default: "" },
        preferredLanguage: { type: String, default: "auto" },
        themeMode: { type: String, enum: ["light", "dark", "system"], default: "system" },
    },
    { timestamps: true },
);

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: string };
export const UserModel = models.User || model("User", userSchema);
