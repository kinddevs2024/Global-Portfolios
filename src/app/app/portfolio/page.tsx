"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fileToDataUrl } from "@/lib/imageUtils";

type Education = {
    institutionName: string;
    country: string;
    degreeType: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    gpa: string;
    honors: string;
    currentStudent: boolean;
};

type Language = { name: string; level: string; certificate: string; score: string };
type Skill = { name: string; level: string };
type Certification = { name: string; organization: string; issueDate: string; expirationDate: string; score: string; verificationLink: string; imageUrl: string };
type Internship = { companyName: string; position: string; country: string; startDate: string; endDate: string; description: string; skillsGained: string };
type Project = { title: string; description: string; role: string; technologies: string; link: string; duration: string; outcome: string };
type Award = { title: string; organization: string; level: string; date: string; description: string };
type Volunteering = { organization: string; role: string; duration: string; description: string; impact: string };
type Publication = { title: string; journal: string; link: string; date: string; coAuthors: string };
type Recommendation = { recommenderName: string; position: string; organization: string; email: string; contactPermission: boolean };
type MissingField = { label: string; step: number };

type PortfolioState = {
    firstName: string;
    lastName: string;
    middleName: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    country: string;
    city: string;
    phoneNumber: string;
    email: string;
    passportNumber: string;
    profilePhoto: string;

    education: Education[];
    languages: Language[];
    hardSkills: Skill[];
    softSkills: Skill[];
    certifications: Certification[];
    internships: Internship[];
    projects: Project[];
    awards: Award[];
    volunteering: Volunteering[];
    publications: Publication[];
    recommendations: Recommendation[];

    personalStatement: string;
    careerGoals: string;
    preferredFields: string;
    videoPresentation: string;
    linkedin: string;
    github: string;
    personalWebsite: string;
    portfolioLink: string;
    availability: string;
    willingToRelocate: boolean;
    preferredCountries: string;
    scholarshipNeeded: boolean;
};

const defaultState: PortfolioState = {
    firstName: "",
    lastName: "",
    middleName: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    country: "",
    city: "",
    phoneNumber: "",
    email: "",
    passportNumber: "",
    profilePhoto: "",
    education: [{ institutionName: "", country: "", degreeType: "High School", fieldOfStudy: "", startDate: "", endDate: "", gpa: "", honors: "", currentStudent: false }],
    languages: [{ name: "", level: "", certificate: "", score: "" }],
    hardSkills: [{ name: "", level: "3" }],
    softSkills: [{ name: "", level: "3" }],
    certifications: [{ name: "", organization: "", issueDate: "", expirationDate: "", score: "", verificationLink: "", imageUrl: "" }],
    internships: [{ companyName: "", position: "", country: "", startDate: "", endDate: "", description: "", skillsGained: "" }],
    projects: [{ title: "", description: "", role: "", technologies: "", link: "", duration: "", outcome: "" }],
    awards: [{ title: "", organization: "", level: "Local", date: "", description: "" }],
    volunteering: [{ organization: "", role: "", duration: "", description: "", impact: "" }],
    publications: [{ title: "", journal: "", link: "", date: "", coAuthors: "" }],
    recommendations: [{ recommenderName: "", position: "", organization: "", email: "", contactPermission: false }],
    personalStatement: "",
    careerGoals: "",
    preferredFields: "",
    videoPresentation: "",
    linkedin: "",
    github: "",
    personalWebsite: "",
    portfolioLink: "",
    availability: "Full-time",
    willingToRelocate: false,
    preferredCountries: "",
    scholarshipNeeded: false,
};

const steps = [
    "Basic Info",
    "Education",
    "Certifications",
    "Achievements",
    "Optional",
] as const;


function calculateAge(dateOfBirth: string) {
    if (!dateOfBirth) return 18;
    const dob = new Date(dateOfBirth);
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const monthDiff = now.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age -= 1;
    return Math.max(age, 10);
}

function updateArrayItem<T>(items: T[], index: number, patch: Partial<T>) {
    return items.map((item, currentIndex) => (currentIndex === index ? { ...item, ...patch } : item));
}

function hasText(value: unknown) {
    return String(value ?? "").trim().length > 0;
}

function pickText(serverValue: unknown, currentValue: string) {
    const serverText = String(serverValue ?? "").trim();
    return serverText.length > 0 ? serverText : currentValue;
}

function pickGpa(serverValue: unknown, currentValue: string) {
    if (typeof serverValue === "number" && Number.isFinite(serverValue) && serverValue > 0) {
        return String(serverValue);
    }
    return currentValue;
}

function getMissingFields(form: PortfolioState): MissingField[] {
    const missing: MissingField[] = [];

    if (!hasText(form.firstName)) missing.push({ label: "First Name", step: 1 });
    if (!hasText(form.lastName)) missing.push({ label: "Last Name", step: 1 });
    if (!hasText(form.dateOfBirth)) missing.push({ label: "Date of Birth", step: 1 });
    if (!hasText(form.nationality)) missing.push({ label: "Nationality", step: 1 });
    if (!hasText(form.country)) missing.push({ label: "Country", step: 1 });
    if (!hasText(form.city)) missing.push({ label: "City", step: 1 });
    if (!hasText(form.phoneNumber)) missing.push({ label: "Phone Number", step: 1 });
    if (!hasText(form.email)) missing.push({ label: "Email", step: 1 });
    if (!hasText(form.passportNumber)) missing.push({ label: "Passport Number", step: 1 });
    if (!hasText(form.profilePhoto)) missing.push({ label: "Profile Photo", step: 1 });

    const firstEducation = form.education[0];
    if (!hasText(firstEducation?.institutionName)) missing.push({ label: "Education: Institution Name", step: 2 });
    if (!hasText(firstEducation?.fieldOfStudy)) missing.push({ label: "Education: Field of Study", step: 2 });
    if (!hasText(firstEducation?.gpa)) missing.push({ label: "Education: GPA", step: 2 });
    if (!hasText(form.languages[0]?.name)) missing.push({ label: "Language", step: 2 });
    if (!hasText(form.languages[0]?.level)) missing.push({ label: "Language Proficiency", step: 2 });

    if (!hasText(form.certifications[0]?.name)) missing.push({ label: "Certification Name", step: 4 });
    if (!hasText(form.certifications[0]?.organization)) missing.push({ label: "Certification Organization", step: 4 });

    if (!hasText(form.awards[0]?.title)) missing.push({ label: "Award Title", step: 6 });
    if (!hasText(form.awards[0]?.organization)) missing.push({ label: "Award Organization", step: 6 });

    if (!hasText(form.personalStatement)) missing.push({ label: "Personal Statement", step: 7 });
    if (!hasText(form.careerGoals)) missing.push({ label: "Career Goals", step: 7 });
    if (!hasText(form.preferredFields)) missing.push({ label: "Preferred Fields", step: 7 });

    return missing;
}

const STEP_LABELS: Record<number, string> = {
    1: "Basic Info",
    2: "Education",
    4: "Certifications",
    6: "Achievements",
    7: "Optional",
};

const STEP_REQUIRED_COUNTS: Record<number, number> = {
    1: 10,
    2: 5,
    4: 2,
    6: 2,
    7: 3,
};

const FORM_STEPS = [1, 2, 4, 6, 7] as const;

function getStepCompletions(form: PortfolioState, missingFields: MissingField[]) {
    return FORM_STEPS.map((stepNum) => {
        const label = STEP_LABELS[stepNum] ?? "";
        const required = STEP_REQUIRED_COUNTS[stepNum] ?? 1;
        const missing = missingFields.filter((m) => m.step === stepNum).length;
        const filled = required - missing;
        const completion = Math.min(100, Math.round((filled / required) * 100));
        return { step: stepNum, label, completion };
    });
}

function buildProfilePayload(form: PortfolioState) {
    const firstEducation = form.education[0];
    const project = form.projects[0];
    const hardSkillNames = form.hardSkills.map((item) => item.name.trim()).filter(Boolean);
    const technologies = (project?.technologies ?? "").split(",").map((item) => item.trim()).filter(Boolean);

    return {
        firstName: form.firstName || "Student",
        lastName: form.lastName || "Profile",
        country: form.country || "Unknown",
        age: calculateAge(form.dateOfBirth),
        language: form.languages[0]?.name || "English",
        gpa: Number(firstEducation?.gpa || 3),
        examResults: [],
        recommendationLetters: form.recommendations.map((item) => item.organization).filter(Boolean),
        skills: hardSkillNames,
        technologies,
        projectName: project?.title || "Main Project",
        projectComplexity: 40,
        projectUsers: 0,
        academicScore: 70,
        olympiadScore: 0,
        projectScore: 30,
        skillsScore: Math.min(80, hardSkillNames.length * 10),
        activityScore: 20,
        aiPotentialScore: 40,
        hasGrant: form.scholarshipNeeded,
    };
}

export default function PortfolioPage() {
    const searchParams = useSearchParams();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState<PortfolioState>(defaultState);
    const [status, setStatus] = useState("");
    const [saving, setSaving] = useState(false);
    const [showMissing, setShowMissing] = useState(false);

    useEffect(() => {
        const requestedStep = Number(searchParams.get("step"));
        if (Number.isInteger(requestedStep) && requestedStep >= 1 && requestedStep <= 7) {
            if (requestedStep === 3) setStep(4);
            else if (requestedStep === 5) setStep(6);
            else setStep(requestedStep);
        }
    }, [searchParams]);

    useEffect(() => {
        async function loadPlatformData() {
            const [meRes, profileRes] = await Promise.all([fetch("/api/auth/me"), fetch("/api/profile")]);
            if (meRes.ok) {
                const payload = (await meRes.json()) as { data?: { email?: string } };
                if (payload.data?.email) {
                    setForm((current) => ({ ...current, email: payload.data?.email ?? current.email }));
                }
            }

            if (profileRes.ok) {
                const payload = (await profileRes.json()) as {
                    data?: {
                        portfolioData?: PortfolioState;
                        personalInfo?: { firstName?: string; lastName?: string; country?: string; age?: number; language?: string };
                        academicInfo?: { gpa?: number };
                        skills?: Array<{ name?: string }>;
                        projects?: Array<{ name?: string; technologies?: string[] }>;
                    };
                };

                const profile = payload.data;
                if (!profile) return;

                const serverPortfolio = profile.portfolioData;
                if (serverPortfolio) {
                    setForm((current) => ({
                        ...current,
                        ...serverPortfolio,
                        email: current.email || serverPortfolio.email || "",
                    }));
                    return;
                }

                setForm((current) => ({
                    ...current,
                    firstName: pickText(profile.personalInfo?.firstName, current.firstName),
                    lastName: pickText(profile.personalInfo?.lastName, current.lastName),
                    country: pickText(profile.personalInfo?.country, current.country),
                    hardSkills:
                        profile.skills && profile.skills.length > 0
                            ? profile.skills
                                .map((skill) => ({ name: String(skill.name ?? "").trim(), level: "3" }))
                                .filter((skill) => skill.name.length > 0)
                            : current.hardSkills,
                    projects:
                        profile.projects && profile.projects.length > 0
                            ? profile.projects
                                .map((project) => ({
                                title: project.name ?? "",
                                description: "",
                                role: "",
                                technologies: (project.technologies ?? []).join(", "),
                                link: "",
                                duration: "",
                                outcome: "",
                                }))
                                .filter((project) => hasText(project.title) || hasText(project.technologies))
                            : current.projects,
                    education:
                        current.education.length > 0
                            ? updateArrayItem(current.education, 0, {
                                gpa: pickGpa(profile.academicInfo?.gpa, current.education[0]?.gpa ?? ""),
                                fieldOfStudy: pickText(profile.personalInfo?.language, current.education[0]?.fieldOfStudy ?? ""),
                            })
                            : current.education,
                }));
            }
        }

        void loadPlatformData();
    }, []);

    const missingFields = useMemo(() => getMissingFields(form), [form]);
    const completion = useMemo(() => {
        const totalRequired = 27;
        return Math.round(((totalRequired - missingFields.length) / totalRequired) * 100);
    }, [missingFields.length]);
    const stepCompletions = useMemo(() => getStepCompletions(form, missingFields), [form, missingFields]);

    function persistDraft(next: PortfolioState) {
        setForm(next);
    }

    async function saveToPlatform(sourceForm: PortfolioState = form, successMessage = "Портфолио сохранено") {
        if (saving) return;
        setSaving(true);
        setStatus("Сохранение...");

        const payload = {
            ...buildProfilePayload(sourceForm),
            portfolioData: sourceForm,
        };

        try {
            const response = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const body = (await response.json()) as { error?: string };
                setStatus(body.error ?? "Не удалось сохранить данные");
                return false;
            }

            setStatus(successMessage);
            return true;
        } catch {
            setStatus("Сетевая ошибка при сохранении");
            return false;
        } finally {
            setSaving(false);
        }
    }

    async function saveAndGoNext() {
        setShowMissing(false);
        const ok = await saveToPlatform();
        if (ok) {
            setStep((current) => {
                const next = current + 1;
                if (next === 3) return 4;
                if (next === 5) return 6;
                return Math.min(7, next);
            });
        }
    }

    async function finishPortfolio() {
        setShowMissing(true);

        if (missingFields.length > 0) {
            setStatus("Заполните обязательные поля перед завершением.");
            setStep(missingFields[0].step);
            return;
        }

        const ok = await saveToPlatform();
        if (ok) {
            setStatus("Портфолио завершено: 100%.");
            window.location.assign("/app");
        }
    }

    return (
        <div className="space-y-6">
            <section className="card p-6">
                <h1 className="text-2xl font-bold">Портфолио студента</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Заполните каждую секцию, чтобы двигаться дальше. Все повторяющиеся блоки добавляются через + Add More.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {stepCompletions.map(({ step: stepNum, label: stepLabel, completion: stepPct }) => (
                        <article
                            key={stepNum}
                            className={`relative rounded-xl border p-5 transition-all ${
                                step === stepNum ? "border-emerald-400 bg-emerald-50/50 shadow-sm" : "border-gray-200 hover:border-emerald-200 hover:bg-gray-50/50"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="text-sm font-semibold text-gray-800">{stepLabel}</h3>
                                <button
                                    type="button"
                                    onClick={() => setStep(stepNum)}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700"
                                    aria-label={`Перейти к шагу ${stepNum}`}
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                            <div className="mt-4 flex justify-center">
                                <div
                                    className={`relative flex h-20 w-20 items-center justify-center rounded-full ${
                                        stepPct === 100 ? "bg-emerald-500" : "border-2 border-gray-200 bg-gray-50"
                                    }`}
                                >
                                    <svg className="absolute inset-0 h-20 w-20 -rotate-90" viewBox="0 0 36 36" style={{ overflow: "visible" }}>
                                        <circle cx="18" cy="18" r="15.5" fill="none" stroke={stepPct === 100 ? "rgba(255,255,255,0.4)" : "#e5e7eb"} strokeWidth="3" strokeLinecap="round" />
                                        <circle
                                            cx="18"
                                            cy="18"
                                            r="15.5"
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
                            <button
                                type="button"
                                onClick={() => setStep(stepNum)}
                                className="mt-3 w-full rounded-lg border border-emerald-200 py-2 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"
                            >
                                {stepPct === 100 ? "Просмотреть" : "Заполнить"}
                            </button>
                        </article>
                    ))}
                </div>
                <p className="mt-4 text-center text-sm text-gray-500">Общий прогресс: {completion}%</p>
            </section>

            <section className="card p-6 space-y-4">
                {step === 1 ? (
                    <>
                        <h2 className="text-lg font-semibold">1) Основная информация</h2>
                        <div className="grid gap-3 md:grid-cols-2">
                            <input className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="First Name" value={form.firstName} onChange={(e) => persistDraft({ ...form, firstName: e.target.value })} />
                            <input className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="Last Name" value={form.lastName} onChange={(e) => persistDraft({ ...form, lastName: e.target.value })} />
                            <input className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="Middle Name" value={form.middleName} onChange={(e) => persistDraft({ ...form, middleName: e.target.value })} />
                            <input className="rounded-xl border border-emerald-200 px-3 py-2" type="date" value={form.dateOfBirth} onChange={(e) => persistDraft({ ...form, dateOfBirth: e.target.value })} />
                            <input className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="Gender" value={form.gender} onChange={(e) => persistDraft({ ...form, gender: e.target.value })} />
                            <input className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="Nationality" value={form.nationality} onChange={(e) => persistDraft({ ...form, nationality: e.target.value })} />
                            <input className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="Country" value={form.country} onChange={(e) => persistDraft({ ...form, country: e.target.value })} />
                            <input className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="City" value={form.city} onChange={(e) => persistDraft({ ...form, city: e.target.value })} />
                            <input className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="Phone Number" value={form.phoneNumber} onChange={(e) => persistDraft({ ...form, phoneNumber: e.target.value })} />
                            <input className="rounded-xl border border-emerald-200 bg-gray-50 px-3 py-2" placeholder="Email" readOnly value={form.email} />
                            <input className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="Passport Number (Private)" value={form.passportNumber} onChange={(e) => persistDraft({ ...form, passportNumber: e.target.value })} />
                            <input className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="Profile Photo URL" value={form.profilePhoto} onChange={(e) => persistDraft({ ...form, profilePhoto: e.target.value })} />
                            {form.profilePhoto ? (
                                <div className="md:col-span-2">
                                    <p className="mb-1 text-sm font-medium">Preview</p>
                                    <div
                                        className="h-36 w-full rounded-xl border border-emerald-100 bg-cover bg-center"
                                        style={{ backgroundImage: `url(${form.profilePhoto})` }}
                                    />
                                </div>
                            ) : null}
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium">Или загрузите фото с устройства</label>
                                <input
                                    accept="image/*"
                                    className="w-full rounded-xl border border-emerald-200 px-3 py-2"
                                    onChange={async (event) => {
                                        const file = event.target.files?.[0];
                                        if (!file) return;
                                        try {
                                            const imageData = await fileToDataUrl(file, { maxSize: 500 });
                                            const nextForm = { ...form, profilePhoto: imageData };
                                            persistDraft(nextForm);
                                            await saveToPlatform(nextForm, "Изображение сохранено");
                                        } finally {
                                            event.target.value = "";
                                        }
                                    }}
                                    type="file"
                                />
                            </div>
                        </div>
                    </>
                ) : null}

                {step === 2 ? (
                    <>
                        <h2 className="text-lg font-semibold">2) Академический блок</h2>
                        <div className="space-y-3">
                            {form.education.map((item, index) => (
                                <div className="grid gap-2 rounded-xl border border-emerald-100 p-3 md:grid-cols-3" key={`edu-${index}`}>
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Institution Name" value={item.institutionName} onChange={(e) => persistDraft({ ...form, education: updateArrayItem(form.education, index, { institutionName: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Country" value={item.country} onChange={(e) => persistDraft({ ...form, education: updateArrayItem(form.education, index, { country: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Degree Type" value={item.degreeType} onChange={(e) => persistDraft({ ...form, education: updateArrayItem(form.education, index, { degreeType: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Field of Study" value={item.fieldOfStudy} onChange={(e) => persistDraft({ ...form, education: updateArrayItem(form.education, index, { fieldOfStudy: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" type="date" value={item.startDate} onChange={(e) => persistDraft({ ...form, education: updateArrayItem(form.education, index, { startDate: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" type="date" value={item.endDate} onChange={(e) => persistDraft({ ...form, education: updateArrayItem(form.education, index, { endDate: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="GPA" value={item.gpa} onChange={(e) => persistDraft({ ...form, education: updateArrayItem(form.education, index, { gpa: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Honors" value={item.honors} onChange={(e) => persistDraft({ ...form, education: updateArrayItem(form.education, index, { honors: e.target.value }) })} />
                                    <label className="flex items-center gap-2 text-sm"><input checked={item.currentStudent} type="checkbox" onChange={(e) => persistDraft({ ...form, education: updateArrayItem(form.education, index, { currentStudent: e.target.checked }) })} />Current Student</label>
                                </div>
                            ))}
                            <button className="rounded-lg border border-emerald-300 px-3 py-2 text-sm" onClick={() => persistDraft({ ...form, education: [...form.education, { institutionName: "", country: "", degreeType: "Other", fieldOfStudy: "", startDate: "", endDate: "", gpa: "", honors: "", currentStudent: false }] })} type="button">+ Add More Education</button>
                        </div>

                        <h3 className="text-base font-semibold">Languages</h3>
                        <div className="space-y-3">
                            {form.languages.map((item, index) => (
                                <div className="grid gap-2 rounded-xl border border-emerald-100 p-3 md:grid-cols-4" key={`lang-${index}`}>
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Language" value={item.name} onChange={(e) => persistDraft({ ...form, languages: updateArrayItem(form.languages, index, { name: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Level" value={item.level} onChange={(e) => persistDraft({ ...form, languages: updateArrayItem(form.languages, index, { level: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Certificate" value={item.certificate} onChange={(e) => persistDraft({ ...form, languages: updateArrayItem(form.languages, index, { certificate: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Score" value={item.score} onChange={(e) => persistDraft({ ...form, languages: updateArrayItem(form.languages, index, { score: e.target.value }) })} />
                                </div>
                            ))}
                            <button className="rounded-lg border border-emerald-300 px-3 py-2 text-sm" onClick={() => persistDraft({ ...form, languages: [...form.languages, { name: "", level: "", certificate: "", score: "" }] })} type="button">+ Add More Language</button>
                        </div>
                    </>
                ) : null}

                {step === 4 ? (
                    <>
                        <h2 className="text-lg font-semibold">4) Сертификаты</h2>
                        <div className="space-y-3">
                            {form.certifications.map((item, index) => (
                                <div className="grid gap-2 rounded-xl border border-emerald-100 p-3 md:grid-cols-3" key={`cert-${index}`}>
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Name" value={item.name} onChange={(e) => persistDraft({ ...form, certifications: updateArrayItem(form.certifications, index, { name: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Issuing Organization" value={item.organization} onChange={(e) => persistDraft({ ...form, certifications: updateArrayItem(form.certifications, index, { organization: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Score" value={item.score} onChange={(e) => persistDraft({ ...form, certifications: updateArrayItem(form.certifications, index, { score: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" type="date" value={item.issueDate} onChange={(e) => persistDraft({ ...form, certifications: updateArrayItem(form.certifications, index, { issueDate: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" type="date" value={item.expirationDate} onChange={(e) => persistDraft({ ...form, certifications: updateArrayItem(form.certifications, index, { expirationDate: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Verification Link" value={item.verificationLink} onChange={(e) => persistDraft({ ...form, certifications: updateArrayItem(form.certifications, index, { verificationLink: e.target.value }) })} />
                                    {item.imageUrl ? (
                                        <div
                                            className="h-20 w-full rounded-lg border border-emerald-100 bg-cover bg-center md:col-span-2"
                                            style={{ backgroundImage: `url(${item.imageUrl})` }}
                                        />
                                    ) : null}
                                    <div className="flex flex-col gap-1 md:col-span-2">
                                        <label className="text-sm font-medium">Изображение сертификата</label>
                                        <input
                                        accept="image/*"
                                        className="rounded-lg border border-emerald-200 px-3 py-2"
                                        onChange={async (event) => {
                                            const file = event.target.files?.[0];
                                            if (!file) return;
                                            try {
                                                const imageData = await fileToDataUrl(file, { maxSize: 500 });
                                                const nextForm = { ...form, certifications: updateArrayItem(form.certifications, index, { imageUrl: imageData }) };
                                                persistDraft(nextForm);
                                                await saveToPlatform(nextForm, "Изображение сертификата сохранено");
                                            } finally {
                                                event.target.value = "";
                                            }
                                        }}
                                        type="file"
                                    />
                                    </div>
                                </div>
                            ))}
                            <button className="rounded-lg border border-emerald-300 px-3 py-2 text-sm" onClick={() => persistDraft({ ...form, certifications: [...form.certifications, { name: "", organization: "", issueDate: "", expirationDate: "", score: "", verificationLink: "", imageUrl: "" }] })} type="button">+ Add More Certification</button>
                        </div>
                    </>
                ) : null}

                {step === 6 ? (
                    <>
                        <h2 className="text-lg font-semibold">6) Достижения</h2>
                        <div className="space-y-3">
                            {form.awards.map((item, index) => (
                                <div className="grid gap-2 rounded-xl border border-emerald-100 p-3 md:grid-cols-2" key={`award-${index}`}>
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Award Title" value={item.title} onChange={(e) => persistDraft({ ...form, awards: updateArrayItem(form.awards, index, { title: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Organization" value={item.organization} onChange={(e) => persistDraft({ ...form, awards: updateArrayItem(form.awards, index, { organization: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Level" value={item.level} onChange={(e) => persistDraft({ ...form, awards: updateArrayItem(form.awards, index, { level: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" type="date" value={item.date} onChange={(e) => persistDraft({ ...form, awards: updateArrayItem(form.awards, index, { date: e.target.value }) })} />
                                    <textarea className="rounded-lg border border-emerald-200 px-3 py-2 md:col-span-2" placeholder="Description" value={item.description} onChange={(e) => persistDraft({ ...form, awards: updateArrayItem(form.awards, index, { description: e.target.value }) })} />
                                </div>
                            ))}
                            <button className="rounded-lg border border-emerald-300 px-3 py-2 text-sm" onClick={() => persistDraft({ ...form, awards: [...form.awards, { title: "", organization: "", level: "Local", date: "", description: "" }] })} type="button">+ Add More Award</button>
                        </div>

                        <h3 className="text-sm font-medium">Volunteering</h3>
                        <div className="space-y-3">
                            {form.volunteering.map((item, index) => (
                                <div className="grid gap-2 rounded-xl border border-emerald-100 p-3 md:grid-cols-2" key={`vol-${index}`}>
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Organization" value={item.organization} onChange={(e) => persistDraft({ ...form, volunteering: updateArrayItem(form.volunteering, index, { organization: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Role" value={item.role} onChange={(e) => persistDraft({ ...form, volunteering: updateArrayItem(form.volunteering, index, { role: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Duration" value={item.duration} onChange={(e) => persistDraft({ ...form, volunteering: updateArrayItem(form.volunteering, index, { duration: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Impact" value={item.impact} onChange={(e) => persistDraft({ ...form, volunteering: updateArrayItem(form.volunteering, index, { impact: e.target.value }) })} />
                                    <textarea className="rounded-lg border border-emerald-200 px-3 py-2 md:col-span-2" placeholder="Description" value={item.description} onChange={(e) => persistDraft({ ...form, volunteering: updateArrayItem(form.volunteering, index, { description: e.target.value }) })} />
                                </div>
                            ))}
                            <button className="rounded-lg border border-emerald-300 px-3 py-2 text-sm" onClick={() => persistDraft({ ...form, volunteering: [...form.volunteering, { organization: "", role: "", duration: "", description: "", impact: "" }] })} type="button">+ Add More Volunteering</button>
                        </div>
                    </>
                ) : null}

                {step === 7 ? (
                    <>
                        <h2 className="text-lg font-semibold">7) Optional Sections</h2>
                        <div className="grid gap-3 md:grid-cols-2">
                            <textarea className="rounded-xl border border-emerald-200 px-3 py-2 md:col-span-2" placeholder="Personal Statement" value={form.personalStatement} onChange={(e) => persistDraft({ ...form, personalStatement: e.target.value })} />
                            <textarea className="rounded-xl border border-emerald-200 px-3 py-2 md:col-span-2" placeholder="Career Goals" value={form.careerGoals} onChange={(e) => persistDraft({ ...form, careerGoals: e.target.value })} />
                            <input className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="Preferred Fields" value={form.preferredFields} onChange={(e) => persistDraft({ ...form, preferredFields: e.target.value })} />
                            <input className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="Video Presentation Link" value={form.videoPresentation} onChange={(e) => persistDraft({ ...form, videoPresentation: e.target.value })} />
                            <input className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="LinkedIn" value={form.linkedin} onChange={(e) => persistDraft({ ...form, linkedin: e.target.value })} />
                            <input className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="GitHub" value={form.github} onChange={(e) => persistDraft({ ...form, github: e.target.value })} />
                            <input className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="Personal Website" value={form.personalWebsite} onChange={(e) => persistDraft({ ...form, personalWebsite: e.target.value })} />
                            <input className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="Portfolio Link" value={form.portfolioLink} onChange={(e) => persistDraft({ ...form, portfolioLink: e.target.value })} />
                            <input className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="Preferred Countries" value={form.preferredCountries} onChange={(e) => persistDraft({ ...form, preferredCountries: e.target.value })} />
                            <select className="rounded-xl border border-emerald-200 px-3 py-2" value={form.availability} onChange={(e) => persistDraft({ ...form, availability: e.target.value })}>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                            </select>
                            <label className="flex items-center gap-2 text-sm"><input checked={form.willingToRelocate} type="checkbox" onChange={(e) => persistDraft({ ...form, willingToRelocate: e.target.checked })} />Willing to Relocate</label>
                            <label className="flex items-center gap-2 text-sm"><input checked={form.scholarshipNeeded} type="checkbox" onChange={(e) => persistDraft({ ...form, scholarshipNeeded: e.target.checked })} />Scholarship Needed</label>
                        </div>
                    </>
                ) : null}

                <div className="flex flex-wrap gap-3 pt-2">
                    <button
                                        className="rounded-lg border border-gray-300 px-4 py-2"
                                        onClick={() => setStep((current) => {
                                            const prev = current - 1;
                                            if (prev === 3) return 2;
                                            if (prev === 5) return 4;
                                            return Math.max(1, prev);
                                        })}
                                        type="button"
                                    >Back</button>
                    {step < 7 ? (
                        <button className="rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-70" disabled={saving} onClick={saveAndGoNext} type="button">{saving ? "Saving..." : "Далее"}</button>
                    ) : (
                        <button className="rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-70" disabled={saving} onClick={finishPortfolio} type="button">{saving ? "Saving..." : "Завершить"}</button>
                    )}
                    <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white disabled:opacity-70" disabled={saving} onClick={() => void saveToPlatform()} type="button">{saving ? "Saving..." : "Сохранить"}</button>
                </div>
                {status ? <p className="text-sm text-gray-700">{status}</p> : null}
                {showMissing && missingFields.length > 0 ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <p className="text-sm font-semibold text-amber-800">Не заполнены обязательные поля:</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {missingFields.map((item) => (
                                <button
                                    className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs text-amber-800"
                                    key={`${item.step}-${item.label}`}
                                    onClick={() => setStep(item.step)}
                                    type="button"
                                >
                                    Step {item.step}: {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : null}
            </section>
        </div>
    );
}
