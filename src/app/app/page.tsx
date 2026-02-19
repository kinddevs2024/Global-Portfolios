"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SessionUser = {
    _id: string;
    email: string;
    role: "student" | "university" | "investor" | "admin";
    verificationStatus: "pending" | "verified" | "rejected";
};

export default function AppHomePage() {
    const router = useRouter();
    const [user, setUser] = useState<SessionUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadMe() {
            const response = await fetch("/api/auth/me");
            if (!response.ok) {
                router.push("/auth/login");
                return;
            }

            const result = (await response.json()) as { data: SessionUser };
            setUser(result.data);
            setLoading(false);
        }

        void loadMe();
    }, [router]);

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/auth/login");
    }

    if (loading) {
        return <div className="min-h-screen px-6 py-10">Loading account...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen px-6 py-10 md:px-12">
            <main className="mx-auto max-w-4xl space-y-6">
                <section className="card p-6">
                    <h1 className="text-3xl font-bold">Welcome to Global Portfolios</h1>
                    <p className="mt-2 text-sm text-gray-600">{user.email} · role: {user.role} · status: {user.verificationStatus}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <Link className="rounded-xl bg-emerald-600 px-4 py-2 text-white" href="/app/profile">
                            My Data Profile
                        </Link>
                        {user.role !== "student" ? (
                            <Link className="rounded-xl border border-emerald-300 px-4 py-2" href="/investor/dashboard">
                                Candidate Dashboard
                            </Link>
                        ) : null}
                        <button className="rounded-xl border border-gray-300 px-4 py-2" onClick={handleLogout} type="button">
                            Logout
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
}
