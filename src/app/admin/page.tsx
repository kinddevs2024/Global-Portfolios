"use client";

import { useState } from "react";

export default function AdminLoginPage() {
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

            if (result.user?.role === "admin") {
                window.location.assign("/admin/dashboard");
            } else {
                setError("Access denied. Admin credentials required.");
            }
        } catch {
            setError("Network error. Please try again.");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-10 bg-gray-50">
            <main className="w-full max-w-md card p-6">
                <h1 className="text-2xl font-bold">Admin sign in</h1>
                <p className="mt-1 text-sm text-gray-600">Enter admin credentials.</p>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Email</label>
                        <input
                            className="w-full rounded-xl border border-emerald-200 px-3 py-2"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Password</label>
                        <input
                            className="w-full rounded-xl border border-emerald-200 px-3 py-2"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={8}
                            required
                        />
                    </div>

                    {error ? <p className="text-sm text-red-600">{error}</p> : null}

                    <button className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-white" type="submit">
                        Sign in
                    </button>

                    <p className="text-center text-xs text-gray-500">
                        <a className="hover:text-gray-700" href="/">← Back to homepage</a>
                    </p>
                </form>
            </main>
        </div>
    );
}
