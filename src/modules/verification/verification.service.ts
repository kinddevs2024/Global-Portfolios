export type VerificationEntity = "student-document" | "olympiad" | "university";

export interface VerificationRecord {
    entity: VerificationEntity;
    entityId: string;
    status: "pending" | "verified" | "rejected";
    reviewerId?: string;
    notes?: string;
}

export async function queueVerification(record: VerificationRecord) {
    return {
        ...record,
        queuedAt: new Date().toISOString(),
    };
}
