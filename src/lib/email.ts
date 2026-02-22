import nodemailer from "nodemailer";

type SmtpConfig = {
    host: string;
    port: number;
    secure: boolean;
    user?: string;
    pass?: string;
};

function getSmtpConfig(): SmtpConfig | null {
    const host = process.env.SMTP_HOST;
    const port = parseInt(String(process.env.SMTP_PORT ?? "587"), 10);
    if (!host) return null;

    return {
        host,
        port: Number.isFinite(port) ? port : 587,
        secure: process.env.SMTP_SECURE === "true",
        user: process.env.SMTP_USER || undefined,
        pass: process.env.SMTP_PASS || undefined,
    };
}

export async function sendVerificationEmail(email: string, token: string, baseUrl: string): Promise<boolean> {
    const config = getSmtpConfig();
    if (!config) {
        console.warn("[EMAIL] SMTP not configured (SMTP_HOST). Skipping verification email.");
        return false;
    }

    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: config.user && config.pass ? { user: config.user, pass: config.pass } : undefined,
    });

    const verifyUrl = `${baseUrl.replace(/\/$/, "")}/auth/verify-email?token=${encodeURIComponent(token)}`;
    const from = process.env.EMAIL_FROM || config.user || "noreply@globalportfolios.app";

    try {
        await transporter.sendMail({
            from,
            to: email,
            subject: "Verify your email - Global Portfolios",
            html: `
                <p>Hello,</p>
                <p>Please verify your email by clicking the link below:</p>
                <p><a href="${verifyUrl}">${verifyUrl}</a></p>
                <p>This link expires in 24 hours.</p>
                <p>If you did not create an account, ignore this email.</p>
                <p>— Global Portfolios</p>
            `,
        });
        return true;
    } catch (err) {
        console.error("[EMAIL] Failed to send verification email:", err);
        return false;
    }
}
