"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fileToDataUrl } from "@/lib/imageUtils";
import {
    IconBuilding,
    IconWorld,
    IconMessage,
    IconDeviceFloppy,
    IconPhoto,
    IconCalendar,
    IconUsers,
    IconArrowLeft,
} from "@tabler/icons-react";

type UniversityInfo = {
    name?: string;
    country?: string;
    tagline?: string;
    yearEstablished?: number | null;
    numberOfStudents?: number | null;
    logoShort?: string;
    logoLong?: string;
    outreachMessage?: string;
};

export default function UniversityProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState("");
    const [form, setForm] = useState<UniversityInfo>({});

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/university/profile", { credentials: "include" });
                if (res.ok) {
                    const payload = (await res.json()) as { data?: { universityInfo?: UniversityInfo; outreachMessage?: string } };
                    const info = payload.data?.universityInfo ?? {};
                    const root = payload.data ?? {};
                    setForm({
                        name: info.name ?? "",
                        country: info.country ?? "",
                        tagline: info.tagline ?? "",
                        yearEstablished: info.yearEstablished ?? null,
                        numberOfStudents: info.numberOfStudents ?? null,
                        logoShort: info.logoShort ?? "",
                        logoLong: info.logoLong ?? "",
                        outreachMessage: root.outreachMessage ?? "",
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
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name ?? "",
                    country: form.country ?? "",
                    tagline: form.tagline ?? "",
                    yearEstablished: form.yearEstablished ?? null,
                    numberOfStudents: form.numberOfStudents ?? null,
                    logoShort: form.logoShort ?? "",
                    logoLong: form.logoLong ?? "",
                    outreachMessage: form.outreachMessage ?? "",
                }),
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

    if (loading) {
        return (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
                <p className="text-[var(--text-muted)]">Загрузка…</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl space-y-8">
            <div className="flex flex-wrap items-center gap-3">
                <Link
                    href="/app/university/dashboard"
                    className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)]"
                >
                    <IconArrowLeft size={18} />
                    Назад
                </Link>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Профиль университета</h1>
            </div>

            <section className="card overflow-hidden p-0">
                <div className="border-b border-[var(--border)] bg-[var(--surface-soft)] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-[var(--foreground)]">Основные данные</h2>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary inline-flex items-center gap-2"
                    >
                        <IconDeviceFloppy size={18} />
                        {saving ? "Сохранение…" : "Сохранить"}
                    </button>
                </div>
                <div className="space-y-6 p-6">
                    {status && (
                        <p className={`text-sm ${status.startsWith("Сохранено") ? "text-emerald-600" : "text-red-600"}`}>
                            {status}
                        </p>
                    )}

                    <div>
                        <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                            <IconBuilding size={18} className="text-[var(--text-muted)]" />
                            Название университета
                        </label>
                        <input
                            className="input w-full"
                            value={form.name ?? ""}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder="Введите название"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                            <IconWorld size={18} className="text-[var(--text-muted)]" />
                            Страна
                        </label>
                        <input
                            className="input w-full"
                            value={form.country ?? ""}
                            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                            placeholder="Например: Россия"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Слоган / девиз</label>
                        <input
                            className="input w-full"
                            value={form.tagline ?? ""}
                            onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                            placeholder="Краткий девиз университета"
                        />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                                <IconCalendar size={18} className="text-[var(--text-muted)]" />
                                Год основания
                            </label>
                            <input
                                type="number"
                                className="input w-full"
                                value={form.yearEstablished ?? ""}
                                onChange={(e) => setForm((f) => ({ ...f, yearEstablished: e.target.value ? parseInt(e.target.value, 10) : null }))}
                                placeholder="например 1987"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                                <IconUsers size={18} className="text-[var(--text-muted)]" />
                                Количество студентов
                            </label>
                            <input
                                type="number"
                                className="input w-full"
                                value={form.numberOfStudents ?? ""}
                                onChange={(e) => setForm((f) => ({ ...f, numberOfStudents: e.target.value ? parseInt(e.target.value, 10) : null }))}
                                placeholder="например 1200"
                            />
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                                <IconPhoto size={18} className="text-[var(--text-muted)]" />
                                Логотип (квадратный)
                            </label>
                            <div className="flex gap-3">
                                {form.logoShort ? (
                                    <div
                                        className="h-20 w-20 shrink-0 rounded-xl border border-[var(--border)] bg-cover bg-center"
                                        style={{ backgroundImage: `url(${form.logoShort})` }}
                                    />
                                ) : (
                                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)]">
                                        <IconPhoto size={28} />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="input flex-1 text-sm"
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
                            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Логотип (широкий)</label>
                            <div className="flex gap-3">
                                {form.logoLong ? (
                                    <div
                                        className="h-20 w-32 shrink-0 rounded-xl border border-[var(--border)] bg-contain bg-center bg-no-repeat"
                                        style={{ backgroundImage: `url(${form.logoLong})` }}
                                    />
                                ) : (
                                    <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)]">
                                        <IconPhoto size={24} />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="input flex-1 text-sm"
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
                        <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                            <IconMessage size={18} className="text-[var(--text-muted)]" />
                            Стандартное сообщение при отклике студенту
                        </label>
                        <p className="mb-2 text-xs text-[var(--text-muted)]">
                            Подставляется при отправке приглашения студенту в разделе Discovery (можно отредактировать перед отправкой).
                        </p>
                        <textarea
                            className="input min-h-[120px] w-full resize-y"
                            value={form.outreachMessage ?? ""}
                            onChange={(e) => setForm((f) => ({ ...f, outreachMessage: e.target.value }))}
                            placeholder="Здравствуйте! Мы заинтересованы вашим профилем и хотели бы обсудить возможности..."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
