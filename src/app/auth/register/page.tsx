"use client";

import { useState } from "react";
import Link from "next/link";

type RegisterRole = "student" | "university" | "admin";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<RegisterRole>("student");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting) return;
        setError("");
        setSubmitting(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, role }),
            });

            if (!response.ok) {
                const result = (await response.json()) as { error?: string };
                setError(result.error ?? "Registration failed");
                return;
            }

            window.location.assign("/app");
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen px-6 py-10 md:px-12">
            <main className="mx-auto max-w-md card p-6">
                <h1 className="text-2xl font-bold">Create account</h1>
                <p className="mt-1 text-sm text-gray-600">Use email and password to create your account.</p>

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
                    <div>
                        <label className="mb-1 block text-sm font-medium">Role</label>
                        <select
                            className="w-full rounded-xl border border-emerald-200 px-3 py-2"
                            value={role}
                            onChange={(event) => setRole(event.target.value as RegisterRole)}
                        >
                            <option value="student">Student</option>
                            <option value="university">University</option>
                            <option value="admin">Admin</option>
                        </select>
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
                        <Link className="hover:text-gray-700" href="/">← Back to homepage</Link>
                    </p>
                </form>
            </main>
        </div>
    );
}
