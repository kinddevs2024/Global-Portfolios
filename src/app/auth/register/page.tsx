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
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Redirecting...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-6 py-10 md:px-12">
            <main className="mx-auto max-w-md card p-6">
                <h1 className="text-2xl font-bold">Create {role} account</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Use email and password. You will receive a verification link.
                </p>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <input type="hidden" name="role" value={role} />
                    <div>
                        <label className="mb-1 block text-sm font-medium">Email</label>
                        <input
                            className="w-full rounded-xl border border-emerald-200 px-3 py-2"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Password</label>
                        <input
                            className="w-full rounded-xl border border-emerald-200 px-3 py-2"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            minLength={8}
                            required
                        />
                    </div>

                    {error ? <p className="text-sm text-red-600">{error}</p> : null}

                    <button
                        className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-white disabled:opacity-70"
                        disabled={submitting}
                        type="submit"
                    >
                        {submitting ? "Registering..." : "Register"}
                    </button>

                    <p className="text-center text-sm text-gray-600">
                        Already have an account? <Link className="font-medium text-emerald-700" href="/auth/login">Login</Link>
                    </p>
                    <p className="text-center text-xs text-gray-500">
                        <Link className="hover:text-gray-700" href="/auth/choose-role">← Choose different role</Link>
                    </p>
                </form>
            </main>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Loading...</p>
            </div>
        }>
            <RegisterForm />
        </Suspense>
    );
}
