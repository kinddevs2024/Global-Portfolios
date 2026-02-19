"use client";

import { useCallback, useState } from "react";

type Candidate = {
    _id: string;
    personalInfo?: { firstName?: string; lastName?: string; country?: string };
    academicInfo?: { gpa?: number };
    globalScore?: number;
    rankingTier?: string;
    aiAnalysis?: { growthTrajectory?: number };
};

export default function InvestorDashboardClient() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [country, setCountry] = useState("");
    const [minGpa, setMinGpa] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [loaded, setLoaded] = useState(false);

    const loadCandidates = useCallback(async () => {
        const params = new URLSearchParams();
        if (country) params.set("country", country);
        if (minGpa) params.set("minGpa", minGpa);

        const response = await fetch(`/api/investor/candidates?${params.toString()}`);
        setLoading(false);

        if (!response.ok) {
            const result = (await response.json()) as { error?: string };
            setError(result.error ?? "Failed to load candidates");
            setLoaded(true);
            return;
        }

        const result = (await response.json()) as { data: Candidate[] };
        setCandidates(result.data);
        setLoaded(true);
    }, [country, minGpa]);

    function handleApplyFilters() {
        setError("");
        setLoading(true);
        void loadCandidates();
    }

    return (
        <div className="min-h-screen px-6 py-10 md:px-12">
            <main className="mx-auto max-w-6xl space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Candidate Dashboard</h1>
                <p className="text-sm text-gray-600">Search and review ranked candidates.</p>

                <section className="card p-4">
                    <div className="grid gap-3 md:grid-cols-4">
                        <input
                            className="rounded-xl border border-emerald-200 px-3 py-2"
                            placeholder="Country"
                            value={country}
                            onChange={(event) => setCountry(event.target.value)}
                        />
                        <input
                            className="rounded-xl border border-emerald-200 px-3 py-2"
                            placeholder="Min GPA"
                            type="number"
                            min={0}
                            max={4}
                            step="0.01"
                            value={minGpa}
                            onChange={(event) => setMinGpa(event.target.value)}
                        />
                        <button className="rounded-xl bg-emerald-600 px-4 py-2 text-white" onClick={handleApplyFilters} type="button">
                            Apply filters
                        </button>
                    </div>
                </section>

                {error ? <p className="text-sm text-red-600">{error}</p> : null}

                <section className="card overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-emerald-50">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Country</th>
                                <th className="px-4 py-3">GPA</th>
                                <th className="px-4 py-3">Global Score</th>
                                <th className="px-4 py-3">Tier</th>
                                <th className="px-4 py-3">AI Potential</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td className="px-4 py-4" colSpan={6}>Loading...</td>
                                </tr>
                            ) : !loaded ? (
                                <tr>
                                    <td className="px-4 py-4" colSpan={6}>Click &quot;Apply filters&quot; to load candidates.</td>
                                </tr>
                            ) : candidates.length === 0 ? (
                                <tr>
                                    <td className="px-4 py-4" colSpan={6}>No candidates found</td>
                                </tr>
                            ) : (
                                candidates.map((candidate) => (
                                    <tr className="border-t border-emerald-100" key={candidate._id}>
                                        <td className="px-4 py-3">{candidate.personalInfo?.firstName} {candidate.personalInfo?.lastName}</td>
                                        <td className="px-4 py-3">{candidate.personalInfo?.country ?? "—"}</td>
                                        <td className="px-4 py-3">{candidate.academicInfo?.gpa ?? "—"}</td>
                                        <td className="px-4 py-3">{candidate.globalScore ?? "—"}</td>
                                        <td className="px-4 py-3">{candidate.rankingTier ?? "—"}</td>
                                        <td className="px-4 py-3">{candidate.aiAnalysis?.growthTrajectory ?? "—"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </section>
            </main>
        </div>
    );
}
