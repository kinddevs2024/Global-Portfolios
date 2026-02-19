import { getRankingTier } from "@/modules/scoring/tiers";
import type { RankingTier, ScoreBreakdown } from "@/types/student";

export interface ScoringWeights {
    academic: number;
    olympiad: number;
    projects: number;
    skills: number;
    activity: number;
    aiPotential: number;
}

export const defaultWeights: ScoringWeights = {
    academic: 1,
    olympiad: 1,
    projects: 1,
    skills: 1,
    activity: 1,
    aiPotential: 1,
};

export function calculateGlobalScore(
    score: ScoreBreakdown,
    weights: ScoringWeights = defaultWeights,
): { globalScore: number; rankingTier: RankingTier } {
    const globalScore =
        score.academic * weights.academic +
        score.olympiad * weights.olympiad +
        score.projects * weights.projects +
        score.skills * weights.skills +
        score.activity * weights.activity +
        score.aiPotential * weights.aiPotential;

    return {
        globalScore: Number(globalScore.toFixed(2)),
        rankingTier: getRankingTier(globalScore),
    };
}
