"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const result = (await response.json()) as { error?: string; user?: { role?: string } };
            if (!response.ok) {
                setError(result.error ?? "Login failed");
                return;
            }

            const role = result.user?.role;
            if (role === "admin") {
                window.location.assign("/admin");
            } else if (role === "university") {
                window.location.assign("/app/university/dashboard");
            } else {
                window.location.assign("/app");
            }
        } catch {
            setError("Network error. Please try again.");
        }
    }

    return (
        <div className="auth-page min-h-screen overflow-x-hidden flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
            <main className="card w-full max-w-md p-6 sm:p-8">
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Sign in</h1>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Enter your account credentials.</p>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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

                    <button className="btn-primary w-full" type="submit">
                        Login
                    </button>

                    <p className="text-center text-sm text-[var(--text-muted)]">
                        No account yet? <Link className="font-medium text-[var(--accent)] hover:underline" href="/auth/choose-role">Register</Link>
                    </p>
                    <p className="text-center text-xs text-[var(--text-muted)]">
                        <Link className="hover:text-[var(--foreground)]" href="/">← Back to homepage</Link>
                    </p>
                </form>
            </main>
        </div>
    );
}
