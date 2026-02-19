import { Schema, model, models, type InferSchemaType } from "mongoose";

const scoringConfigSchema = new Schema(
    {
        academic: { type: Number, default: 1 },
        olympiad: { type: Number, default: 1 },
        projects: { type: Number, default: 1 },
        skills: { type: Number, default: 1 },
        activity: { type: Number, default: 1 },
        aiPotential: { type: Number, default: 1 },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true },
);

export type ScoringConfigDocument = InferSchemaType<typeof scoringConfigSchema> & { _id: string };
export const ScoringConfigModel = models.ScoringConfig || model("ScoringConfig", scoringConfigSchema);
