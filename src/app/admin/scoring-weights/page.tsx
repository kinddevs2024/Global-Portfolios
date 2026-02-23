"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Weights = Record<string, number>;

export default function AdminScoringWeightsPage() {
    const [weights, setWeights] = useState<Weights | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/admin/scoring-weights", { credentials: "include" });
                if (!res.ok) {
                    setError("Failed to load weights");
                    return;
                }
                const data = (await res.json()) as { weights?: Weights };
                setWeights(data.weights ?? null);
            } catch {
                setError("Network error");
            } finally {
                setLoading(false);
            }
        }
        void load();
    }, []);

    return (
        <div className="min-h-screen px-6 py-10 md:px-12">
            <main className="mx-auto max-w-2xl space-y-6">
                <Link href="/admin/dashboard" className="text-sm text-gray-600 hover:underline">
                    ← Admin dashboard
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Scoring Weights</h1>
                <p className="text-sm text-gray-600">
                    Weights used for student rating. Backend may read from env (RATING_WEIGHTS_JSON); runtime updates might not persist.
                </p>

                {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

                {loading ? (
                    <p className="text-gray-500">Loading…</p>
                ) : weights && Object.keys(weights).length > 0 ? (
                    <div className="card overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="p-3 font-medium">Factor</th>
                                    <th className="p-3 font-medium text-right">Weight</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(weights).map(([key, value]) => (
                                    <tr key={key} className="border-b last:border-0">
                                        <td className="p-3">{key}</td>
                                        <td className="p-3 text-right">
                                            {typeof value === "number" ? (value * 100).toFixed(1) : value}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500">No weights configured.</p>
                )}
            </main>
        </div>
    );
}
