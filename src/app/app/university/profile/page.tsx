"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fileToDataUrl } from "@/lib/imageUtils";

type UniversityInfo = {
    name?: string;
    country?: string;
    tagline?: string;
    yearEstablished?: number | null;
    numberOfStudents?: number | null;
    logoShort?: string;
    logoLong?: string;
};

const TABS = [
    { id: "overview", label: "University Overview", icon: "◉" },
    { id: "media", label: "Media and Location", icon: "◇" },
    { id: "programs", label: "Programs and Academics", icon: "◆" },
    { id: "campus", label: "Campus Life and Services", icon: "◎" },
    { id: "contact", label: "Contact and Review", icon: "●" },
];

export default function UniversityProfilePage() {
    const [tab, setTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState("");
    const [form, setForm] = useState<UniversityInfo>({});

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/university/profile");
                if (res.ok) {
                    const payload = (await res.json()) as { data?: { universityInfo?: UniversityInfo } };
                    const info = payload.data?.universityInfo ?? {};
                    setForm({
                        name: info.name ?? "",
                        country: info.country ?? "",
                        tagline: info.tagline ?? "",
                        yearEstablished: info.yearEstablished ?? null,
                        numberOfStudents: info.numberOfStudents ?? null,
                        logoShort: info.logoShort ?? "",
                        logoLong: info.logoLong ?? "",
                    });
                }
            } catch {
                setStatus("Ошибка загрузки");
            } finally {
                setLoading(false);
            }
        }
        void load();
    }, []);

    async function handleSave() {
        setSaving(true);
        setStatus("");
        try {
            const res = await fetch("/api/university/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const payload = (await res.json()) as { error?: string };
            if (res.ok) {
                setStatus("Сохранено");
            } else {
                setStatus(payload.error ?? "Ошибка сохранения");
            }
        } catch {
            setStatus("Сетевая ошибка");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="rounded-2xl border border-amber-200 bg-white p-8">Загрузка...</div>;

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <h1 className="text-2xl font-bold text-amber-900">University</h1>

            <div className="flex gap-2 overflow-x-auto border-b border-amber-200 pb-2">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                            tab === t.id ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-900 hover:bg-amber-100"
                        }`}
                    >
                        <span>{t.icon}</span>
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === "overview" && (
                <section className="space-y-6 rounded-2xl border border-amber-200 bg-white p-6">
                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
                        >
                            {saving ? "Сохранение..." : "Save Changes"}
                        </button>
                    </div>
                    {status && <p className="text-sm text-amber-700">{status}</p>}

                    <div>
                        <label className="mb-1 block text-sm font-medium">University Name</label>
                        <input
                            className="w-full rounded-xl border border-amber-200 px-3 py-2"
                            value={form.name ?? ""}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder="University Name"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium">University Logo (Short)</label>
                            <div className="flex gap-3">
                                {form.logoShort ? (
                                    <div
                                        className="h-20 w-20 shrink-0 rounded-lg border bg-cover bg-center"
                                        style={{ backgroundImage: `url(${form.logoShort})` }}
                                    />
                                ) : (
                                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-2xl text-amber-400">
                                        📷
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="flex-1 rounded-xl border border-amber-200 px-3 py-2"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const url = await fileToDataUrl(file, { maxSize: 300 });
                                        setForm((f) => ({ ...f, logoShort: url }));
                                        e.target.value = "";
                                    }}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">University Logo (Long)</label>
                            <div className="flex gap-3">
                                {form.logoLong ? (
                                    <div
                                        className="h-20 w-32 shrink-0 rounded-lg border bg-contain bg-center bg-no-repeat"
                                        style={{ backgroundImage: `url(${form.logoLong})` }}
                                    />
                                ) : (
                                    <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-2xl text-amber-400">
                                        📷
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="flex-1 rounded-xl border border-amber-200 px-3 py-2"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const url = await fileToDataUrl(file, { maxSize: 400 });
                                        setForm((f) => ({ ...f, logoLong: url }));
                                        e.target.value = "";
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Tagline / Motto</label>
                        <input
                            className="w-full rounded-xl border border-amber-200 px-3 py-2"
                            value={form.tagline ?? ""}
                            onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                            placeholder="Enter your University motto"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Year Established</label>
                            <input
                                type="number"
                                className="w-full rounded-xl border border-amber-200 px-3 py-2"
                                value={form.yearEstablished ?? ""}
                                onChange={(e) => setForm((f) => ({ ...f, yearEstablished: e.target.value ? parseInt(e.target.value, 10) : null }))}
                                placeholder="e.g. 1987"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Number of Students</label>
                            <input
                                type="number"
                                className="w-full rounded-xl border border-amber-200 px-3 py-2"
                                value={form.numberOfStudents ?? ""}
                                onChange={(e) => setForm((f) => ({ ...f, numberOfStudents: e.target.value ? parseInt(e.target.value, 10) : null }))}
                                placeholder="e.g. 1200"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between pt-4">
                        <button
                            type="button"
                            disabled
                            className="rounded-xl border border-amber-200 px-4 py-2 text-sm text-gray-400"
                        >
                            ← Previous
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab("media")}
                            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white"
                        >
                            Media and Location →
                        </button>
                    </div>
                </section>
            )}

            {tab !== "overview" && (
                <section className="rounded-2xl border border-amber-200 bg-white p-8 text-center text-gray-500">
                    <p>Section coming soon.</p>
                    <button onClick={() => setTab("overview")} className="mt-4 text-amber-600 hover:underline">
                        ← Back to Overview
                    </button>
                </section>
            )}
        </div>
    );
}
