import { connectToDatabase } from "@/lib/db/mongoose";
import { StudentModel } from "@/server/models/Student";
import type { StudentFilters } from "@/types/student";
import { buildStudentQuery } from "@/modules/filters/studentFilters";
import { calculateGlobalScore } from "@/modules/scoring/engine";
import mongoose from "mongoose";

export async function listStudents(filters: StudentFilters = {}) {
    await connectToDatabase();
    const query = buildStudentQuery(filters);
    return StudentModel.find(query).sort({ globalScore: -1 }).lean();
}

export async function getStudentById(studentId: string) {
    await connectToDatabase();
    return StudentModel.findById(studentId).lean();
}

export async function createStudentProfile(payload: Record<string, unknown>) {
    await connectToDatabase();

    const scoreResult = calculateGlobalScore({
        academic: Number(payload.academicScore ?? 0),
        olympiad: Number(payload.olympiadScore ?? 0),
        projects: Number(payload.projectScore ?? 0),
        skills: Number(payload.skillsScore ?? 0),
        activity: Number(payload.activityScore ?? 0),
        aiPotential: Number(payload.aiPotentialScore ?? 0),
    });

    const student = await StudentModel.create({
        ...payload,
        globalScore: scoreResult.globalScore,
        rankingTier: scoreResult.rankingTier,
    });

    return student;
}

export async function getStudentByUserId(userId: string) {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return null;
    }

    return StudentModel.findOne({ userId }).lean();
}

type ProfileInput = {
    firstName: string;
    lastName: string;
    country: string;
    age: number;
    language: string;
    gpa: number;
    examResults: string[];
    recommendationLetters: string[];
    skills: string[];
    technologies: string[];
    projectName: string;
    projectComplexity: number;
    projectUsers: number;
    academicScore: number;
    olympiadScore: number;
    projectScore: number;
    skillsScore: number;
    activityScore: number;
    aiPotentialScore: number;
    hasGrant: boolean;
    portfolioData?: Record<string, unknown>;
};

export async function upsertStudentProfile(userId: string, input: ProfileInput) {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user id");
    }

    const scoreResult = calculateGlobalScore({
        academic: input.academicScore,
        olympiad: input.olympiadScore,
        projects: input.projectScore,
        skills: input.skillsScore,
        activity: input.activityScore,
        aiPotential: input.aiPotentialScore,
    });

    const update = {
        userId,
        personalInfo: {
            firstName: input.firstName,
            lastName: input.lastName,
            country: input.country,
            age: input.age,
            language: input.language,
        },
        academicInfo: {
            gpa: input.gpa,
            examResults: input.examResults,
            recommendationLetters: input.recommendationLetters,
        },
        olympiads: [],
        projects: [
            {
                name: input.projectName || "Main Project",
                technologies: input.technologies,
                complexity: input.projectComplexity,
                users: input.projectUsers,
            },
        ],
        skills: input.skills.map((name) => ({ name, verified: false })),
        certificates: [],
        globalScore: scoreResult.globalScore,
        rankingTier: scoreResult.rankingTier,
        aiAnalysis: {
            growthTrajectory: input.aiPotentialScore,
            consistency: Math.max(0, Math.min(100, input.activityScore + 20)),
            fraudRisk: 5,
            recommendation: "Keep improving project depth and consistency.",
        },
        verificationStatus: "pending",
        portfolioVisibility: "public",
        activityMetrics: {
            profileUpdates: 1,
            publications: 0,
            engagementScore: input.activityScore,
        },
        portfolioData: input.portfolioData ?? null,
        hasGrant: input.hasGrant,
    };

    const student = await StudentModel.findOneAndUpdate({ userId }, update, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
    }).lean();

    return student;
}
