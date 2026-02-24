"use client";

import { useCallback, useEffect, useState } from "react";

export function EmailVerifyBanner() {
    const [show, setShow] = useState(false);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const check = useCallback(async () => {
        try {
            const res = await fetch("/api/auth/me", { credentials: "include" });
            if (!res.ok) return;
            const json = (await res.json()) as { data?: { emailVerified?: boolean } };
            if (json.data?.emailVerified === false) {
                setShow(true);
            }
        } catch {
            // not logged in or error
        }
    }, []);

    useEffect(() => {
        void check();
    }, [check]);

    useEffect(() => {
        if (!show) return;
        const t = setInterval(check, 30 * 1000);
        return () => clearInterval(t);
    }, [show, check]);

    async function handleResend() {
        setSending(true);
        setSent(false);
        try {
            const res = await fetch("/api/auth/resend-verification", {
                method: "POST",
                credentials: "include",
            });
            const data = (await res.json()) as { sent?: boolean; alreadyVerified?: boolean };
            if (data.sent) {
                setSent(true);
            }
            if (data.alreadyVerified) {
                setShow(false);
            }
        } catch {
            // ignore
        } finally {
            setSending(false);
        }
    }

    if (!show) return null;

    return (
        <div
            className="flex flex-wrap items-center justify-center gap-2 border-b border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-center text-sm text-[var(--foreground)]"
            role="status"
        >
            <span>Подтвердите почту, чтобы не потерять доступ к аккаунту.</span>
            <button
                type="button"
                onClick={handleResend}
                disabled={sending}
                className="shrink-0 rounded-md bg-[var(--accent)] px-3 py-1 text-xs font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-60"
            >
                {sending ? "Отправка…" : sent ? "Письмо отправлено" : "Подтвердить аккаунт"}
            </button>
        </div>
    );
}
