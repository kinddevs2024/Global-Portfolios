import { Schema, model, models } from "mongoose";

const messageSchema = new Schema(
    {
        conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
        senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String, required: true },
    },
    { timestamps: true }
);

export const MessageModel = models.Message || model("Message", messageSchema);
