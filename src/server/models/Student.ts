import { Schema, model, models, type InferSchemaType } from "mongoose";

const studentSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
        personalInfo: {
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            country: { type: String, required: true, index: true },
            age: { type: Number, required: true },
            language: { type: String, required: true },
        },
        academicInfo: {
            gpa: { type: Number, required: true, index: true },
            examResults: [{ type: String }],
            recommendationLetters: [{ type: String }],
        },
        olympiads: [
            {
                level: {
                    type: String,
                    enum: ["school", "regional", "national", "international"],
                    required: true,
                },
                place: { type: Number, required: true },
                verified: { type: Boolean, default: false },
            },
        ],
        projects: [
            {
                name: { type: String, required: true },
                technologies: [{ type: String }],
                complexity: { type: Number, default: 0 },
                users: { type: Number, default: 0 },
            },
        ],
        skills: [{ name: { type: String }, verified: { type: Boolean, default: false } }],
        certificates: [{ name: String, issuer: String, verified: { type: Boolean, default: false } }],
        globalScore: { type: Number, default: 0, index: true },
        rankingTier: {
            type: String,
            enum: ["Bronze", "Silver", "Gold", "Platinum", "Elite"],
            default: "Bronze",
            index: true,
        },
        aiAnalysis: {
            growthTrajectory: { type: Number, default: 0 },
            consistency: { type: Number, default: 0 },
            fraudRisk: { type: Number, default: 0 },
            recommendation: { type: String, default: "" },
        },
        verificationStatus: {
            type: String,
            enum: ["pending", "verified", "rejected"],
            default: "pending",
            index: true,
        },
        portfolioVisibility: { type: String, enum: ["public", "private"], default: "public" },
        activityMetrics: {
            profileUpdates: { type: Number, default: 0 },
            publications: { type: Number, default: 0 },
            engagementScore: { type: Number, default: 0 },
        },
        portfolioData: { type: Schema.Types.Mixed, default: null },
        hasGrant: { type: Boolean, default: false, index: true },
    },
    { timestamps: true },
);

studentSchema.index({ globalScore: -1, "academicInfo.gpa": -1, rankingTier: 1 });
studentSchema.index({ "projects.technologies": 1 });
studentSchema.index({ "skills.name": 1 });

export type StudentDocument = InferSchemaType<typeof studentSchema> & { _id: string };
export const StudentModel = models.Student || model("Student", studentSchema);
