"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type InterestItem = {
    _id: string;
    status: string;
    initiatedBy: string;
    createdAt: string;
    fromStudent?: { _id?: string; userId?: string; firstName?: string; lastName?: string };
};

export default function UniversityInterestsPage() {
    const router = useRouter();
    const [items, setItems] = useState<InterestItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [openingChat, setOpeningChat] = useState<string | null>(null);
    const [error, setError] = useState("");

    const loadData = useCallback(async () => {
        try {
            const res = await fetch("/api/applications/received");
            if (res.ok) {
                const data = (await res.json()) as { items?: InterestItem[] };
                const list = data.items ?? [];
                setItems(list.filter((i) => i.initiatedBy === "student"));
            } else {
                setItems([]);
            }
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    async function openChat(item: InterestItem) {
        const userId = item.fromStudent?.userId;
        if (!userId || openingChat) return;

        setOpeningChat(item._id);
        setError("");

        try {
            const [chatRes, statusRes] = await Promise.all([
                fetch("/api/chat/start", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ participantUserId: userId, relatedApplication: item._id }),
                }),
                fetch(`/api/applications/${item._id}/status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "accepted" }),
                }),
            ]);

            if (!chatRes.ok) {
                const payload = (await chatRes.json()) as { message?: string };
                setError(payload.message ?? "Не удалось открыть чат");
                return;
            }

            const conv = (await chatRes.json()) as { _id?: string };
            if (conv._id) {
                router.push(`/app/university/chats?conversation=${conv._id}`);
            }
            await loadData();
        } catch {
            setError("Сетевая ошибка");
        } finally {
            setOpeningChat(null);
        }
    }

    const interested = items.filter((i) => i.initiatedBy === "student");

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <h1 className="text-2xl font-bold text-amber-900">Отклики от студентов</h1>
            <p className="text-sm text-gray-600">
                Студенты, которые отметили интерес к вашему университету. Нажмите «Открыть чат», чтобы начать общение.
            </p>

            {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

            {loading ? (
                <p className="text-center text-gray-500">Загрузка…</p>
            ) : interested.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-amber-200 bg-white p-12">
                    <p className="text-gray-500">Пока нет откликов от студентов</p>
                    <p className="mt-2 text-sm text-gray-400">Студенты отмечают интерес к университету на странице «Университеты и интересы».</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {interested.map((item) => {
                        const name = [item.fromStudent?.firstName, item.fromStudent?.lastName].filter(Boolean).join(" ") || "Студент";
                        const isLoading = openingChat === item._id;
                        return (
                            <article
                                key={item._id}
                                className="flex items-center gap-4 rounded-xl border border-amber-200 bg-white p-4 shadow-sm"
                            >
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-xl font-bold text-white">
                                    {name.charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-amber-900">{name}</p>
                                    <p className="text-xs text-gray-500">
                                        Заинтересован · {new Date(item.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    className="shrink-0 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
                                    disabled={isLoading}
                                    onClick={() => void openChat(item)}
                                    type="button"
                                >
                                    {isLoading ? "Открываю…" : "Открыть чат"}
                                </button>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
