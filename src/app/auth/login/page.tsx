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

            if (!response.ok) {
                const result = (await response.json()) as { error?: string };
                setError(result.error ?? "Login failed");
                return;
            }

            window.location.assign("/app");
        } catch {
            setError("Network error. Please try again.");
        }
    }

    return (
        <div className="min-h-screen overflow-x-hidden px-6 py-10 md:px-12">
            <main className="mx-auto max-w-lg card p-6">
                <h1 className="text-2xl font-bold">Sign in</h1>
                <p className="mt-1 text-sm text-gray-600">Enter your account credentials.</p>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
                        className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-white"
                        type="submit"
                    >
                        Login
                    </button>

                    <p className="text-center text-sm text-gray-600">
                        No account yet? <Link className="font-medium text-emerald-700" href="/auth/register">Register</Link>
                    </p>
                    <p className="text-center text-xs text-gray-500">
                        <Link className="hover:text-gray-700" href="/">← Back to homepage</Link>
                    </p>
                </form>
            </main>
        </div>
    );
}
