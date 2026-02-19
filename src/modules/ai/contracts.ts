export interface ProfileAnalysisInput {
    studentId: string;
    growthHistory: number[];
    projectComplexityTrend: number[];
    consistencySignals: number[];
}

export interface ProfileAnalysisOutput {
    growthTrajectory: number;
    consistency: number;
    fraudRisk: number;
    recommendation: string;
}

export interface MatchingInput {
    universityId: string;
    requirements: {
        minGpa?: number;
        requiredSkills: string[];
        preferredTechnologies: string[];
    };
}

export interface MatchingResult {
    studentId: string;
    matchScore: number;
    reasoning: string;
}

export type AiProviderContract = {
    analyzeProfile: (input: ProfileAnalysisInput) => Promise<ProfileAnalysisOutput>;
    matchStudents: (input: MatchingInput) => Promise<MatchingResult[]>;
    detectFraud: (studentId: string) => Promise<{ risk: number; flags: string[] }>;
};
