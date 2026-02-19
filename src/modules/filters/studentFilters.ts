import type { FilterQuery } from "mongoose";
import type { StudentFilters } from "@/types/student";
import type { StudentDocument } from "@/server/models/Student";

export function buildStudentQuery(filters: StudentFilters): FilterQuery<StudentDocument> {
    const query: FilterQuery<StudentDocument> = {};

    if (filters.country) query["personalInfo.country"] = filters.country;
    if (filters.minAge || filters.maxAge) {
        query["personalInfo.age"] = {};
        if (filters.minAge) query["personalInfo.age"].$gte = filters.minAge;
        if (filters.maxAge) query["personalInfo.age"].$lte = filters.maxAge;
    }

    if (filters.minGpa || filters.maxGpa) {
        query["academicInfo.gpa"] = {};
        if (filters.minGpa) query["academicInfo.gpa"].$gte = filters.minGpa;
        if (filters.maxGpa) query["academicInfo.gpa"].$lte = filters.maxGpa;
    }

    if (filters.rankingTier) query.rankingTier = filters.rankingTier;
    if (filters.minAiPotential) query["aiAnalysis.growthTrajectory"] = { $gte: filters.minAiPotential };
    if (filters.skill) query["skills.name"] = filters.skill;
    if (filters.technology) query["projects.technologies"] = filters.technology;
    if (filters.language) query["personalInfo.language"] = filters.language;
    if (filters.hasGrant !== undefined) query.hasGrant = filters.hasGrant;

    return query;
}
