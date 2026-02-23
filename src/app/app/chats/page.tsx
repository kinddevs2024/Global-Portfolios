"use client";

import { useCallback, useEffect, useState } from "react";
import { usePortfolioSocketOptional } from "@/contexts/PortfolioSocketContext";

type Conversation = { _id: string; participants: string[]; updatedAt: string };

export default function StudentChatsPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const socketState = usePortfolioSocketOptional();

    const loadConversations = useCallback(async () => {
        try {
            const res = await fetch("/api/chat/conversations");
            if (res.ok) {
                const data = (await res.json()) as { items?: Conversation[] };
                setConversations(data.items ?? []);
            }
        } catch {
            setConversations([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadConversations();
    }, [loadConversations]);

    useEffect(() => {
        if (!socketState?.onMessage) return;
        const unsubscribe = socketState.onMessage(() => {
            void loadConversations();
        });
        return unsubscribe;
    }, [socketState, loadConversations]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Чаты</h1>
            <div className="relative">
                <input
                    type="search"
                    placeholder="Поиск чатов"
                    className="w-full rounded-xl border border-emerald-200 px-4 py-3 pl-10"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500">🔍</span>
            </div>
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-white p-12">
                {loading ? (
                    <p className="text-gray-500">Загрузка…</p>
                ) : conversations.length === 0 ? (
                    <>
                        <div className="flex gap-4 text-6xl opacity-30">💬 💬</div>
                        <p className="mt-6 text-lg text-gray-500">Пока тихо</p>
                        <p className="mt-2 text-sm text-gray-400">Чаты появятся после того, как университет откроет чат с вами или вы откликнетесь, и университет примет.</p>
                    </>
                ) : (
                    <div className="w-full space-y-2">
                        {conversations.map((c) => (
                            <a
                                key={c._id}
                                href={`/app/chats/${c._id}`}
                                className="block rounded-xl border border-emerald-100 p-4 transition hover:bg-emerald-50"
                            >
                                <p className="text-sm text-gray-500">Чат</p>
                                <p className="font-medium">{new Date(c.updatedAt).toLocaleString()}</p>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
