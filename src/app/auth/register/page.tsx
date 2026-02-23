"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type RegisterRole = "student" | "university";

function RegisterForm() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const role = useMemo<RegisterRole | null>(() => {
        const r = searchParams.get("role");
        if (r === "student" || r === "university") return r;
        return null;
    }, [searchParams]);

    useEffect(() => {
        if (!role) {
            window.location.replace("/auth/choose-role");
        }
    }, [role]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting || !role) return;
        setError("");
        setSubmitting(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, role }),
            });

            const result = (await response.json()) as { error?: string; requiresVerification?: boolean };

            if (!response.ok) {
                setError(result.error ?? "Registration failed");
                return;
            }

            if (result.requiresVerification) {
                window.location.assign("/auth/verify-email-sent?email=" + encodeURIComponent(email));
            } else {
                window.location.assign("/app");
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    if (!role) {
        return (
            <div className="auth-page flex min-h-screen items-center justify-center">
                <p className="text-[var(--text-muted)]">Redirecting...</p>
            </div>
        );
    }

    return (
        <div className="auth-page flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
            <main className="card w-full max-w-md p-6 sm:p-8">
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Create {role} account</h1>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Use email and password. You will receive a verification link.
                </p>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <input type="hidden" name="role" value={role} />
                    <div>
                        <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Email</label>
                        <input
                            className="w-full"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Password</label>
                        <input
                            className="w-full"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            minLength={8}
                            required
                        />
                    </div>

                    {error ? <p className="text-sm text-[var(--error)]">{error}</p> : null}

                    <button
                        className="btn-primary w-full disabled:opacity-70"
                        disabled={submitting}
                        type="submit"
                    >
                        {submitting ? "Registering..." : "Register"}
                    </button>

                    <p className="text-center text-sm text-[var(--text-muted)]">
                        Already have an account? <Link className="font-medium text-[var(--accent)] hover:underline" href="/auth/login">Login</Link>
                    </p>
                    <p className="text-center text-xs text-[var(--text-muted)]">
                        <Link className="hover:text-[var(--foreground)]" href="/auth/choose-role">← Choose different role</Link>
                    </p>
                </form>
            </main>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="auth-page flex min-h-screen items-center justify-center">
                <p className="text-[var(--text-muted)]">Loading...</p>
            </div>
        }>
            <RegisterForm />
        </Suspense>
    );
}
