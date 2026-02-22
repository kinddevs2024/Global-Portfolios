"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Invalid verification link");
            return;
        }

        async function verify() {
            const t = token ?? "";
            try {
                const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(t)}`);
                const result = (await response.json()) as { error?: string };
                if (response.ok) {
                    setStatus("success");
                } else {
                    setStatus("error");
                    setMessage(result.error ?? "Verification failed");
                }
            } catch {
                setStatus("error");
                setMessage("Network error. Please try again.");
            }
        }

        void verify();
    }, [token]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
            <main className="mx-auto max-w-md card p-6 text-center">
                {status === "loading" && (
                    <>
                        <div className="animate-pulse text-4xl mb-4">⏳</div>
                        <h1 className="text-xl font-bold">Verifying...</h1>
                    </>
                )}
                {status === "success" && (
                    <>
                        <div className="text-5xl mb-4">✓</div>
                        <h1 className="text-2xl font-bold text-emerald-700">Email verified</h1>
                        <p className="mt-2 text-gray-600">You can now sign in to your account.</p>
                        <Link
                            className="mt-6 inline-block rounded-xl bg-emerald-600 px-4 py-2 text-white"
                            href="/auth/login"
                        >
                            Sign in
                        </Link>
                    </>
                )}
                {status === "error" && (
                    <>
                        <div className="text-5xl mb-4 text-red-500">✕</div>
                        <h1 className="text-xl font-bold">Verification failed</h1>
                        <p className="mt-2 text-gray-600">{message}</p>
                        <Link
                            className="mt-6 inline-block rounded-xl border border-emerald-200 px-4 py-2"
                            href="/auth/login"
                        >
                            Back to sign in
                        </Link>
                    </>
                )}
            </main>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Loading...</p>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
