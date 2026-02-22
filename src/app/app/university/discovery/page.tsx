"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Student = {
    _id: string;
    userId?: string;
    personalInfo?: { firstName?: string; lastName?: string };
    rankingTier?: string;
    globalScore?: number;
};

export default function UniversityDiscoveryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<Student[]>([]);
    const [standardMessage, setStandardMessage] = useState("");
    const [tab, setTab] = useState<"discovery" | "offers" | "starred">("discovery");
    const [search, setSearch] = useState("");
    const [outreachStudent, setOutreachStudent] = useState<Student | null>(null);
    const [outreachText, setOutreachText] = useState("");
    const [outreachSending, setOutreachSending] = useState(false);
    const [outreachError, setOutreachError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const [dashboardRes, profileRes] = await Promise.all([
                    fetch("/api/university/dashboard"),
                    fetch("/api/university/profile"),
                ]);
                if (dashboardRes.ok) {
                    const payload = (await dashboardRes.json()) as { data?: { students?: Student[] } };
                    setStudents(payload.data?.students ?? []);
                }
                if (profileRes.ok) {
                    const profileData = (await profileRes.json()) as { data?: { outreachMessage?: string } };
                    setStandardMessage(profileData.data?.outreachMessage ?? "");
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

    const openOutreach = useCallback((student: Student) => {
        setOutreachStudent(student);
        setOutreachText(standardMessage);
        setOutreachError("");
    }, [standardMessage]);

    const sendOutreach = useCallback(async () => {
        if (!outreachStudent?.userId) return;

        setOutreachSending(true);
        setOutreachError("");

        try {
            const inviteRes = await fetch("/api/applications/invite-by-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetUserId: outreachStudent.userId,
                    message: outreachText.trim() || undefined,
                }),
            });

            if (!inviteRes.ok) {
                const payload = (await inviteRes.json()) as { message?: string };
                setOutreachError(payload.message ?? "Не удалось отправить");
                return;
            }

            const chatRes = await fetch("/api/chat/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ participantUserId: outreachStudent.userId }),
            });

            if (!chatRes.ok) {
                setOutreachError("Чат не создан");
                return;
            }

            const conv = (await chatRes.json()) as { _id?: string };

            if (conv._id && outreachText.trim()) {
                await fetch(`/api/chat/${conv._id}/messages`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: outreachText.trim() }),
                });
            }

            setOutreachStudent(null);
            setOutreachText("");
            if (conv._id) router.push(`/app/university/chats?conversation=${conv._id}`);
        } catch {
            setOutreachError("Сетевая ошибка");
        } finally {
            setOutreachSending(false);
        }
    }, [outreachStudent, outreachText, router]);

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <h1 className="text-2xl font-bold text-amber-900">Discovery</h1>

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
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
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
                    placeholder={tab === "starred" ? "Search favourites by student..." : "Search students"}
                    className="flex-1 rounded-xl border border-amber-200 px-4 py-2"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="rounded-2xl border border-amber-200 bg-white p-8">
                {loading ? (
                    <p className="text-center text-gray-500">Loading...</p>
                ) : filtered.length === 0 ? (
                    <p className="text-center text-gray-500">No {tab === "starred" ? "favourites" : "students"} found</p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.slice(0, 12).map((s) => {
                            const name = [s.personalInfo?.firstName, s.personalInfo?.lastName].filter(Boolean).join(" ") || "Student";
                            return (
                                <article
                                    key={s._id}
                                    className="flex flex-col gap-3 rounded-xl border border-amber-100 p-4 transition hover:bg-amber-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-lg font-bold text-white">
                                            {name.charAt(0)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium text-amber-900">{name}</p>
                                            <p className="text-xs text-gray-500">{s.rankingTier ?? "—"} · Score: {s.globalScore ?? 0}</p>
                                        </div>
                                    </div>
                                    <button
                                        className="w-full rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600"
                                        onClick={() => openOutreach(s)}
                                        type="button"
                                    >
                                        Написать студенту
                                    </button>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>

            {outreachStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-6 shadow-xl">
                        <h2 className="text-lg font-semibold text-amber-900">
                            Написать {[outreachStudent.personalInfo?.firstName, outreachStudent.personalInfo?.lastName].filter(Boolean).join(" ") || "студенту"}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">Сообщение создаст чат и сразу отправится студенту.</p>
                        <textarea
                            className="mt-4 min-h-[120px] w-full rounded-xl border border-amber-200 px-3 py-2"
                            placeholder="Напишите сообщение..."
                            value={outreachText}
                            onChange={(e) => setOutreachText(e.target.value)}
                        />
                        {outreachError && <p className="mt-2 text-sm text-red-600">{outreachError}</p>}
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                className="rounded-lg border border-amber-200 px-4 py-2 text-sm"
                                onClick={() => { setOutreachStudent(null); setOutreachError(""); }}
                                type="button"
                            >
                                Отмена
                            </button>
                            <button
                                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
                                disabled={outreachSending}
                                onClick={() => void sendOutreach()}
                                type="button"
                            >
                                {outreachSending ? "Отправка…" : "Отправить"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
