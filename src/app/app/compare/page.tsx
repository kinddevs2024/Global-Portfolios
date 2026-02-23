"use client";

import { useEffect, useState } from "react";

type University = { _id: string; universityName?: string; country?: string };

export default function CompareUniversitiesPage() {
    const [universities, setUniversities] = useState<University[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<string[]>([]);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/universities");
                if (res.ok) {
                    const payload = (await res.json()) as University[] | { items?: University[]; data?: University[] };
                    const list = Array.isArray(payload) ? payload : payload.items ?? payload.data ?? [];
                    setUniversities(list);
                }
            } catch {
                setUniversities([]);
            } finally {
                setLoading(false);
            }
        }
        void load();
    }, []);

    const toggle = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
        );
    };

    const toCompare = selected
        .map((id) => universities.find((u) => u._id === id))
        .filter((u): u is University => Boolean(u));

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Compare Universities</h1>
            <p className="text-gray-600">
                Выберите до 3 университетов для сравнения.
            </p>

            {loading ? (
                <p className="text-gray-500">Загрузка...</p>
            ) : (
                <>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {universities.map((u) => {
                            const isSelected = selected.includes(u._id);
                            return (
                                <button
                                    key={u._id}
                                    type="button"
                                    onClick={() => toggle(u._id)}
                                    className={`rounded-xl border-2 p-4 text-left transition ${
                                        isSelected ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-emerald-200"
                                    }`}
                                >
                                    <p className="font-medium text-gray-900">{u.universityName ?? "University"}</p>
                                    <p className="text-sm text-gray-500">{u.country ?? ""}</p>
                                    <p className="mt-2 text-xs text-emerald-600">
                                        {isSelected ? "✓ В сравнении" : "Добавить к сравнению"}
                                    </p>
                                </button>
                            );
                        })}
                    </div>

                    {toCompare.length > 0 && (
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold">Сравнение</h2>
                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full min-w-[400px] text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="py-2 pr-4 text-left font-medium text-gray-700">Критерий</th>
                                            {toCompare.map((u) => (
                                                <th key={u._id} className="py-2 px-4 text-left font-medium text-gray-900">
                                                    {u.universityName ?? "University"}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-2 pr-4 text-gray-600">Страна</td>
                                            {toCompare.map((u) => (
                                                <td key={u._id} className="py-2 px-4">{u.country ?? "—"}</td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
