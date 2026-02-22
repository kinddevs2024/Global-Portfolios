"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SessionUser = { _id: string; email: string; role: "student" | "university" | "admin" };
type ApplicationItem = { _id: string; status: "pending" | "accepted" | "rejected" | "withdrawn"; initiatedBy: "student" | "university"; createdAt: string };
type NotificationItem = { _id: string; type: string; isRead: boolean; createdAt: string };
type ConversationItem = { _id: string; updatedAt: string };
type StudentProfile = {
    globalScore?: number;
    skills?: Array<{ name?: string }>;
    aiAnalysis?: { recommendation?: string };
    portfolioData?: {
        firstName?: string;
        lastName?: string;
        dateOfBirth?: string;
        nationality?: string;
        country?: string;
        city?: string;
        phoneNumber?: string;
        email?: string;
        passportNumber?: string;
        profilePhoto?: string;
        education?: Array<{ institutionName?: string; fieldOfStudy?: string; gpa?: string }>;
        languages?: Array<{ name?: string; level?: string }>;
        hardSkills?: Array<{ name?: string }>;
        softSkills?: Array<{ name?: string }>;
        certifications?: Array<{ name?: string; organization?: string }>;
        internships?: Array<{ companyName?: string; position?: string }>;
        projects?: Array<{ title?: string; description?: string }>;
        awards?: Array<{ title?: string; organization?: string }>;
        personalStatement?: string;
        careerGoals?: string;
        preferredFields?: string;
    };
};

function hasText(value: unknown) {
    return String(value ?? "").trim().length > 0;
}

const STEP_LABELS: Record<number, string> = {
    1: "Basic Info",
    2: "Education",
    3: "Skills",
    4: "Certifications",
    5: "Experience",
    6: "Achievements",
    7: "Optional",
};

const STEP_REQUIRED_COUNTS: Record<number, number> = {
    1: 10,
    2: 5,
    3: 2,
    4: 2,
    5: 4,
    6: 2,
    7: 3,
};

function getStepForMissingLabel(label: string): number {
    if (
        label === "First Name"
        || label === "Last Name"
        || label === "Date of Birth"
        || label === "Nationality"
        || label === "Country"
        || label === "City"
        || label === "Phone Number"
        || label === "Email"
        || label === "Passport Number"
        || label === "Profile Photo"
    ) {
        return 1;
    }
    if (label.startsWith("Education") || label === "Language" || label === "Language Proficiency") return 2;
    if (label === "Hard Skill" || label === "Soft Skill" || label.includes("Hard Skill") || label.includes("Soft Skill")) return 3;
    if (label.startsWith("Certification")) return 4;
    if (label.startsWith("Internship") || label.startsWith("Project")) return 5;
    if (label.startsWith("Award")) return 6;
    if (label === "Personal Statement" || label === "Career Goals" || label === "Preferred Fields") return 7;
    return 1;
}

function getStepCompletionsFromMissing(missing: string[]) {
    const missingByStep: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    for (const label of missing) {
        const s = getStepForMissingLabel(label);
        missingByStep[s] = (missingByStep[s] ?? 0) + 1;
    }
    return [1, 2, 3, 4, 5, 6, 7].map((stepNum) => {
        const required = STEP_REQUIRED_COUNTS[stepNum] ?? 1;
        const missingCount = missingByStep[stepNum] ?? 0;
        const filled = required - missingCount;
        const completion = Math.min(100, Math.round((filled / required) * 100));
        return { step: stepNum, label: STEP_LABELS[stepNum], completion };
    });
}

function computeCompletionFromPortfolio(draft: StudentProfile["portfolioData"] | null | undefined) {
    if (!draft) {
        return {
            completion: 0,
            missing: [
                "First Name",
                "Last Name",
                "Date of Birth",
                "Nationality",
                "Country",
                "City",
                "Phone Number",
                "Passport Number",
                "Profile Photo",
                "Education (Institution, Field, GPA)",
                "Language + Proficiency",
                "Hard Skill + Soft Skill",
                "Certification (Name + Organization)",
                "Internship (Company + Position)",
                "Project (Title + Description)",
                "Award (Title + Organization)",
                "Personal Statement",
                "Career Goals",
                "Preferred Fields",
            ],
        };
    }

    try {
        const missing: string[] = [];

        if (!hasText(draft.firstName)) missing.push("First Name");
        if (!hasText(draft.lastName)) missing.push("Last Name");
        if (!hasText(draft.dateOfBirth)) missing.push("Date of Birth");
        if (!hasText(draft.nationality)) missing.push("Nationality");
        if (!hasText(draft.country)) missing.push("Country");
        if (!hasText(draft.city)) missing.push("City");
        if (!hasText(draft.phoneNumber)) missing.push("Phone Number");
        if (!hasText(draft.email)) missing.push("Email");
        if (!hasText(draft.passportNumber)) missing.push("Passport Number");
        if (!hasText(draft.profilePhoto)) missing.push("Profile Photo");

        if (!hasText(draft.education?.[0]?.institutionName)) missing.push("Education: Institution Name");
        if (!hasText(draft.education?.[0]?.fieldOfStudy)) missing.push("Education: Field of Study");
        if (!hasText(draft.education?.[0]?.gpa)) missing.push("Education: GPA");
        if (!hasText(draft.languages?.[0]?.name)) missing.push("Language");
        if (!hasText(draft.languages?.[0]?.level)) missing.push("Language Proficiency");
        if (!hasText(draft.hardSkills?.[0]?.name)) missing.push("Hard Skill");
        if (!hasText(draft.softSkills?.[0]?.name)) missing.push("Soft Skill");
        if (!hasText(draft.certifications?.[0]?.name)) missing.push("Certification Name");
        if (!hasText(draft.certifications?.[0]?.organization)) missing.push("Certification Organization");
        if (!hasText(draft.internships?.[0]?.companyName)) missing.push("Internship Company");
        if (!hasText(draft.internships?.[0]?.position)) missing.push("Internship Position");
        if (!hasText(draft.projects?.[0]?.title)) missing.push("Project Title");
        if (!hasText(draft.projects?.[0]?.description)) missing.push("Project Description");
        if (!hasText(draft.awards?.[0]?.title)) missing.push("Award Title");
        if (!hasText(draft.awards?.[0]?.organization)) missing.push("Award Organization");
        if (!hasText(draft.personalStatement)) missing.push("Personal Statement");
        if (!hasText(draft.careerGoals)) missing.push("Career Goals");
        if (!hasText(draft.preferredFields)) missing.push("Preferred Fields");

        const totalRequired = 28;
        const completion = Math.max(0, Math.round(((totalRequired - missing.length) / totalRequired) * 100));
        return { completion, missing };
    } catch {
        return { completion: 0, missing: ["Портфолио не распознано, откройте и сохраните заново"] };
    }
}

export default function AppHomePage() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<SessionUser | null>(null);
    const [applications, setApplications] = useState<ApplicationItem[]>([]);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [conversations, setConversations] = useState<ConversationItem[]>([]);
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [profileCompletion, setProfileCompletion] = useState(0);
    const [profileMissing, setProfileMissing] = useState<string[]>([]);

    useEffect(() => {
        async function loadDashboard() {
            try {
                const [meRes, applicationsRes, notificationsRes, conversationsRes, profileRes] = await Promise.all([
                    fetch("/api/auth/me"),
                    fetch("/api/applications/my"),
                    fetch("/api/notifications"),
                    fetch("/api/chat/conversations"),
                    fetch("/api/profile"),
                ]);

                if (!meRes.ok) {
                    window.location.assign("/auth/login");
                    return;
                }

                const mePayload = (await meRes.json()) as { data: SessionUser };
                const u = mePayload.data;
                setUser(u);
                if (u.role === "university") {
                    window.location.assign("/app/university/dashboard");
                    return;
                }

                if (applicationsRes.ok) {
                    const payload = (await applicationsRes.json()) as { items?: ApplicationItem[] };
                    setApplications(payload.items ?? []);
                }

                if (notificationsRes.ok) {
                    const payload = (await notificationsRes.json()) as { items?: NotificationItem[] };
                    setNotifications(payload.items ?? []);
                }

                if (conversationsRes.ok) {
                    const payload = (await conversationsRes.json()) as { items?: ConversationItem[] };
                    setConversations(payload.items ?? []);
                }

                if (profileRes.ok) {
                    const payload = (await profileRes.json()) as { data?: StudentProfile };
                    const profileData = payload.data ?? null;
                    setProfile(profileData);
                    const computed = computeCompletionFromPortfolio(profileData?.portfolioData);
                    setProfileCompletion(computed.completion);
                    setProfileMissing(computed.missing);
                } else {
                    const computed = computeCompletionFromPortfolio(null);
                    setProfileCompletion(computed.completion);
                    setProfileMissing(computed.missing);
                }
            } catch {
                window.location.assign("/auth/login");
            } finally {
                setLoading(false);
            }
        }

        void loadDashboard();
    }, []);

    if (loading) {
        return <div className="card p-6">Загрузка кабинета...</div>;
    }

    if (!user) {
        return null;
    }

    const pendingApplications = applications.filter((item) => item.status === "pending").length;
    const withdrawnApplications = applications.filter((item) => item.status === "withdrawn").length;
    const incomingInvites = applications.filter((item) => item.initiatedBy === "university" && item.status === "pending").length;
    const unreadNotifications = notifications.filter((item) => !item.isRead).length;
    const rating = profile?.globalScore ?? 0;
    const skills = (profile?.skills ?? []).map((item) => item.name).filter(Boolean).slice(0, 6) as string[];
    const recommendation = profile?.aiAnalysis?.recommendation ?? "Заполните портфолио полностью, чтобы получить персональные рекомендации.";
    const stepCompletions = getStepCompletionsFromMissing(profileMissing);

    return (
        <div className="space-y-6">
            <section className="card p-6">
                <h1 className="text-2xl font-bold">Кабинет студента</h1>
                <p className="mt-1 text-sm text-gray-600">{user.email} · role: {user.role}</p>
                <p className="mt-3 text-sm text-gray-700">Здесь вы видите новые заявки, письма, рейтинг, навыки и персональные рекомендации.</p>
            </section>

            {profileCompletion < 100 ? (
                <section className="card p-6">
                    <h2 className="text-lg font-semibold">Заполните разделы портфолио</h2>
                    <p className="mt-1 text-sm text-gray-600">Заполнено: {profileCompletion}%. Завершите каждую секцию для 100%.</p>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {stepCompletions.map(({ step: stepNum, label: stepLabel, completion: stepPct }) => (
                            <Link
                                key={stepNum}
                                href={`/app/portfolio?step=${stepNum}`}
                                className={`relative block rounded-xl border p-5 transition-all hover:shadow-md ${
                                    stepPct === 100 ? "border-emerald-200 bg-emerald-50/30" : "border-gray-200 hover:border-emerald-200"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-sm font-semibold text-gray-800">{stepLabel}</h3>
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                                <div className="mt-4 flex justify-center">
                                    <div
                                        className={`relative flex h-20 w-20 items-center justify-center rounded-full ${
                                            stepPct === 100 ? "bg-emerald-500" : "border-2 border-gray-200 bg-gray-50"
                                        }`}
                                    >
                                        <svg className="absolute inset-0 h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                                            <circle cx="18" cy="18" r="16" fill="none" stroke={stepPct === 100 ? "rgba(255,255,255,0.4)" : "#e5e7eb"} strokeWidth="3" />
                                            <circle
                                                cx="18"
                                                cy="18"
                                                r="16"
                                                fill="none"
                                                stroke={stepPct === 100 ? "#fff" : "#10b981"}
                                                strokeWidth="3"
                                                strokeDasharray={`${stepPct} 100`}
                                                strokeLinecap="round"
                                                className="transition-all duration-500"
                                            />
                                        </svg>
                                        <span
                                            className={`relative text-sm font-bold ${
                                                stepPct === 100 ? "text-white" : stepPct > 0 ? "text-emerald-600" : "text-gray-400"
                                            }`}
                                        >
                                            {stepPct}%
                                        </span>
                                    </div>
                                </div>
                                <span className="mt-3 block w-full rounded-lg border border-emerald-200 py-2 text-center text-xs font-medium text-emerald-700">
                                    {stepPct === 100 ? "Просмотреть" : "Заполнить"}
                                </span>
                            </Link>
                        ))}
                    </div>
                    <p className="mt-4 text-center text-sm text-gray-500">Общий прогресс: {profileCompletion}%</p>
                </section>
            ) : (
                <section className="card p-5">
                    <h2 className="text-lg font-semibold">Профиль заполнен</h2>
                    <p className="mt-2 text-sm text-emerald-700">Отлично: у вас 100% заполнения портфолио.</p>
                    <Link className="mt-3 inline-flex rounded-lg border border-emerald-300 px-4 py-2 text-sm" href="/app/portfolio">
                        Редактировать портфолио
                    </Link>
                </section>
            )}

            <section className="grid gap-4 md:grid-cols-4">
                <article className="card p-4"><p className="text-xs text-gray-500">Новые приглашения</p><p className="text-2xl font-bold">{incomingInvites}</p></article>
                <article className="card p-4"><p className="text-xs text-gray-500">Активные заявки</p><p className="text-2xl font-bold">{pendingApplications}</p></article>
                <article className="card p-4"><p className="text-xs text-gray-500">Непрочитанные письма</p><p className="text-2xl font-bold">{unreadNotifications}</p></article>
                <article className="card p-4"><p className="text-xs text-gray-500">Ваш рейтинг</p><p className="text-2xl font-bold">{rating}</p></article>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                <article className="card p-5">
                    <h2 className="text-lg font-semibold">Заявки и статусы</h2>
                    <p className="mt-2 text-sm text-gray-600">Всего заявок: {applications.length}. Удалено/отозвано: {withdrawnApplications}.</p>
                    <Link className="mt-4 inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white" href="/app/applications">
                        Открыть страницу заявок
                    </Link>
                </article>

                <article className="card p-5">
                    <h2 className="text-lg font-semibold">Чаты с университетами</h2>
                    <p className="mt-2 text-sm text-gray-600">Активных диалогов: {conversations.length}. Чат становится особенно важен после принятия заявки.</p>
                    <p className="mt-3 text-sm text-gray-700">Используйте раздел заявок для взаимодействия и следующих шагов.</p>
                </article>
            </section>

            <section className="card p-5">
                <h2 className="text-lg font-semibold">Ваши скиллы</h2>
                {skills.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {skills.map((skill) => (
                            <span key={skill} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs">
                                {skill}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="mt-2 text-sm text-gray-600">Пока нет навыков. Добавьте их на странице портфолио.</p>
                )}
                <p className="mt-4 text-sm text-gray-700"><strong>Рекомендация:</strong> {recommendation}</p>
                <Link className="mt-4 inline-flex rounded-lg border border-emerald-300 px-4 py-2 text-sm" href="/app/portfolio">
                    Редактировать портфолио
                </Link>
            </section>

        </div>
    );
}
