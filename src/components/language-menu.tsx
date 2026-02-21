"use client";

import { useState } from "react";
import { AUTO_KEY, LANGUAGE_KEY } from "@/components/auto-translator";

const LANG_OPTIONS = [
    { value: "auto", label: "Auto" },
    { value: "en", label: "EN" },
    { value: "ru", label: "RU" },
    { value: "kk", label: "KK" },
    { value: "uz", label: "UZ" },
    { value: "ky", label: "KY" },
    { value: "tr", label: "TR" },
    { value: "ar", label: "AR" },
    { value: "zh-CN", label: "ZH" },
];

export default function LanguageMenu() {
    const [enabled, setEnabled] = useState(() => {
        if (typeof window === "undefined") return true;
        const storedEnabled = localStorage.getItem(AUTO_KEY);
        return storedEnabled === null ? true : storedEnabled === "true";
    });

    const [language, setLanguage] = useState(() => {
        if (typeof window === "undefined") return "auto";
        return localStorage.getItem(LANGUAGE_KEY) ?? "auto";
    });

    function toggleEnabled() {
        const next = !enabled;
        setEnabled(next);
        localStorage.setItem(AUTO_KEY, String(next));
        window.dispatchEvent(new Event("gp:language-change"));
        window.location.reload();
    }

    function onChangeLanguage(next: string) {
        setLanguage(next);
        localStorage.setItem(LANGUAGE_KEY, next);
        window.dispatchEvent(new Event("gp:language-change"));
        window.location.reload();
    }

    return (
        <div className="flex items-center gap-2">
            <select
                className="rounded-lg border border-emerald-200 px-2 py-1 text-xs"
                onChange={(event) => onChangeLanguage(event.target.value)}
                value={language}
            >
                {LANG_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                ))}
            </select>
            <button
                className="rounded-lg border border-emerald-300 px-3 py-1 text-xs hover:bg-emerald-50"
                onClick={toggleEnabled}
                type="button"
            >
                Перевод: {enabled ? "ВКЛ" : "ВЫКЛ"}
            </button>
        </div>
    );
}
