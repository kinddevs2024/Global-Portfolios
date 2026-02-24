import { Schema, model, models } from "mongoose";

const conversationSchema = new Schema(
    {
        participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    },
    { timestamps: true }
);

conversationSchema.index({ participants: 1 });

export const ConversationModel = models.Conversation || model("Conversation", conversationSchema);
