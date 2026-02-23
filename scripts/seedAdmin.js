/**
 * Creates or updates the default admin user (Next.js app MongoDB).
 * Run: node scripts/seedAdmin.js
 * Or: npm run seed:admin
 */
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";

const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        passwordHash: { type: String, required: true },
        role: { type: String, enum: ["student", "university", "investor", "admin"], required: true },
        verificationStatus: { type: String, default: "pending" },
        firstName: { type: String, default: "" },
        lastName: { type: String, default: "" },
        avatarUrl: { type: String, default: "" },
        preferredLanguage: { type: String, default: "auto" },
        themeMode: { type: String, default: "system" },
        emailVerificationToken: { type: String, default: null },
        emailVerifiedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function seedAdmin() {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/global-portfolios";
    await mongoose.connect(uri);

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const result = await User.findOneAndUpdate(
        { email: ADMIN_EMAIL },
        {
            $set: {
                email: ADMIN_EMAIL,
                passwordHash,
                role: "admin",
                emailVerifiedAt: new Date(),
                emailVerificationToken: null,
            },
        },
        { upsert: true, new: true }
    );

    console.log("Admin user ready:");
    console.log("  Email:", ADMIN_EMAIL);
    console.log("  Password:", ADMIN_PASSWORD);
    console.log("  ID:", result._id.toString());

    await mongoose.disconnect();
}

seedAdmin().catch((err) => {
    console.error(err);
    process.exit(1);
});
