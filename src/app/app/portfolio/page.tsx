"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

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

const STORAGE_KEY = "gp:portfolio:v1";

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
    "Skills",
    "Certifications",
    "Experience",
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

async function fileToDataUrl(file: File) {
    return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
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

    if (!hasText(form.hardSkills[0]?.name)) missing.push({ label: "Hard Skill", step: 3 });
    if (!hasText(form.softSkills[0]?.name)) missing.push({ label: "Soft Skill", step: 3 });

    if (!hasText(form.certifications[0]?.name)) missing.push({ label: "Certification Name", step: 4 });
    if (!hasText(form.certifications[0]?.organization)) missing.push({ label: "Certification Organization", step: 4 });

    if (!hasText(form.internships[0]?.companyName)) missing.push({ label: "Internship: Company Name", step: 5 });
    if (!hasText(form.internships[0]?.position)) missing.push({ label: "Internship: Position", step: 5 });
    if (!hasText(form.projects[0]?.title)) missing.push({ label: "Project Title", step: 5 });
    if (!hasText(form.projects[0]?.description)) missing.push({ label: "Project Description", step: 5 });

    if (!hasText(form.awards[0]?.title)) missing.push({ label: "Award Title", step: 6 });
    if (!hasText(form.awards[0]?.organization)) missing.push({ label: "Award Organization", step: 6 });

    if (!hasText(form.personalStatement)) missing.push({ label: "Personal Statement", step: 7 });
    if (!hasText(form.careerGoals)) missing.push({ label: "Career Goals", step: 7 });
    if (!hasText(form.preferredFields)) missing.push({ label: "Preferred Fields", step: 7 });

    return missing;
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
    const autoSyncAttemptedRef = useRef(false);
    const [step, setStep] = useState(1);
    const [form, setForm] = useState<PortfolioState>(defaultState);
    const [status, setStatus] = useState("");
    const [saving, setSaving] = useState(false);
    const [showMissing, setShowMissing] = useState(false);

    useEffect(() => {
        const requestedStep = Number(searchParams.get("step"));
        if (Number.isInteger(requestedStep) && requestedStep >= 1 && requestedStep <= steps.length) {
            setStep(requestedStep);
        }
    }, [searchParams]);

    useEffect(() => {
        let parsedDraft: PortfolioState | null = null;
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                const parsed = JSON.parse(raw) as PortfolioState;
                parsedDraft = parsed;
                setForm((current) => ({ ...current, ...parsed }));
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }

        async function loadPlatformData() {
            let emailFromAuth = "";
            const [meRes, profileRes] = await Promise.all([fetch("/api/auth/me"), fetch("/api/profile")]);
            if (meRes.ok) {
                const payload = (await meRes.json()) as { data?: { email?: string } };
                if (payload.data?.email) {
                    emailFromAuth = payload.data.email;
                    setForm((current) => ({ ...current, email: payload.data?.email ?? current.email }));
                }
            }

            let hasBackendProfile = false;
            if (profileRes.ok) {
                const payload = (await profileRes.json()) as {
                    data?: {
                        personalInfo?: { firstName?: string; lastName?: string; country?: string; age?: number; language?: string };
                        academicInfo?: { gpa?: number };
                        skills?: Array<{ name?: string }>;
                        projects?: Array<{ name?: string; technologies?: string[] }>;
                    };
                };

                const profile = payload.data;
                if (!profile) return;
                hasBackendProfile = true;

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

            if (!hasBackendProfile && parsedDraft && !autoSyncAttemptedRef.current) {
                autoSyncAttemptedRef.current = true;

                const draftToSync = emailFromAuth
                    ? { ...parsedDraft, email: emailFromAuth }
                    : parsedDraft;

                try {
                    const response = await fetch("/api/profile", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(buildProfilePayload(draftToSync)),
                    });

                    if (response.ok) {
                        setStatus("Черновик портфолио автоматически пересохранен в профиль.");
                    }
                } catch {
                    // ignore auto-sync failures
                }
            }
        }

        void loadPlatformData();
    }, []);

    const missingFields = useMemo(() => getMissingFields(form), [form]);
    const completion = useMemo(() => {
        const totalRequired = 27;
        return Math.round(((totalRequired - missingFields.length) / totalRequired) * 100);
    }, [missingFields.length]);

    function persistDraft(next: PortfolioState) {
        setForm(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }

    async function saveToPlatform() {
        if (saving) return;
        setSaving(true);
        setStatus("Сохранение...");

        const payload = buildProfilePayload(form);

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

            localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
            setStatus("Портфолио сохранено");
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
            setStep((current) => Math.min(7, current + 1));
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
                    Заполните профиль по шагам. Все повторяющиеся блоки добавляются динамически через + Add More.
                </p>
                <p className="mt-3 text-sm font-medium text-emerald-700">Completion: {completion}%</p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-emerald-100"><div className="h-full bg-emerald-600 transition-all duration-500 ease-out" style={{ width: `${completion}%` }} /></div>
            </section>

            <section className="card p-4">
                <div className="flex flex-wrap gap-2">
                    {steps.map((label, index) => (
                        <button
                            className={`rounded-lg px-3 py-2 text-sm ${step === index + 1 ? "bg-emerald-600 text-white" : "bg-emerald-50"}`}
                            key={label}
                            onClick={() => setStep(index + 1)}
                            type="button"
                        >
                            Step {index + 1}
                        </button>
                    ))}
                </div>
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
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium">Или загрузите фото с устройства</label>
                                <input
                                    accept="image/*"
                                    className="w-full rounded-xl border border-emerald-200 px-3 py-2"
                                    onChange={async (event) => {
                                        const file = event.target.files?.[0];
                                        if (!file) return;
                                        const imageData = await fileToDataUrl(file);
                                        persistDraft({ ...form, profilePhoto: imageData });
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

                {step === 3 ? (
                    <>
                        <h2 className="text-lg font-semibold">3) Навыки</h2>
                        <h3 className="text-sm font-medium">Hard Skills</h3>
                        <div className="space-y-2">
                            {form.hardSkills.map((item, index) => (
                                <div className="grid gap-2 md:grid-cols-2" key={`hard-${index}`}>
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Skill name" value={item.name} onChange={(e) => persistDraft({ ...form, hardSkills: updateArrayItem(form.hardSkills, index, { name: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Self rating 1-5" value={item.level} onChange={(e) => persistDraft({ ...form, hardSkills: updateArrayItem(form.hardSkills, index, { level: e.target.value }) })} />
                                </div>
                            ))}
                            <button className="rounded-lg border border-emerald-300 px-3 py-2 text-sm" onClick={() => persistDraft({ ...form, hardSkills: [...form.hardSkills, { name: "", level: "3" }] })} type="button">+ Add More Hard Skill</button>
                        </div>

                        <h3 className="text-sm font-medium">Soft Skills</h3>
                        <div className="space-y-2">
                            {form.softSkills.map((item, index) => (
                                <div className="grid gap-2 md:grid-cols-2" key={`soft-${index}`}>
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Skill name" value={item.name} onChange={(e) => persistDraft({ ...form, softSkills: updateArrayItem(form.softSkills, index, { name: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Self rating 1-5" value={item.level} onChange={(e) => persistDraft({ ...form, softSkills: updateArrayItem(form.softSkills, index, { level: e.target.value }) })} />
                                </div>
                            ))}
                            <button className="rounded-lg border border-emerald-300 px-3 py-2 text-sm" onClick={() => persistDraft({ ...form, softSkills: [...form.softSkills, { name: "", level: "3" }] })} type="button">+ Add More Soft Skill</button>
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
                                    <input
                                        accept="image/*"
                                        className="rounded-lg border border-emerald-200 px-3 py-2"
                                        onChange={async (event) => {
                                            const file = event.target.files?.[0];
                                            if (!file) return;
                                            const imageData = await fileToDataUrl(file);
                                            persistDraft({ ...form, certifications: updateArrayItem(form.certifications, index, { imageUrl: imageData }) });
                                        }}
                                        type="file"
                                    />
                                    {item.imageUrl ? (
                                        <div className="relative h-20 w-full overflow-hidden rounded-lg border border-emerald-100 md:col-span-2">
                                            <Image alt="Certificate preview" fill src={item.imageUrl} unoptimized className="object-cover" />
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                            <button className="rounded-lg border border-emerald-300 px-3 py-2 text-sm" onClick={() => persistDraft({ ...form, certifications: [...form.certifications, { name: "", organization: "", issueDate: "", expirationDate: "", score: "", verificationLink: "", imageUrl: "" }] })} type="button">+ Add More Certification</button>
                        </div>
                    </>
                ) : null}

                {step === 5 ? (
                    <>
                        <h2 className="text-lg font-semibold">5) Профессиональный блок</h2>
                        <h3 className="text-sm font-medium">Internships</h3>
                        <div className="space-y-3">
                            {form.internships.map((item, index) => (
                                <div className="grid gap-2 rounded-xl border border-emerald-100 p-3 md:grid-cols-2" key={`intern-${index}`}>
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Company Name" value={item.companyName} onChange={(e) => persistDraft({ ...form, internships: updateArrayItem(form.internships, index, { companyName: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Position" value={item.position} onChange={(e) => persistDraft({ ...form, internships: updateArrayItem(form.internships, index, { position: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Country" value={item.country} onChange={(e) => persistDraft({ ...form, internships: updateArrayItem(form.internships, index, { country: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Skills Gained" value={item.skillsGained} onChange={(e) => persistDraft({ ...form, internships: updateArrayItem(form.internships, index, { skillsGained: e.target.value }) })} />
                                    <textarea className="rounded-lg border border-emerald-200 px-3 py-2 md:col-span-2" placeholder="Description" value={item.description} onChange={(e) => persistDraft({ ...form, internships: updateArrayItem(form.internships, index, { description: e.target.value }) })} />
                                </div>
                            ))}
                            <button className="rounded-lg border border-emerald-300 px-3 py-2 text-sm" onClick={() => persistDraft({ ...form, internships: [...form.internships, { companyName: "", position: "", country: "", startDate: "", endDate: "", description: "", skillsGained: "" }] })} type="button">+ Add More Internship</button>
                        </div>

                        <h3 className="text-sm font-medium">Projects</h3>
                        <div className="space-y-3">
                            {form.projects.map((item, index) => (
                                <div className="grid gap-2 rounded-xl border border-emerald-100 p-3 md:grid-cols-2" key={`proj-${index}`}>
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Project Title" value={item.title} onChange={(e) => persistDraft({ ...form, projects: updateArrayItem(form.projects, index, { title: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Role" value={item.role} onChange={(e) => persistDraft({ ...form, projects: updateArrayItem(form.projects, index, { role: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Technologies Used" value={item.technologies} onChange={(e) => persistDraft({ ...form, projects: updateArrayItem(form.projects, index, { technologies: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Project Link" value={item.link} onChange={(e) => persistDraft({ ...form, projects: updateArrayItem(form.projects, index, { link: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Duration" value={item.duration} onChange={(e) => persistDraft({ ...form, projects: updateArrayItem(form.projects, index, { duration: e.target.value }) })} />
                                    <input className="rounded-lg border border-emerald-200 px-3 py-2" placeholder="Outcome" value={item.outcome} onChange={(e) => persistDraft({ ...form, projects: updateArrayItem(form.projects, index, { outcome: e.target.value }) })} />
                                    <textarea className="rounded-lg border border-emerald-200 px-3 py-2 md:col-span-2" placeholder="Description" value={item.description} onChange={(e) => persistDraft({ ...form, projects: updateArrayItem(form.projects, index, { description: e.target.value }) })} />
                                </div>
                            ))}
                            <button className="rounded-lg border border-emerald-300 px-3 py-2 text-sm" onClick={() => persistDraft({ ...form, projects: [...form.projects, { title: "", description: "", role: "", technologies: "", link: "", duration: "", outcome: "" }] })} type="button">+ Add More Project</button>
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
                    <button className="rounded-lg border border-gray-300 px-4 py-2" onClick={() => setStep((current) => Math.max(1, current - 1))} type="button">Back</button>
                    <button className="rounded-lg border border-gray-300 px-4 py-2" onClick={() => setStep((current) => Math.min(7, current + 1))} type="button">Next</button>
                    <button className="rounded-lg border border-emerald-300 px-4 py-2" onClick={() => localStorage.setItem(STORAGE_KEY, JSON.stringify(form))} type="button">Save Draft</button>
                    {step < 7 ? (
                        <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white disabled:opacity-70" disabled={saving} onClick={saveAndGoNext} type="button">{saving ? "Saving..." : "Сохранить и далее"}</button>
                    ) : (
                        <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white disabled:opacity-70" disabled={saving} onClick={finishPortfolio} type="button">{saving ? "Saving..." : "Закончить"}</button>
                    )}
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
