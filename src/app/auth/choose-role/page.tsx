"use client";

import Link from "next/link";

export default function ChooseRolePage() {
    return (
        <div className="auth-page flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
            <main className="w-full max-w-2xl">
                <h1 className="text-center text-2xl font-bold text-[var(--foreground)] sm:text-3xl">Create account</h1>
                <p className="mt-2 text-center text-sm text-[var(--text-muted)] sm:text-base">Choose your account type to continue</p>

                <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2">
                    <Link
                        href="/auth/register?role=student"
                        className="card flex flex-col items-center gap-3 p-5 transition-colors hover:border-[var(--accent)] hover:bg-[var(--surface-soft)] sm:p-6"
                    >
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-2xl sm:h-16 sm:w-16">🎓</div>
                        <h2 className="text-lg font-semibold text-[var(--foreground)]">Student</h2>
                        <p className="text-center text-sm text-[var(--text-muted)]">Create portfolio, apply to universities, showcase achievements</p>
                        <span className="text-sm font-medium text-[var(--accent)]">Register as Student →</span>
                    </Link>

                    <Link
                        href="/auth/register?role=university"
                        className="card flex flex-col items-center gap-3 p-5 transition-colors hover:border-[var(--accent)] hover:bg-[var(--surface-soft)] sm:p-6"
                    >
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-2xl sm:h-16 sm:w-16">🏛️</div>
                        <h2 className="text-lg font-semibold text-[var(--foreground)]">University</h2>
                        <p className="text-center text-sm text-[var(--text-muted)]">Review applications, manage admissions, connect with students</p>
                        <span className="text-sm font-medium text-[var(--accent)]">Register as University →</span>
                    </Link>
                </div>

                <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
                    Already have an account? <Link className="font-medium text-[var(--accent)] hover:underline" href="/auth/login">Sign in</Link>
                </p>
                <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
                    <Link className="hover:text-[var(--foreground)]" href="/">← Back to homepage</Link>
                </p>
            </main>
        </div>
    );
}
