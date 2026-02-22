"use client";

import Link from "next/link";

export default function ChooseRolePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
            <main className="mx-auto max-w-2xl w-full">
                <h1 className="text-3xl font-bold text-center">Create account</h1>
                <p className="mt-2 text-center text-gray-600">Choose your account type to continue</p>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    <Link
                        href="/auth/register?role=student"
                        className="card p-6 flex flex-col items-center gap-3 hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors"
                    >
                        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center text-2xl">🎓</div>
                        <h2 className="text-lg font-semibold">Student</h2>
                        <p className="text-sm text-gray-600 text-center">Create portfolio, apply to universities, showcase achievements</p>
                        <span className="text-emerald-600 font-medium text-sm">Register as Student →</span>
                    </Link>

                    <Link
                        href="/auth/register?role=university"
                        className="card p-6 flex flex-col items-center gap-3 hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors"
                    >
                        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center text-2xl">🏛️</div>
                        <h2 className="text-lg font-semibold">University</h2>
                        <p className="text-sm text-gray-600 text-center">Review applications, manage admissions, connect with students</p>
                        <span className="text-emerald-600 font-medium text-sm">Register as University →</span>
                    </Link>
                </div>

                <p className="mt-8 text-center text-sm text-gray-500">
                    Already have an account? <Link className="font-medium text-emerald-700 hover:underline" href="/auth/login">Sign in</Link>
                </p>
                <p className="mt-2 text-center text-xs text-gray-400">
                    <Link className="hover:text-gray-600" href="/">← Back to homepage</Link>
                </p>
            </main>
        </div>
    );
}
