import mongoose from "mongoose";
import { getEnv } from "@/lib/config/env";

const globalWithMongoose = global as typeof globalThis & {
    mongooseConn?: typeof mongoose;
    legacyStudentIndexFixed?: boolean;
};

async function fixLegacyStudentIndexes() {
    if (globalWithMongoose.legacyStudentIndexFixed) {
        return;
    }

    try {
        const db = mongoose.connection.db;
        if (!db) {
            return;
        }

        const studentsCollection = db.collection("students");
        const indexes = await studentsCollection.indexes();

        for (const index of indexes) {
            const keys = Object.keys(index.key ?? {});
            const hasProjects = keys.includes("projects.technologies") || keys.includes("projects");
            const hasSkills = keys.includes("skills.name") || keys.includes("skills");

            if (hasProjects && hasSkills && index.name) {
                await studentsCollection.dropIndex(index.name);
                console.info("[DB_INDEX_FIX] Dropped legacy parallel-arrays index:", index.name);
            }
        }
    } catch (error) {
        console.warn("[DB_INDEX_FIX] Skip cleanup:", error instanceof Error ? error.message : error);
    } finally {
        globalWithMongoose.legacyStudentIndexFixed = true;
    }
}

export async function connectToDatabase() {
    if (globalWithMongoose.mongooseConn) {
        await fixLegacyStudentIndexes();
        return globalWithMongoose.mongooseConn;
    }

    const { MONGODB_URI } = getEnv();
    const conn = await mongoose.connect(MONGODB_URI, {
        dbName: "global-portfolios",
    });

    globalWithMongoose.mongooseConn = conn;
    await fixLegacyStudentIndexes();
    return conn;
}
