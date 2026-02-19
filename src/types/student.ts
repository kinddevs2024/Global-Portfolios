export type RankingTier = "Bronze" | "Silver" | "Gold" | "Platinum" | "Elite";

export interface ScoreBreakdown {
    academic: number;
    olympiad: number;
    projects: number;
    skills: number;
    activity: number;
    aiPotential: number;
}

export interface StudentFilters {
    country?: string;
    minAge?: number;
    maxAge?: number;
    minGpa?: number;
    maxGpa?: number;
    rankingTier?: RankingTier;
    minAiPotential?: number;
    skill?: string;
    technology?: string;
    language?: string;
    hasGrant?: boolean;
}

export interface StudentPortfolio {
    personalInfo: {
        firstName: string;
        lastName: string;
        country: string;
        age: number;
        language: string;
    };
    academicInfo: {
        gpa: number;
        examResults: string[];
        recommendationLetters: string[];
    };
    olympiads: Array<{ level: string; place: number; verified: boolean }>;
    projects: Array<{ name: string; technologies: string[]; complexity: number; users: number }>;
    skills: Array<{ name: string; verified: boolean }>;
    certificates: Array<{ name: string; issuer: string; verified: boolean }>;
    globalScore: number;
    rankingTier: RankingTier;
    aiAnalysis: {
        growthTrajectory: number;
        consistency: number;
        fraudRisk: number;
        recommendation: string;
    };
    verificationStatus: "pending" | "verified" | "rejected";
    portfolioVisibility: "public" | "private";
    activityMetrics: {
        profileUpdates: number;
        publications: number;
        engagementScore: number;
    };
    hasGrant: boolean;
    createdAt: Date;
}
