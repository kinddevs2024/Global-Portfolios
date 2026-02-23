"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type University = {
    _id: string;
    universityInfo?: { name?: string };
};
type Student = {
    _id: string;
    personalInfo?: { firstName?: string; lastName?: string };
    rankingTier?: string;
};
type DashboardData = {
    university?: University;
    students?: Student[];
};

function computeProfileProgress(university: University | undefined): number {
    if (!university?.universityInfo) return 0;
    const info = university.universityInfo as Record<string, unknown>;
    let filled = 0;
    if (info.name && String(info.name).trim()) filled++;
    if (info.country && String(info.country).trim()) filled++;
    if (info.tagline && String(info.tagline).trim()) filled++;
    if (info.yearEstablished != null) filled++;
    if (info.numberOfStudents != null) filled++;
    if (info.logoShort && String(info.logoShort).trim()) filled++;
    return Math.round((filled / 6) * 100);
}

export default function UniversityDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/university/dashboard");
                if (!res.ok) {
                    if (res.status === 401 || res.status === 403) {
                        window.location.assign("/auth/login");
                        return;
                    }
                    setData({ university: undefined, students: [] });
                    return;
                }
                const payload = (await res.json()) as { data?: DashboardData };
                setData(payload.data ?? null);
            } catch {
                setData(null);
            } finally {
                setLoading(false);
            }
        }
        void load();
    }, []);

    if (loading) {
        return <div className="rounded-2xl border border-emerald-200 bg-white p-8">Загрузка...</div>;
    }

    const uni = data?.university;
    const students = data?.students ?? [];
    const progress = computeProfileProgress(uni);

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <h1 className="text-2xl font-bold text-emerald-900">Dashboard</h1>

            <div className="grid gap-6 lg:grid-cols-3">
                <section className="lg:col-span-2 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-6 text-white shadow-xl">
                    <h2 className="text-xl font-bold">
                        Welcome, <span className="text-emerald-100">{uni?.universityInfo?.name ?? "University"}</span>!
                    </h2>
                    <p className="mt-2 text-emerald-100/90">Manage applications and discover top students.</p>
                    <Link
                        href="/app/university/discovery"
                        className="mt-4 inline-block rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
                    >
                        Boost Enrollment
                    </Link>
                    <div className="mt-4 flex justify-end">
                        <span className="text-6xl opacity-20">🎓</span>
                    </div>
                </section>

                <section className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
                    <h2 className="text-base font-semibold text-emerald-900">
                        Profile progress: <span className="text-emerald-600">{progress}%</span>
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">Complete your University Profile for students to view.</p>
                    <Link
                        href="/app/university/profile"
                        className="mt-4 inline-block rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
                    >
                        Complete your Profile
                    </Link>
                    <div className="mt-4 flex justify-end">
                        <div className="relative h-20 w-20">
                            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="16" fill="none" stroke="#d1fae5" strokeWidth="3" />
                                <circle
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="none"
                                    stroke="#059669"
                                    strokeWidth="3"
                                    strokeDasharray={`${progress} 100`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-emerald-600">
                                {progress}%
                            </span>
                        </div>
                    </div>
                </section>
            </div>

            <section className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-emerald-900">Featured Student Profiles</h2>
                        <p className="mt-1 text-sm text-gray-600">Profiles with strong engagement and interest.</p>
                    </div>
                    <Link href="/app/university/discovery" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                        View all students →
                    </Link>
                </div>
                <div className="mt-6 flex gap-6 overflow-x-auto pb-2">
                    {students.slice(0, 8).map((s) => {
                        const name = [s.personalInfo?.firstName, s.personalInfo?.lastName].filter(Boolean).join(" ") || "Student";
                        return (
                            <Link
                                key={s._id}
                                href={`/app/university/discovery?student=${s._id}`}
                                className="flex shrink-0 flex-col items-center gap-2 rounded-xl p-3 transition hover:bg-emerald-50"
                            >
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 to-emerald-500 text-xl font-bold text-white">
                                    {name.charAt(0)}
                                </div>
                                <p className="max-w-[100px] truncate text-center text-sm font-medium text-emerald-900">{name}</p>
                                {s.rankingTier && (
                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">{s.rankingTier}</span>
                                )}
                            </Link>
                        );
                    })}
                    {students.length === 0 && (
                        <p className="py-8 text-center text-gray-500">No students yet. Complete your profile to discover candidates.</p>
                    )}
                </div>
            </section>
        </div>
    );
}
