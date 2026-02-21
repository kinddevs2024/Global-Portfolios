"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AUTO_KEY, LANGUAGE_KEY } from "@/components/auto-translator";
import { THEME_KEY, type ThemeMode } from "@/components/theme-controller";

type AccountPayload = {
    _id: string;
    email: string;
    role: "student" | "university" | "admin" | "investor";
    firstName: string;
    lastName: string;
    avatarUrl: string;
    preferredLanguage: string;
    themeMode: ThemeMode;
};

async function fileToDataUrl(file: File) {
    return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(new Error("Failed to read image"));
        reader.readAsDataURL(file);
    });
}

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [status, setStatus] = useState("");
    const [passwordStatus, setPasswordStatus] = useState("");

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [email, setEmail] = useState("");
    const [preferredLanguage, setPreferredLanguage] = useState("auto");
    const [autoTranslate, setAutoTranslate] = useState(true);
    const [themeMode, setThemeMode] = useState<ThemeMode>("system");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    useEffect(() => {
        async function loadAccount() {
            try {
                const response = await fetch("/api/account", { cache: "no-store" });

                if (!response.ok) {
                    window.location.assign("/auth/login");
                    return;
                }

                const payload = (await response.json()) as { data: AccountPayload };
                const account = payload.data;

                setFirstName(account.firstName ?? "");
                setLastName(account.lastName ?? "");
                setAvatarUrl(account.avatarUrl ?? "");
                setEmail(account.email ?? "");
                setPreferredLanguage(account.preferredLanguage ?? "auto");
                setThemeMode((account.themeMode ?? "system") as ThemeMode);

                const localAuto = localStorage.getItem(AUTO_KEY);
                setAutoTranslate(localAuto === null ? true : localAuto === "true");

                if (!localStorage.getItem(LANGUAGE_KEY) && account.preferredLanguage) {
                    localStorage.setItem(LANGUAGE_KEY, account.preferredLanguage);
                }
                if (!localStorage.getItem(THEME_KEY) && account.themeMode) {
                    localStorage.setItem(THEME_KEY, account.themeMode);
                }
            } catch {
                window.location.assign("/auth/login");
            } finally {
                setLoading(false);
            }
        }

        void loadAccount();
    }, []);

    const avatarPreview = useMemo(() => {
        if (avatarUrl.trim()) return avatarUrl.trim();
        return "";
    }, [avatarUrl]);

    const initials = useMemo(() => {
        const f = firstName.trim().charAt(0).toUpperCase();
        const l = lastName.trim().charAt(0).toUpperCase();
        return `${f}${l}`.trim() || "S";
    }, [firstName, lastName]);

    async function saveAccount() {
        if (saving) return;
        setSaving(true);
        setStatus("");

        try {
            const response = await fetch("/api/account", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    avatarUrl,
                    preferredLanguage,
                    themeMode,
                }),
            });

            const payload = (await response.json()) as { error?: string };

            if (!response.ok) {
                setStatus(payload.error ?? "Failed to update profile settings");
                return;
            }

            localStorage.setItem(LANGUAGE_KEY, preferredLanguage);
            localStorage.setItem(AUTO_KEY, String(autoTranslate));
            localStorage.setItem(THEME_KEY, themeMode);
            window.dispatchEvent(new Event("gp:language-change"));
            window.dispatchEvent(new Event("gp:theme-change"));

            setStatus("Profile settings saved");
        } catch {
            setStatus("Network error while saving settings");
        } finally {
            setSaving(false);
        }
    }

    async function changePassword() {
        if (passwordSaving) return;
        setPasswordStatus("");

        if (!currentPassword || !newPassword) {
            setPasswordStatus("Please fill current and new password");
            return;
        }

        if (newPassword.length < 8) {
            setPasswordStatus("New password must be at least 8 characters");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setPasswordStatus("New passwords do not match");
            return;
        }

        setPasswordSaving(true);
        try {
            const response = await fetch("/api/account/password", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const payload = (await response.json()) as { error?: string };
            if (!response.ok) {
                setPasswordStatus(payload.error ?? "Failed to change password");
                return;
            }

            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            setPasswordStatus("Password updated successfully");
        } catch {
            setPasswordStatus("Network error while changing password");
        } finally {
            setPasswordSaving(false);
        }
    }

    if (loading) {
        return <div className="card p-6">Loading profile...</div>;
    }

    return (
        <div className="space-y-6">
            <section className="card p-6">
                <h1 className="text-2xl font-bold">Профиль студента</h1>
                <p className="mt-1 text-sm text-gray-600">Управление аккаунтом, языком и темой.</p>
            </section>

            <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
                <article className="card p-5">
                    <h2 className="text-base font-semibold">Аватар</h2>
                    <div className="mt-4 flex justify-center">
                        {avatarPreview ? (
                            <div className="relative h-32 w-32 overflow-hidden rounded-full border border-emerald-200">
                                <Image alt="Student avatar" fill src={avatarPreview} unoptimized className="object-cover" />
                            </div>
                        ) : (
                            <div className="flex h-32 w-32 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-3xl font-bold text-emerald-700">
                                {initials}
                            </div>
                        )}
                    </div>
                    <label className="mt-4 block text-sm font-medium">Avatar URL</label>
                    <input
                        className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2"
                        placeholder="https://..."
                        value={avatarUrl}
                        onChange={(event) => setAvatarUrl(event.target.value)}
                    />
                    <label className="mt-3 block text-sm font-medium">Или загрузите с устройства</label>
                    <input
                        accept="image/*"
                        className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2"
                        onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            const imageData = await fileToDataUrl(file);
                            setAvatarUrl(imageData);
                        }}
                        type="file"
                    />
                </article>

                <article className="card p-5 space-y-5">
                    <div>
                        <h2 className="text-base font-semibold">Основные данные</h2>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Имя</label>
                                <input className="w-full rounded-xl border border-emerald-200 px-3 py-2" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Фамилия</label>
                                <input className="w-full rounded-xl border border-emerald-200 px-3 py-2" value={lastName} onChange={(event) => setLastName(event.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium">Gmail / Email</label>
                                <input className="w-full rounded-xl border border-emerald-200 bg-gray-50 px-3 py-2" readOnly value={email} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium">Пароль</label>
                                <input className="w-full rounded-xl border border-emerald-200 bg-gray-50 px-3 py-2" readOnly value="••••••••" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-base font-semibold">Язык и перевод</h2>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Язык интерфейса</label>
                                <select
                                    className="w-full rounded-xl border border-emerald-200 px-3 py-2"
                                    value={preferredLanguage}
                                    onChange={(event) => setPreferredLanguage(event.target.value)}
                                >
                                    <option value="auto">Auto detect</option>
                                    <option value="en">English</option>
                                    <option value="ru">Русский</option>
                                    <option value="kk">Қазақша</option>
                                    <option value="uz">O&apos;zbek</option>
                                    <option value="ky">Кыргызча</option>
                                    <option value="tr">Türkçe</option>
                                    <option value="ar">العربية</option>
                                    <option value="zh-CN">中文(简体)</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Перевод</label>
                                <button
                                    className="w-full rounded-xl border border-emerald-300 px-3 py-2 text-left"
                                    onClick={() => setAutoTranslate((current) => !current)}
                                    type="button"
                                >
                                    {autoTranslate ? "Включен" : "Выключен"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-base font-semibold">Тема</h2>
                        <div className="mt-3 max-w-sm">
                            <label className="mb-1 block text-sm font-medium">Theme mode</label>
                            <select
                                className="w-full rounded-xl border border-emerald-200 px-3 py-2"
                                value={themeMode}
                                onChange={(event) => setThemeMode(event.target.value as ThemeMode)}
                            >
                                <option value="system">System</option>
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="rounded-xl bg-emerald-600 px-4 py-2 text-white disabled:opacity-70" disabled={saving} onClick={saveAccount} type="button">
                            {saving ? "Saving..." : "Сохранить настройки"}
                        </button>
                        {status ? <p className="text-sm text-gray-700">{status}</p> : null}
                    </div>
                </article>
            </section>

            <section className="card p-5">
                <h2 className="text-base font-semibold">Смена пароля</h2>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Текущий пароль</label>
                        <input className="w-full rounded-xl border border-emerald-200 px-3 py-2" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Новый пароль</label>
                        <input className="w-full rounded-xl border border-emerald-200 px-3 py-2" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Повтор нового пароля</label>
                        <input className="w-full rounded-xl border border-emerald-200 px-3 py-2" type="password" value={confirmNewPassword} onChange={(event) => setConfirmNewPassword(event.target.value)} />
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                    <button className="rounded-xl border border-emerald-300 px-4 py-2 disabled:opacity-70" disabled={passwordSaving} onClick={changePassword} type="button">
                        {passwordSaving ? "Updating..." : "Поменять пароль"}
                    </button>
                    {passwordStatus ? <p className="text-sm text-gray-700">{passwordStatus}</p> : null}
                </div>
            </section>
        </div>
    );
}
