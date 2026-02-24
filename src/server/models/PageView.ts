import { Schema, model, models, type InferSchemaType } from "mongoose";

const pageViewSchema = new Schema(
    {
        path: { type: String, required: true, index: true },
        sessionId: { type: String, index: true },
        userId: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true },
);

export type PageViewDocument = InferSchemaType<typeof pageViewSchema> & { _id: string; createdAt: Date };
export const PageViewModel = models.PageView || model("PageView", pageViewSchema);
