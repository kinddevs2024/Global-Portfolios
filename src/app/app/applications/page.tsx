"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type University = { _id: string; universityName?: string; country?: string; logo?: string; logoUrl?: string; avatarUrl?: string };
type ApplicationItem = {
    _id: string;
    status: "pending" | "accepted" | "rejected" | "withdrawn";
    initiatedBy: "student" | "university";
    message?: string;
    createdAt: string;
    toUniversity?: { _id?: string; universityName?: string };
};

export default function ApplicationsPage() {
    const [universities, setUniversities] = useState<University[]>([]);
    const [applications, setApplications] = useState<ApplicationItem[]>([]);
    const [activeUniversity, setActiveUniversity] = useState<University | null>(null);
    const [messageDraft, setMessageDraft] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const loadData = useCallback(async () => {
        const [universitiesRes, applicationsRes] = await Promise.all([
            fetch("/api/universities"),
            fetch("/api/applications/my"),
        ]);

        if (universitiesRes.ok) {
            const payload = (await universitiesRes.json()) as University[] | { items?: University[]; data?: University[] };
            const normalized = Array.isArray(payload) ? payload : payload.items ?? payload.data ?? [];
            setUniversities(normalized);
        }

        if (applicationsRes.ok) {
            const payload = (await applicationsRes.json()) as { items?: ApplicationItem[] };
            setApplications(payload.items ?? []);
        }
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const acceptedCount = useMemo(
        () => applications.filter((item) => item.status === "accepted").length,
        [applications],
    );

    async function submitApplication(university: University) {
        if (submitting) return;

        setSubmitting(true);
        setError("");

        try {
            const response = await fetch("/api/applications/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ toUniversity: university._id, message: messageDraft }),
            });

            if (!response.ok) {
                const payload = (await response.json()) as { error?: string };
                setError(payload.error ?? "Не удалось отправить заявку");
                return;
            }

            setMessageDraft("");
            setActiveUniversity(null);
            await loadData();
        } catch {
            setError("Сетевая ошибка. Повторите попытку.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="space-y-6">
            <section className="card p-6">
                <h1 className="text-2xl font-bold">Подать заявки</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Подавайте заявки университетам, как в карьерных платформах. Университеты также могут присылать вам приглашения.
                </p>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
                <article className="card p-4"><p className="text-xs text-gray-500">Всего заявок</p><p className="text-2xl font-bold">{applications.length}</p></article>
                <article className="card p-4"><p className="text-xs text-gray-500">Принято</p><p className="text-2xl font-bold">{acceptedCount}</p></article>
                <article className="card p-4"><p className="text-xs text-gray-500">Чат доступен</p><p className="text-2xl font-bold">{acceptedCount}</p></article>
            </section>

            <section className="card p-6">
                <h2 className="text-lg font-semibold">Университеты</h2>
                <p className="mt-2 text-sm text-gray-600">Выберите университет из карточек и нажмите “Поднять заявку”.</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {universities.length === 0 ? <p className="text-sm text-gray-600">Пока нет доступных университетов.</p> : null}
                    {universities.map((university) => {
                        const logo = university.logoUrl || university.logo || university.avatarUrl;
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
                                    className="mt-4 rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white"
                                    onClick={() => {
                                        setError("");
                                        setMessageDraft("");
                                        setActiveUniversity(university);
                                    }}
                                    type="button"
                                >
                                    Поднять заявку
                                </button>
                            </article>
                        );
                    })}
                </div>
            </section>

            {activeUniversity ? (
                <section className="card p-6">
                    <h2 className="text-lg font-semibold">Заявка в {activeUniversity.universityName ?? "университет"}</h2>
                    <p className="mt-2 text-sm text-gray-600">Оставьте сообщение и отправьте заявку.</p>

                    <div className="mt-4 space-y-4">
                        <textarea
                            className="min-h-32 w-full rounded-xl border border-emerald-200 px-3 py-2"
                            onChange={(event) => setMessageDraft(event.target.value)}
                            placeholder="Напишите сообщение для университета..."
                            value={messageDraft}
                        />

                        {error ? <p className="text-sm text-red-600">{error}</p> : null}

                        <div className="flex flex-wrap gap-3">
                            <button className="rounded-lg border border-gray-300 px-3 py-2 text-sm" onClick={() => setActiveUniversity(null)} type="button">
                                Отмена
                            </button>
                            <button
                                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-70"
                                disabled={submitting}
                                onClick={() => void submitApplication(activeUniversity)}
                                type="button"
                            >
                                {submitting ? "Отправка..." : "Оставить заявку"}
                            </button>
                        </div>
                    </div>
                </section>
            ) : null}

            <section className="card p-6">
                <h2 className="text-lg font-semibold">Мои заявки</h2>
                <div className="mt-4 space-y-3">
                    {applications.length === 0 ? <p className="text-sm text-gray-600">Пока заявок нет.</p> : null}
                    {applications.map((application) => (
                        <article className="rounded-xl border border-gray-100 p-4" key={application._id}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="font-medium">{application.toUniversity?.universityName ?? "University"}</p>
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs">{application.status}</span>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                {new Date(application.createdAt).toLocaleString()} · initiated by {application.initiatedBy}
                            </p>
                            {application.message ? <p className="mt-2 text-sm text-gray-700">{application.message}</p> : null}
                            {application.status === "accepted" ? (
                                <p className="mt-2 text-sm text-emerald-700">Заявка принята — можно общаться через чат.</p>
                            ) : null}
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}
