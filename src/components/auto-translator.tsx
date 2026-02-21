"use client";

import { useEffect, useRef } from "react";
import { LANGUAGE_MAP } from "@/utils/languages-map";

export const LANGUAGE_KEY = "gp_translate_language";
const TARGET_SELECTORS = ["body"];
const ATTR_KEY = "data-translate-attr";
const CACHE = new Map<string, string>();

const timezoneToLanguage: Record<string, string> = {
    "Europe/Moscow": "ru",
    "Asia/Tokyo": "ja",
    "Asia/Shanghai": "zh-CN",
    "Asia/Seoul": "ko",
    "Asia/Bangkok": "th",
    "Asia/Jakarta": "id",
    "Asia/Ho_Chi_Minh": "vi",
    "Europe/Berlin": "de",
    "Europe/Paris": "fr",
    "Europe/Madrid": "es",
    "Europe/Rome": "it",
    "Europe/Amsterdam": "nl",
    "Europe/Warsaw": "pl",
    "Europe/Prague": "cs",
    "Europe/Stockholm": "sv",
    "Europe/Oslo": "no",
    "Europe/Copenhagen": "da",
    "Europe/Helsinki": "fi",
    "America/Sao_Paulo": "pt",
    "America/Mexico_City": "es",
    "America/Argentina/Buenos_Aires": "es",
    "Africa/Cairo": "ar",
    "Asia/Dubai": "ar",
    "Asia/Riyadh": "ar",
    "Asia/Tel_Aviv": "he",
    "Europe/Kiev": "uk",
    "Europe/Istanbul": "tr",
};

const mapGoogleLocaleToLanguage = (locale: string | undefined) => {
    if (!locale) return "en";
    const lower = locale.toLowerCase();
    const base = lower.split("-")[0];

    if (LANGUAGE_MAP[lower]) {
        return LANGUAGE_MAP[lower];
    }

    return LANGUAGE_MAP[base] ?? "en";
};

const detectUserLanguage = (): string => {
    if (typeof navigator === "undefined") {
        return "en";
    }

    const navigatorAny = navigator as Navigator & {
        systemLanguage?: string;
        userLanguage?: string;
        browserLanguage?: string;
        languages?: readonly string[];
    };

    if (navigator.languages && navigator.languages.length > 0) {
        for (const lang of navigator.languages) {
            const mapped = mapGoogleLocaleToLanguage(lang);
            if (mapped) return mapped;
        }
    }

    if (navigator.language) {
        const mapped = mapGoogleLocaleToLanguage(navigator.language);
        if (mapped) return mapped;
    }

    if (navigatorAny.systemLanguage) {
        const mapped = mapGoogleLocaleToLanguage(navigatorAny.systemLanguage);
        if (mapped) return mapped;
    }

    if (navigatorAny.userLanguage) {
        const mapped = mapGoogleLocaleToLanguage(navigatorAny.userLanguage);
        if (mapped) return mapped;
    }

    if (navigatorAny.browserLanguage) {
        const mapped = mapGoogleLocaleToLanguage(navigatorAny.browserLanguage);
        if (mapped) return mapped;
    }

    try {
        const dateLocale = new Intl.DateTimeFormat().resolvedOptions().locale;
        if (dateLocale) {
            const mapped = mapGoogleLocaleToLanguage(dateLocale);
            if (mapped && mapped !== "en") return mapped;
        }

        const numberLocale = new Intl.NumberFormat().resolvedOptions().locale;
        if (numberLocale) {
            const mapped = mapGoogleLocaleToLanguage(numberLocale);
            if (mapped && mapped !== "en") return mapped;
        }

        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timeZone && timezoneToLanguage[timeZone]) {
            return timezoneToLanguage[timeZone];
        }
    } catch {
        return "en";
    }

    return "en";
};

async function translateText(text: string, target: string) {
    const cacheKey = `${target}:${text}`;
    if (CACHE.has(cacheKey)) return CACHE.get(cacheKey)!;

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Translate failed: ${response.status}`);

    const data = (await response.json()) as unknown;
    const translated =
        Array.isArray(data) && Array.isArray(data[0])
            ? data[0]
                .map((entry: unknown) => (Array.isArray(entry) ? entry[0] : ""))
                .join("")
            : text;

    CACHE.set(cacheKey, translated || text);
    return translated || text;
}

function collectTextNodes(root: Element) {
    const nodes: Text[] = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            if (parent.closest("[data-translate='false']")) return NodeFilter.FILTER_REJECT;
            if (["SCRIPT", "STYLE"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
            if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
        },
    });
    let current = walker.nextNode();
    while (current) {
        nodes.push(current as Text);
        current = walker.nextNode();
    }
    return nodes;
}

async function translateElement(root: Element, target: string) {
    const textNodes = collectTextNodes(root);
    const tasks: Promise<void>[] = [];

    textNodes.forEach((node) => {
        const original = node.nodeValue?.trim() || "";
        if (!original) return;
        const task = translateText(original, target)
            .then((translated) => {
                if (translated && translated !== original) {
                    node.nodeValue = node.nodeValue?.replace(original, translated) ?? translated;
                }
            })
            .catch(() => undefined);
        tasks.push(task);
    });

    const attributeElements = Array.from(root.querySelectorAll<HTMLElement>(`[${ATTR_KEY}]`));
    for (const el of attributeElements) {
        const attrs = el.getAttribute(ATTR_KEY);
        if (!attrs) continue;
        for (const attrName of attrs.split(",").map((item) => item.trim()).filter(Boolean)) {
            const value = el.getAttribute(attrName);
            if (!value) continue;
            const task = translateText(value, target)
                .then((translated) => {
                    if (translated && translated !== value) {
                        el.setAttribute(attrName, translated);
                    }
                })
                .catch(() => undefined);
            tasks.push(task);
        }
    }

    if (tasks.length) {
        await Promise.all(tasks);
    }
}

export function AutoTranslator() {
    const observerRef = useRef<MutationObserver | null>(null);
    const isTranslating = useRef(false);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const targetLanguage = (() => {
            const stored = localStorage.getItem(LANGUAGE_KEY);
            if (stored && stored !== "auto") return stored;
            const detected = detectUserLanguage();
            localStorage.setItem(LANGUAGE_KEY, detected);
            return detected;
        })();

        if (!targetLanguage || targetLanguage === "en") return;

        const runTranslation = async () => {
            if (isTranslating.current) return;
            isTranslating.current = true;
            try {
                for (const selector of TARGET_SELECTORS) {
                    const el = document.querySelector(selector);
                    if (el) {
                        await translateElement(el, targetLanguage);
                    }
                }
            } finally {
                isTranslating.current = false;
            }
        };

        const scheduleRun = () => {
            if (rafRef.current !== null || isTranslating.current) return;
            rafRef.current = window.requestAnimationFrame(() => {
                rafRef.current = null;
                void runTranslation();
            });
        };

        void runTranslation();

        observerRef.current = new MutationObserver(() => {
            scheduleRun();
        });

        observerRef.current.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        const rerun = () => scheduleRun();
        window.addEventListener("storage", rerun);
        window.addEventListener("gp:language-change", rerun as EventListener);

        return () => {
            observerRef.current?.disconnect();
            if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
            window.removeEventListener("storage", rerun);
            window.removeEventListener("gp:language-change", rerun as EventListener);
        };
    }, []);

    return null;
}
