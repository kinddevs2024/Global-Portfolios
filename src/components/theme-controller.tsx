"use client";

import { useEffect } from "react";

export type ThemeMode = "light" | "dark" | "system";
export const THEME_KEY = "gp_theme_mode";

function getStoredTheme(): ThemeMode {
    const value = localStorage.getItem(THEME_KEY);
    if (value === "light" || value === "dark" || value === "system") {
        return value;
    }
    return "system";
}

function resolveTheme(mode: ThemeMode): "light" | "dark" {
    if (mode !== "system") return mode;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(mode: ThemeMode) {
    const resolved = resolveTheme(mode);
    document.documentElement.setAttribute("data-theme", resolved);
}

export function ThemeController() {
    useEffect(() => {
        if (typeof window === "undefined") return;

        const applyCurrent = () => applyTheme(getStoredTheme());

        applyCurrent();

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const onMediaChange = () => {
            const mode = getStoredTheme();
            if (mode === "system") applyTheme("system");
        };

        const onStorage = () => applyCurrent();
        const onThemeEvent = () => applyCurrent();

        mediaQuery.addEventListener("change", onMediaChange);
        window.addEventListener("storage", onStorage);
        window.addEventListener("gp:theme-change", onThemeEvent as EventListener);

        return () => {
            mediaQuery.removeEventListener("change", onMediaChange);
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("gp:theme-change", onThemeEvent as EventListener);
        };
    }, []);

    return null;
}
