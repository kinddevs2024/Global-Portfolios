import { Schema, model, models, type InferSchemaType } from "mongoose";

const representativeSchema = new Schema(
    {
        universityId: { type: Schema.Types.ObjectId, ref: "University", required: true, index: true },
        email: { type: String, required: true, index: true },
        name: { type: String, default: "" },
        avatarUrl: { type: String, default: "" },
        invitedAt: { type: Date, default: Date.now },
        acceptedAt: { type: Date, default: null },
    },
    { timestamps: true },
);

representativeSchema.index({ universityId: 1, email: 1 }, { unique: true });

export type UniversityRepresentativeDocument = InferSchemaType<typeof representativeSchema> & { _id: string };
export const UniversityRepresentativeModel =
    models.UniversityRepresentative || model("UniversityRepresentative", representativeSchema);
