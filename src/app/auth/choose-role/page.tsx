"use client";

import Link from "next/link";

export default function ChooseRolePage() {
    return (
        <div className="auth-page flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
            <main className="w-full max-w-xl">
                <h1 className="text-center text-xl font-bold text-[var(--foreground)] sm:text-2xl">Create account</h1>
                <p className="mt-1.5 text-center text-sm text-[var(--text-muted)]">Choose your account type to continue</p>

                <div className="mx-auto mt-6 flex max-w-[200px] flex-col gap-4 sm:max-w-none sm:flex-row sm:justify-center sm:gap-5">
                    <Link
                        href="/auth/register?role=student"
                        className="card flex aspect-square w-full flex-col items-center justify-center gap-1.5 p-4 transition-colors hover:border-[var(--accent)] hover:bg-[var(--surface-soft)] sm:h-[160px] sm:w-[160px] sm:shrink-0"
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xl">🎓</div>
                        <h2 className="text-base font-semibold text-[var(--foreground)]">Student</h2>
                        <p className="text-center text-xs leading-tight text-[var(--text-muted)]">Portfolio, applications, achievements</p>
                        <span className="text-xs font-medium text-[var(--accent)]">Register →</span>
                    </Link>

                    <Link
                        href="/auth/register?role=university"
                        className="card flex aspect-square w-full flex-col items-center justify-center gap-1.5 p-4 transition-colors hover:border-[var(--accent)] hover:bg-[var(--surface-soft)] sm:h-[160px] sm:w-[160px] sm:shrink-0"
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xl">🏛️</div>
                        <h2 className="text-base font-semibold text-[var(--foreground)]">University</h2>
                        <p className="text-center text-xs leading-tight text-[var(--text-muted)]">Applications, admissions, students</p>
                        <span className="text-xs font-medium text-[var(--accent)]">Register →</span>
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
