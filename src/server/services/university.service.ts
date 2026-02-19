import { connectToDatabase } from "@/lib/db/mongoose";
import { UniversityModel } from "@/server/models/University";
import { StudentModel } from "@/server/models/Student";

export async function getUniversityDashboard(universityId: string) {
    await connectToDatabase();

    const university = (await UniversityModel.findById(universityId).lean()) as {
        requirements?: {
            minGpa?: number;
            preferredTier?: "Bronze" | "Silver" | "Gold" | "Platinum" | "Elite";
        };
    } | null;
    if (!university) {
        throw new Error("University not found");
    }

    const filters: Record<string, unknown> = {};
    if (university.requirements?.minGpa) {
        filters["academicInfo.gpa"] = { $gte: university.requirements.minGpa };
    }
    if (university.requirements?.preferredTier) {
        filters.rankingTier = university.requirements.preferredTier;
    }

    const students = await StudentModel.find(filters)
        .sort({ globalScore: -1, "aiAnalysis.growthTrajectory": -1 })
        .limit(100)
        .lean();

    return {
        university,
        students,
        analytics: {
            totalCandidates: students.length,
            eliteCandidates: students.filter((student) => student.rankingTier === "Elite").length,
            averageGlobalScore:
                students.length > 0
                    ? Number((students.reduce((sum, student) => sum + student.globalScore, 0) / students.length).toFixed(2))
                    : 0,
        },
    };
}
