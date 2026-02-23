"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type University = { _id: string; universityName?: string; country?: string; logoUrl?: string; logo?: string };

export default function ExploreUniversitiesPage() {
    const [universities, setUniversities] = useState<University[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Explore Universities</h1>
            <p className="text-gray-600">
                Изучайте университеты и отметьте интерес к тем, куда хотите податься.
            </p>

            {loading ? (
                <p className="text-gray-500">Загрузка...</p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {universities.map((u) => {
                        const logo = u.logoUrl || u.logo;
                        return (
                            <Link
                                key={u._id}
                                href={`/app/applications`}
                                className="card flex items-center gap-4 p-4 transition hover:shadow-md"
                            >
                                {logo ? (
                                    <img
                                        src={logo}
                                        alt=""
                                        className="h-14 w-14 rounded-xl object-cover"
                                    />
                                ) : (
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-lg font-bold text-emerald-700">
                                        U
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-gray-900">{u.universityName ?? "University"}</p>
                                    <p className="text-sm text-gray-500">{u.country ?? ""}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {!loading && universities.length === 0 && (
                <p className="text-gray-500">Пока нет доступных университетов.</p>
            )}
        </div>
    );
}
