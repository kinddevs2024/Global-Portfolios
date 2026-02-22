"use client";

import { useEffect, useState } from "react";

type Representative = {
    _id: string;
    email: string;
    name?: string;
    avatarUrl?: string;
};

export default function ManageRepresentativesPage() {
    const [loading, setLoading] = useState(true);
    const [reps, setReps] = useState<Representative[]>([]);
    const [showInvite, setShowInvite] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/university/representatives");
                if (res.ok) {
                    const payload = (await res.json()) as { data?: Representative[] };
                    setReps(payload.data ?? []);
                }
            } catch {
                setReps([]);
            } finally {
                setLoading(false);
            }
        }
        void load();
    }, []);

    async function handleInvite(e: React.FormEvent) {
        e.preventDefault();
        if (!email.trim()) return;
        setSubmitting(true);
        setError("");
        try {
            const res = await fetch("/api/university/representatives", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined }),
            });
            const payload = (await res.json()) as { error?: string; data?: Representative };
            if (res.ok && payload.data) {
                setReps((prev) => [...prev, payload.data!]);
                setShowInvite(false);
                setEmail("");
                setName("");
            } else {
                setError(payload.error ?? "Ошибка");
            }
        } catch {
            setError("Сетевая ошибка");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <div className="rounded-2xl border border-amber-200 bg-white p-8">Загрузка...</div>;

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-amber-900">Manage University Representatives</h1>
                <button
                    onClick={() => setShowInvite(true)}
                    className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
                >
                    <span>+</span> Invite Representative
                </button>
            </div>

            {showInvite && (
                <div className="rounded-2xl border border-amber-200 bg-white p-6">
                    <h2 className="text-lg font-semibold">Invite Representative</h2>
                    <form onSubmit={handleInvite} className="mt-4 space-y-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Email</label>
                            <input
                                type="email"
                                required
                                className="w-full rounded-xl border border-amber-200 px-3 py-2"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@university.edu"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Name (optional)</label>
                            <input
                                className="w-full rounded-xl border border-amber-200 px-3 py-2"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                            />
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="rounded-xl bg-amber-500 px-4 py-2 text-white disabled:opacity-70"
                            >
                                {submitting ? "Sending..." : "Invite"}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowInvite(false); setError(""); }}
                                className="rounded-xl border border-amber-200 px-4 py-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <section className="rounded-2xl border border-amber-200 bg-white p-6">
                <h2 className="text-lg font-semibold">
                    Representative List <span className="text-sm font-normal text-gray-500">{reps.length} Representatives</span>
                </h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {reps.map((r) => (
                        <div
                            key={r._id}
                            className="flex flex-col items-center rounded-xl border border-amber-100 p-6 text-center"
                        >
                            <div
                                className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl font-bold text-white"
                                style={r.avatarUrl ? { backgroundImage: `url(${r.avatarUrl})`, backgroundSize: "cover" } : {}}
                            >
                                {!r.avatarUrl && (r.name?.charAt(0) ?? r.email.charAt(0).toUpperCase())}
                            </div>
                            <p className="mt-3 font-semibold text-amber-900">{r.name || "Representative"}</p>
                            <p className="mt-1 text-sm text-gray-600">{r.email}</p>
                        </div>
                    ))}
                </div>
                {reps.length === 0 && !showInvite && (
                    <p className="py-8 text-center text-gray-500">No representatives yet. Invite one to get started.</p>
                )}
            </section>
        </div>
    );
}
