import { connectToDatabase } from "@/lib/db/mongoose";
import { UniversityModel } from "@/server/models/University";
import { StudentModel } from "@/server/models/Student";
import { UniversityRepresentativeModel } from "@/server/models/UniversityRepresentative";

export async function getOrCreateUniversity(userId: string) {
    await connectToDatabase();
    let university = await UniversityModel.findOne({ userId }).lean();
    if (!university) {
        const created = await UniversityModel.create({
            userId,
            universityInfo: { name: "My University", country: "", verifiedStatus: false },
        });
        return created.toObject ? created.toObject() : created;
    }
    return university;
}

export async function updateUniversityProfile(
    userId: string,
    data: {
        name?: string;
        country?: string;
        tagline?: string;
        yearEstablished?: number;
        numberOfStudents?: number;
        logoShort?: string;
        logoLong?: string;
        outreachMessage?: string;
    },
) {
    await connectToDatabase();
    const university = await UniversityModel.findOne({ userId });
    if (!university) throw new Error("University not found");
    if (data.name !== undefined) university.universityInfo.name = data.name;
    if (data.country !== undefined) university.universityInfo.country = data.country;
    if (data.tagline !== undefined) university.universityInfo.tagline = data.tagline;
    if (data.yearEstablished !== undefined) university.universityInfo.yearEstablished = data.yearEstablished;
    if (data.numberOfStudents !== undefined) university.universityInfo.numberOfStudents = data.numberOfStudents;
    if (data.logoShort !== undefined) university.universityInfo.logoShort = data.logoShort;
    if (data.logoLong !== undefined) university.universityInfo.logoLong = data.logoLong;
    if (data.outreachMessage !== undefined) (university as { outreachMessage?: string }).outreachMessage = data.outreachMessage;
    await university.save();
    return university.toObject ? university.toObject() : university;
}

export async function listRepresentatives(userId: string) {
    await connectToDatabase();
    const university = await UniversityModel.findOne({ userId });
    if (!university) return [];
    const reps = await UniversityRepresentativeModel.find({ universityId: university._id }).lean();
    return reps;
}

export async function addRepresentative(userId: string, email: string, name?: string) {
    await connectToDatabase();
    const university = await UniversityModel.findOne({ userId });
    if (!university) throw new Error("University not found");
    const existing = await UniversityRepresentativeModel.findOne({ universityId: university._id, email });
    if (existing) throw new Error("Representative already invited");
    const rep = await UniversityRepresentativeModel.create({
        universityId: university._id,
        email: email.toLowerCase().trim(),
        name: name ?? "",
    });
    return rep.toObject ? rep.toObject() : rep;
}

export async function getUniversityDashboard(userId: string) {
    await connectToDatabase();

    const university = (await getOrCreateUniversity(userId)) as {
        _id: unknown;
        requirements?: {
            minGpa?: number;
            preferredTier?: "Bronze" | "Silver" | "Gold" | "Platinum" | "Elite";
        };
        universityInfo?: { name?: string };
    };

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
