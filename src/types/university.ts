export interface UniversityRequirement {
    minGpa?: number;
    minGlobalScore?: number;
    requiredSkills: string[];
    preferredTechnologies: string[];
    preferredTier?: "Bronze" | "Silver" | "Gold" | "Platinum" | "Elite";
}

export interface UniversityProfile {
    universityInfo: {
        name: string;
        country: string;
        verifiedStatus: boolean;
    };
    programs: Array<{ name: string; level: string; language: string }>;
    requirements: UniversityRequirement;
    rankingPreferences: {
        prioritizeAiPotential: boolean;
        prioritizeProjects: boolean;
    };
    savedStudents: string[];
    analytics: {
        profileViews: number;
        invitesSent: number;
    };
}
