"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Student = {
    _id: string;
    personalInfo?: { firstName?: string; lastName?: string };
    rankingTier?: string;
    globalScore?: number;
};

export default function UniversityDiscoveryPage() {
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<Student[]>([]);
    const [tab, setTab] = useState<"discovery" | "offers" | "starred">("discovery");
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/university/dashboard");
                if (res.ok) {
                    const payload = (await res.json()) as { data?: { students?: Student[] } };
                    setStudents(payload.data?.students ?? []);
                }
            } catch {
                setStudents([]);
            } finally {
                setLoading(false);
            }
        }
        void load();
    }, []);

    const filtered = students.filter((s) => {
        const name = [s.personalInfo?.firstName, s.personalInfo?.lastName].filter(Boolean).join(" ");
        return !search.trim() || name.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <h1 className="text-2xl font-bold text-amber-900">Offers</h1>

            <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
                    <h2 className="text-base font-semibold">Application Status</h2>
                    <div className="mt-4 flex items-center justify-center">
                        <div className="relative h-32 w-48">
                            <svg viewBox="0 0 100 50" className="h-full w-full">
                                <path d="M 10 45 A 40 40 0 0 1 90 45" fill="none" stroke="#fef3c7" strokeWidth="8" strokeLinecap="round" />
                                <path
                                    d="M 10 45 A 40 40 0 0 1 90 45"
                                    fill="none"
                                    stroke="#f59e0b"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray="70 126"
                                    strokeDashoffset="0"
                                />
                            </svg>
                            <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-gray-500">
                                Bachelors: 87%
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="rounded bg-amber-100 px-2 py-1">Diploma 3%</span>
                        <span className="rounded bg-amber-200 px-2 py-1">Bachelors 87%</span>
                        <span className="rounded bg-amber-100 px-2 py-1">Masters 10%</span>
                    </div>
                </section>

                <section className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
                    <h2 className="text-base font-semibold">Daily Offers Sent</h2>
                    <div className="mt-4 flex h-32 items-end justify-around gap-1">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                            <div key={day} className="flex flex-1 flex-col items-center gap-1">
                                <div className="h-8 w-full max-w-[24px] rounded-t bg-amber-200/50" style={{ height: "8px" }} />
                                <span className="text-[10px] text-gray-500">{day}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-2 flex gap-4 text-xs">
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Sent</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-300" /> Accepted</span>
                    </div>
                </section>
            </div>

            <div className="flex gap-2 border-b border-amber-200 pb-2">
                {(["discovery", "offers", "starred"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${tab === t ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-900"}`}
                    >
                        {t === "discovery" ? "Student Discovery" : t}
                    </button>
                ))}
            </div>

            <div className="flex gap-4">
                <input
                    type="search"
                    placeholder={tab === "starred" ? "Search favourites by student..." : "Search Offers"}
                    className="flex-1 rounded-xl border border-amber-200 px-4 py-2"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white">
                    Create an offer
                </button>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-white p-8">
                {loading ? (
                    <p className="text-center text-gray-500">Loading...</p>
                ) : filtered.length === 0 ? (
                    <p className="text-center text-gray-500">No {tab === "starred" ? "favourites" : "offers"} found</p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.slice(0, 12).map((s) => {
                            const name = [s.personalInfo?.firstName, s.personalInfo?.lastName].filter(Boolean).join(" ") || "Student";
                            return (
                                <Link
                                    key={s._id}
                                    href={`/app/applications?student=${s._id}`}
                                    className="flex items-center gap-3 rounded-xl border border-amber-100 p-4 transition hover:bg-amber-50"
                                >
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-lg font-bold text-white">
                                        {name.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium text-amber-900">{name}</p>
                                        <p className="text-xs text-gray-500">{s.rankingTier ?? "—"} · Score: {s.globalScore ?? 0}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
