"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const STORAGE_KEY = "gp_analytics_sid";

function getOrCreateSessionId(): string {
    if (typeof window === "undefined") return "";
    try {
        let sid = sessionStorage.getItem(STORAGE_KEY);
        if (!sid) {
            sid = crypto.randomUUID?.() ?? `s-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
            sessionStorage.setItem(STORAGE_KEY, sid);
        }
        return sid;
    } catch {
        return "";
    }
}

export function AnalyticsTracker() {
    const pathname = usePathname();

    useEffect(() => {
        const path = pathname ?? "/";
        const sid = getOrCreateSessionId();
        if (!sid) return;
        fetch("/api/analytics/view", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ path, sessionId: sid }),
        }).catch(() => {});
    }, [pathname]);

    return null;
}
