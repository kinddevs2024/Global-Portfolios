"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const WEIGHT_KEYS = ["academic", "olympiad", "projects", "skills", "activity", "aiPotential"] as const;
type WeightKey = (typeof WEIGHT_KEYS)[number];
const WEIGHT_LABELS: Record<WeightKey, string> = {
    academic: "Academic (GPA, exams)",
    olympiad: "Olympiads",
    projects: "Projects",
    skills: "Skills",
    activity: "Activity",
    aiPotential: "AI potential",
};

type Weights = Record<WeightKey, number>;

const defaultWeights: Weights = {
    academic: 1,
    olympiad: 1,
    projects: 1,
    skills: 1,
    activity: 1,
    aiPotential: 1,
};

export default function AdminScoringWeightsPage() {
    const [weights, setWeights] = useState<Weights>(defaultWeights);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [saveMessage, setSaveMessage] = useState("");

    const load = useCallback(async () => {
        try {
            setError("");
            const res = await fetch("/api/admin/scoring-weights", { credentials: "include" });
            if (!res.ok) {
                const data = (await res.json()) as { error?: string };
                setError(data.error ?? "Failed to load weights");
                return;
            }
            const data = (await res.json()) as { weights?: Partial<Weights> };
            if (data.weights && typeof data.weights === "object") {
                setWeights({ ...defaultWeights, ...data.weights } as Weights);
            }
        } catch {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSaveMessage("");
        try {
            const res = await fetch("/api/admin/scoring-weights", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(weights),
            });
            const data = (await res.json()) as { error?: string };
            if (!res.ok) {
                setError(data.error ?? "Failed to save");
                return;
            }
            setSaveMessage("Weights saved.");
        } catch {
            setError("Network error");
        } finally {
            setSaving(false);
        }
    }

    function setWeight(key: WeightKey, value: number) {
        setWeights((w) => ({ ...w, [key]: Math.max(0, value) }));
    }

    const total = WEIGHT_KEYS.reduce((s, k) => s + weights[k], 0);

    return (
        <div className="min-h-screen px-6 py-10 md:px-12">
            <main className="mx-auto max-w-2xl space-y-6">
                <Link href="/admin/dashboard" className="text-sm text-gray-600 hover:underline">
                    ← Admin dashboard
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Scoring Weights</h1>
                <p className="text-sm text-gray-600">
                    Weights used for student rating. Values are relative; they are normalized when calculating the score.
                </p>

                {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                {saveMessage && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{saveMessage}</p>}

                {loading ? (
                    <p className="text-gray-500">Loading…</p>
                ) : (
                    <form onSubmit={handleSave} className="card space-y-4">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="p-3 font-medium">Factor</th>
                                    <th className="p-3 font-medium text-right">Weight</th>
                                </tr>
                            </thead>
                            <tbody>
                                {WEIGHT_KEYS.map((key) => (
                                    <tr key={key} className="border-b border-gray-100 last:border-0">
                                        <td className="p-3">{WEIGHT_LABELS[key]}</td>
                                        <td className="p-3 text-right">
                                            <input
                                                type="number"
                                                min={0}
                                                step={0.1}
                                                value={weights[key]}
                                                onChange={(e) => setWeight(key, Number(e.target.value) || 0)}
                                                className="w-20 rounded border border-gray-300 px-2 py-1 text-right"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="text-xs text-gray-500">
                            Sum: {total.toFixed(1)} (used as relative weights, no need to equal 1)
                        </p>
                        <button type="submit" disabled={saving} className="btn-primary">
                            {saving ? "Saving…" : "Save weights"}
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
}
