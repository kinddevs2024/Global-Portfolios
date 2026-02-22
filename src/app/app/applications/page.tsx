"use client";

import { useCallback, useEffect, useState } from "react";

type University = { _id: string; universityName?: string; country?: string; logo?: string; logoUrl?: string; avatarUrl?: string };
type InterestItem = {
    _id: string;
    status: string;
    initiatedBy: "student" | "university";
    createdAt: string;
    toUniversity?: { _id?: string; universityName?: string };
};

export default function ApplicationsPage() {
    const [universities, setUniversities] = useState<University[]>([]);
    const [interests, setInterests] = useState<InterestItem[]>([]);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        const [universitiesRes, interestsRes] = await Promise.all([
            fetch("/api/universities"),
            fetch("/api/applications/my"),
        ]);

        if (universitiesRes.ok) {
            const payload = (await universitiesRes.json()) as University[] | { items?: University[]; data?: University[] };
            const normalized = Array.isArray(payload) ? payload : payload.items ?? payload.data ?? [];
            setUniversities(normalized);
        }

        if (interestsRes.ok) {
            const payload = (await interestsRes.json()) as { items?: InterestItem[] };
            setInterests(payload.items ?? []);
        }
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const interestedIds = new Set(interests.map((i) => i.toUniversity?._id ?? "").filter(Boolean));

    async function expressInterest(university: University) {
        if (submitting || interestedIds.has(university._id)) return;

        setSubmitting(university._id);
        setError("");

        try {
            const response = await fetch("/api/applications/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ toUniversity: university._id, message: "" }),
            });

            if (!response.ok) {
                const payload = (await response.json()) as { error?: string };
                setError(payload.error ?? "Не удалось отправить интерес");
                return;
            }

            await loadData();
        } catch {
            setError("Сетевая ошибка. Повторите попытку.");
        } finally {
            setSubmitting(null);
        }
    }

    return (
        <div className="space-y-6">
            <section className="card p-6">
                <h1 className="text-2xl font-bold">Университеты и интересы</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Отметьте университеты, которые вам интересны. Вам достаточно нажать «Я интересуюсь». Университеты видят отклики и могут открыть чат.
                </p>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
                <article className="card p-4"><p className="text-xs text-gray-500">Всего интересов</p><p className="text-2xl font-bold">{interests.length}</p></article>
                <article className="card p-4"><p className="text-xs text-gray-500">Чат доступен</p><p className="text-2xl font-bold">{interests.filter((i) => i.status === "accepted").length}</p></article>
            </section>

            <section className="card p-6">
                <h2 className="text-lg font-semibold">Университеты</h2>
                <p className="mt-2 text-sm text-gray-600">Выберите университет и нажмите «Я интересуюсь этим университетом».</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {universities.length === 0 ? <p className="text-sm text-gray-600">Пока нет доступных университетов.</p> : null}
                    {universities.map((university) => {
                        const logo = university.logoUrl || university.logo || university.avatarUrl;
                        const isInterested = interestedIds.has(university._id);
                        const loading = submitting === university._id;
                        return (
                            <article className="rounded-xl border border-emerald-100 p-4" key={university._id}>
                                <div className="flex items-center gap-3">
                                    {logo ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img alt={university.universityName ?? "University logo"} className="h-12 w-12 rounded-xl object-cover" src={logo} />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700">U</div>
                                    )}
                                    <div>
                                        <p className="font-medium">{university.universityName ?? "University"}</p>
                                        <p className="text-xs text-gray-500">{university.country ?? "Country not specified"}</p>
                                    </div>
                                </div>
                                <button
                                    className="mt-4 rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white disabled:opacity-70"
                                    disabled={loading || isInterested}
                                    onClick={() => void expressInterest(university)}
                                    type="button"
                                >
                                    {loading ? "Отправка…" : isInterested ? "Уже отмечено" : "Я интересуюсь этим университетом"}
                                </button>
                            </article>
                        );
                    })}
                </div>
                {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
            </section>

            <section className="card p-6">
                <h2 className="text-lg font-semibold">Мои интересы</h2>
                <div className="mt-4 space-y-3">
                    {interests.length === 0 ? <p className="text-sm text-gray-600">Пока интересов нет.</p> : null}
                    {interests.map((item) => (
                        <article className="rounded-xl border border-gray-100 p-4" key={item._id}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="font-medium">{item.toUniversity?.universityName ?? "University"}</p>
                                <span className={`rounded-full px-3 py-1 text-xs ${item.status === "accepted" ? "bg-emerald-100 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                                    {item.status === "accepted" ? "Чат открыт" : item.status === "pending" ? "Ожидание" : item.status}
                                </span>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                {new Date(item.createdAt).toLocaleString()} · {item.initiatedBy === "student" ? "Вы откликнулись" : "Университет написал вам"}
                            </p>
                            {item.status === "accepted" ? (
                                <a className="mt-2 inline-block text-sm text-emerald-700 underline" href="/app/chats">
                                    Перейти в чат →
                                </a>
                            ) : null}
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}
