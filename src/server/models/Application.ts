import { Schema, model, models } from "mongoose";

const applicationSchema = new Schema(
    {
        fromUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        toUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        status: { type: String, enum: ["pending", "accepted", "rejected", "withdrawn"], default: "pending", index: true },
        message: { type: String, default: "" },
        initiatedBy: { type: String, enum: ["student", "university"], required: true },
    },
    { timestamps: true }
);

applicationSchema.index({ fromUserId: 1, toUserId: 1 });

export const ApplicationModel = models.Application || model("Application", applicationSchema);
