"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ProfilePayload = {
    firstName: string;
    lastName: string;
    country: string;
    age: number;
    language: string;
    gpa: number;
    examResults: string[];
    recommendationLetters: string[];
    skills: string[];
    technologies: string[];
    projectName: string;
    projectComplexity: number;
    projectUsers: number;
    academicScore: number;
    olympiadScore: number;
    projectScore: number;
    skillsScore: number;
    activityScore: number;
    aiPotentialScore: number;
    hasGrant: boolean;
};

const initialState: ProfilePayload = {
    firstName: "",
    lastName: "",
    country: "",
    age: 18,
    language: "English",
    gpa: 3,
    examResults: [],
    recommendationLetters: [],
    skills: [],
    technologies: [],
    projectName: "Main Project",
    projectComplexity: 30,
    projectUsers: 0,
    academicScore: 60,
    olympiadScore: 0,
    projectScore: 20,
    skillsScore: 20,
    activityScore: 10,
    aiPotentialScore: 30,
    hasGrant: false,
};

export default function ProfilePage() {
    const router = useRouter();
    const [form, setForm] = useState<ProfilePayload>(initialState);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function loadProfile() {
            const response = await fetch("/api/profile");
            setLoading(false);

            if (!response.ok) {
                return;
            }

            const result = (await response.json()) as {
                data?: {
                    personalInfo?: { firstName?: string; lastName?: string; country?: string; age?: number; language?: string };
                    academicInfo?: { gpa?: number; examResults?: string[]; recommendationLetters?: string[] };
                    skills?: Array<{ name?: string }>;
                    projects?: Array<{ name?: string; technologies?: string[]; complexity?: number; users?: number }>;
                    hasGrant?: boolean;
                    aiAnalysis?: { growthTrajectory?: number };
                    activityMetrics?: { engagementScore?: number };
                };
            };

            const profile = result.data;
            if (!profile) {
                return;
            }

            setForm((current) => ({
                ...current,
                firstName: profile.personalInfo?.firstName ?? current.firstName,
                lastName: profile.personalInfo?.lastName ?? current.lastName,
                country: profile.personalInfo?.country ?? current.country,
                age: profile.personalInfo?.age ?? current.age,
                language: profile.personalInfo?.language ?? current.language,
                gpa: profile.academicInfo?.gpa ?? current.gpa,
                examResults: profile.academicInfo?.examResults ?? current.examResults,
                recommendationLetters: profile.academicInfo?.recommendationLetters ?? current.recommendationLetters,
                skills: profile.skills?.map((skill) => skill.name ?? "").filter(Boolean) ?? current.skills,
                technologies: profile.projects?.[0]?.technologies ?? current.technologies,
                projectName: profile.projects?.[0]?.name ?? current.projectName,
                projectComplexity: profile.projects?.[0]?.complexity ?? current.projectComplexity,
                projectUsers: profile.projects?.[0]?.users ?? current.projectUsers,
                aiPotentialScore: profile.aiAnalysis?.growthTrajectory ?? current.aiPotentialScore,
                activityScore: profile.activityMetrics?.engagementScore ?? current.activityScore,
                hasGrant: profile.hasGrant ?? current.hasGrant,
            }));
        }

        void loadProfile();
    }, []);

    function updateField<K extends keyof ProfilePayload>(key: K, value: ProfilePayload[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function goNextStep() {
        if (step === 1 && (!form.firstName || !form.lastName || !form.country || !form.language || !form.age || !form.gpa)) {
            setMessage("Заполни обязательные поля: имя, фамилия, страна, язык, возраст и GPA");
            return;
        }

        if (step === 2 && !form.projectName) {
            setMessage("Укажи хотя бы название основного проекта");
            return;
        }

        setMessage("");
        setStep((prev) => Math.min(3, prev + 1));
    }

    function goPrevStep() {
        setMessage("");
        setStep((prev) => Math.max(1, prev - 1));
    }

    async function saveProfile() {
        if (saving) {
            return;
        }

        setSaving(true);
        setMessage("Saving...");

        const response = await fetch("/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        if (!response.ok) {
            const result = (await response.json()) as { error?: string };
            setMessage(result.error ?? "Failed to save profile");
            setSaving(false);
            return;
        }

        router.push("/");
    }

    if (loading) {
        return <div className="min-h-screen px-6 py-10">Loading profile...</div>;
    }

    return (
        <div className="min-h-screen px-6 py-10 md:px-12">
            <main className="mx-auto max-w-4xl card p-6">
                <h1 className="text-2xl font-bold">My Data Profile</h1>
                <p className="mt-1 text-sm text-gray-600">Fill your personal and achievement data to build your ranking profile.</p>
                <p className="mt-2 text-sm font-medium text-emerald-700">Step {step} of 3</p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-emerald-100">
                    <div className="h-full bg-emerald-600 transition-all" style={{ width: `${(step / 3) * 100}%` }} />
                </div>

                <form className="mt-6 grid gap-4 md:grid-cols-2">
                    {step === 1 ? (
                        <>
                            <p className="md:col-span-2 text-sm font-semibold text-gray-700">Personal Information</p>

                            <label className="space-y-1 text-sm text-gray-700">
                                <span>First name</span>
                                <input className="w-full rounded-xl border border-emerald-200 px-3 py-2" placeholder="John" value={form.firstName} onChange={(event) => updateField("firstName", event.target.value)} required />
                            </label>
                            <label className="space-y-1 text-sm text-gray-700">
                                <span>Last name</span>
                                <input className="w-full rounded-xl border border-emerald-200 px-3 py-2" placeholder="Doe" value={form.lastName} onChange={(event) => updateField("lastName", event.target.value)} required />
                            </label>
                            <label className="space-y-1 text-sm text-gray-700">
                                <span>Country</span>
                                <input className="w-full rounded-xl border border-emerald-200 px-3 py-2" placeholder="Kazakhstan" value={form.country} onChange={(event) => updateField("country", event.target.value)} required />
                            </label>
                            <label className="space-y-1 text-sm text-gray-700">
                                <span>Language</span>
                                <input className="w-full rounded-xl border border-emerald-200 px-3 py-2" placeholder="English" value={form.language} onChange={(event) => updateField("language", event.target.value)} required />
                            </label>
                            <label className="space-y-1 text-sm text-gray-700">
                                <span>Age</span>
                                <input className="w-full rounded-xl border border-emerald-200 px-3 py-2" type="number" min={10} max={99} value={form.age} onChange={(event) => updateField("age", Number(event.target.value))} required />
                            </label>
                            <label className="space-y-1 text-sm text-gray-700">
                                <span>GPA (0–4)</span>
                                <input className="w-full rounded-xl border border-emerald-200 px-3 py-2" type="number" min={0} max={4} step="0.01" value={form.gpa} onChange={(event) => updateField("gpa", Number(event.target.value))} required />
                            </label>
                        </>
                    ) : null}

                    {step === 2 ? (
                        <>
                            <p className="md:col-span-2 text-sm font-semibold text-gray-700">Project & Skills</p>

                            <label className="space-y-1 text-sm text-gray-700">
                                <span>Main project name</span>
                                <input className="w-full rounded-xl border border-emerald-200 px-3 py-2" placeholder="Smart Portfolio Platform" value={form.projectName} onChange={(event) => updateField("projectName", event.target.value)} required />
                            </label>
                            <label className="space-y-1 text-sm text-gray-700">
                                <span>Project complexity (0–100)</span>
                                <input className="w-full rounded-xl border border-emerald-200 px-3 py-2" type="number" min={0} max={100} placeholder="30" value={form.projectComplexity} onChange={(event) => updateField("projectComplexity", Number(event.target.value))} />
                            </label>
                            <label className="space-y-1 text-sm text-gray-700">
                                <span>Project users</span>
                                <input className="w-full rounded-xl border border-emerald-200 px-3 py-2" type="number" min={0} placeholder="100" value={form.projectUsers} onChange={(event) => updateField("projectUsers", Number(event.target.value))} />
                            </label>
                            <label className="space-y-1 text-sm text-gray-700">
                                <span>Skills (comma separated)</span>
                                <input className="w-full rounded-xl border border-emerald-200 px-3 py-2" placeholder="React, Node.js, Python" value={form.skills.join(", ")} onChange={(event) => updateField("skills", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} />
                            </label>
                            <label className="space-y-1 text-sm text-gray-700 md:col-span-2">
                                <span>Technologies (comma separated)</span>
                                <input className="w-full rounded-xl border border-emerald-200 px-3 py-2" placeholder="Next.js, MongoDB, TailwindCSS" value={form.technologies.join(", ")} onChange={(event) => updateField("technologies", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} />
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2"><input checked={form.hasGrant} onChange={(event) => updateField("hasGrant", event.target.checked)} type="checkbox" /> Has grant</label>
                        </>
                    ) : null}

                    {step === 3 ? (
                        <>
                            <p className="md:col-span-2 text-sm font-semibold text-gray-700">Score Inputs</p>

                            <div className="md:col-span-2 grid gap-3 md:grid-cols-3">
                                <label className="space-y-1 text-sm text-gray-700"><span>Academic score (0–100)</span><input className="w-full rounded-xl border border-emerald-200 px-3 py-2" type="number" min={0} max={100} value={form.academicScore} onChange={(event) => updateField("academicScore", Number(event.target.value))} /></label>
                                <label className="space-y-1 text-sm text-gray-700"><span>Olympiad score (0–150)</span><input className="w-full rounded-xl border border-emerald-200 px-3 py-2" type="number" min={0} max={150} value={form.olympiadScore} onChange={(event) => updateField("olympiadScore", Number(event.target.value))} /></label>
                                <label className="space-y-1 text-sm text-gray-700"><span>Project score (0–120)</span><input className="w-full rounded-xl border border-emerald-200 px-3 py-2" type="number" min={0} max={120} value={form.projectScore} onChange={(event) => updateField("projectScore", Number(event.target.value))} /></label>
                                <label className="space-y-1 text-sm text-gray-700"><span>Skills score (0–80)</span><input className="w-full rounded-xl border border-emerald-200 px-3 py-2" type="number" min={0} max={80} value={form.skillsScore} onChange={(event) => updateField("skillsScore", Number(event.target.value))} /></label>
                                <label className="space-y-1 text-sm text-gray-700"><span>Activity score (0–50)</span><input className="w-full rounded-xl border border-emerald-200 px-3 py-2" type="number" min={0} max={50} value={form.activityScore} onChange={(event) => updateField("activityScore", Number(event.target.value))} /></label>
                                <label className="space-y-1 text-sm text-gray-700"><span>AI potential score (0–100)</span><input className="w-full rounded-xl border border-emerald-200 px-3 py-2" type="number" min={0} max={100} value={form.aiPotentialScore} onChange={(event) => updateField("aiPotentialScore", Number(event.target.value))} /></label>
                            </div>
                        </>
                    ) : null}

                    <div className="md:col-span-2 flex flex-wrap gap-3">
                        {step > 1 ? (
                            <button className="rounded-xl border border-gray-300 px-4 py-2" onClick={goPrevStep} type="button">
                                Back
                            </button>
                        ) : null}
                        {step < 3 ? (
                            <button className="rounded-xl bg-emerald-600 px-4 py-2 text-white" onClick={goNextStep} type="button">
                                Next step
                            </button>
                        ) : (
                            <button className="rounded-xl bg-emerald-600 px-4 py-2 text-white disabled:opacity-70" onClick={saveProfile} type="button" disabled={saving}>
                                {saving ? "Saving..." : "Save profile"}
                            </button>
                        )}
                    </div>
                    {message ? <p className="md:col-span-2 text-sm text-gray-700">{message}</p> : null}
                </form>
            </main>
        </div>
    );
}
