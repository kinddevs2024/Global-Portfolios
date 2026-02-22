"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function VerifyEmailSentContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email") ?? "";

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
            <main className="mx-auto max-w-md card p-6 text-center">
                <div className="text-5xl mb-4">📧</div>
                <h1 className="text-2xl font-bold">Check your email</h1>
                <p className="mt-2 text-gray-600">
                    We sent a verification link to <strong>{email || "your email"}</strong>.
                </p>
                <p className="mt-4 text-sm text-gray-600">
                    Click the link in the email to verify your account, then sign in.
                </p>
                <p className="mt-6 text-sm text-gray-500">
                    Didn&apos;t receive it? Check your spam folder or try registering again.
                </p>
                <div className="mt-8 flex flex-col gap-2">
                    <Link
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-white text-center"
                        href="/auth/login"
                    >
                        Sign in
                    </Link>
                    <Link
                        className="rounded-xl border border-emerald-200 px-4 py-2 text-center text-sm"
                        href="/"
                    >
                        ← Back to homepage
                    </Link>
                </div>
            </main>
        </div>
    );
}

export default function VerifyEmailSentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Loading...</p>
            </div>
        }>
            <VerifyEmailSentContent />
        </Suspense>
    );
}
