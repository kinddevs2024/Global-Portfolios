import { Schema, model, models, type InferSchemaType } from "mongoose";

const universitySchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
        universityInfo: {
            name: { type: String, required: true },
            country: { type: String, required: true },
            verifiedStatus: { type: Boolean, default: false },
            tagline: { type: String, default: "" },
            yearEstablished: { type: Number, default: null },
            numberOfStudents: { type: Number, default: null },
            logoShort: { type: String, default: "" },
            logoLong: { type: String, default: "" },
        },
        programs: [{ name: String, level: String, language: String }],
        requirements: {
            minGpa: Number,
            minGlobalScore: Number,
            requiredSkills: [{ type: String }],
            preferredTechnologies: [{ type: String }],
            preferredTier: { type: String, enum: ["Bronze", "Silver", "Gold", "Platinum", "Elite"] },
        },
        rankingPreferences: {
            prioritizeAiPotential: { type: Boolean, default: true },
            prioritizeProjects: { type: Boolean, default: true },
        },
        savedStudents: [{ type: Schema.Types.ObjectId, ref: "Student" }],
        analytics: {
            profileViews: { type: Number, default: 0 },
            invitesSent: { type: Number, default: 0 },
        },
        outreachMessage: { type: String, default: "" },
    },
    { timestamps: true },
);

export type UniversityDocument = InferSchemaType<typeof universitySchema> & { _id: string };
export const UniversityModel = models.University || model("University", universitySchema);
