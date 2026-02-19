import { connectToDatabase } from "@/lib/db/mongoose";
import { ScoringConfigModel } from "@/server/models/ScoringConfig";
import { StudentModel } from "@/server/models/Student";

export async function updateScoringWeights(
    adminId: string,
    weights: {
        academic: number;
        olympiad: number;
        projects: number;
        skills: number;
        activity: number;
        aiPotential: number;
    },
) {
    await connectToDatabase();

    const config = await ScoringConfigModel.findOneAndUpdate(
        {},
        { ...weights, updatedBy: adminId },
        { new: true, upsert: true },
    );

    return config;
}

export async function listVerificationQueue() {
    await connectToDatabase();

    const pendingStudents = await StudentModel.find({ verificationStatus: "pending" })
        .sort({ createdAt: -1 })
        .limit(200)
        .lean();

    return pendingStudents;
}
