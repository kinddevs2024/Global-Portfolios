import { Schema, model, models, type InferSchemaType } from "mongoose";

const sessionHeartbeatSchema = new Schema(
    {
        sessionId: { type: String, required: true, unique: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        lastSeenAt: { type: Date, required: true, default: Date.now, index: true },
    },
    { timestamps: true },
);

export type SessionHeartbeatDocument = InferSchemaType<typeof sessionHeartbeatSchema> & { _id: string };
export const SessionHeartbeatModel = models.SessionHeartbeat || model("SessionHeartbeat", sessionHeartbeatSchema);
