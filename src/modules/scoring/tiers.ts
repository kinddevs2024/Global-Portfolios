import type { RankingTier } from "@/types/student";

export function getRankingTier(globalScore: number): RankingTier {
    if (globalScore >= 460) return "Elite";
    if (globalScore >= 360) return "Platinum";
    if (globalScore >= 260) return "Gold";
    if (globalScore >= 170) return "Silver";
    return "Bronze";
}
