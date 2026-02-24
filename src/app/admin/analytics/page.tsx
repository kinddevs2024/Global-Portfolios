"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type PageViewRow = { path: string; count: number };

export default function AdminAnalyticsPage() {
    const [pageViews, setPageViews] = useState<PageViewRow[]>([]);
    const [onlineNow, setOnlineNow] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        try {
            setError("");
            const res = await fetch("/api/admin/analytics", { credentials: "include" });
            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    window.location.assign("/admin");
                    return;
                }
                const data = (await res.json()) as { error?: string };
                setError(data.error ?? "Failed to load analytics");
                return;
            }
            const data = (await res.json()) as { pageViews?: PageViewRow[]; onlineNow?: number };
            setPageViews(Array.isArray(data.pageViews) ? data.pageViews : []);
            setOnlineNow(typeof data.onlineNow === "number" ? data.onlineNow : 0);
        } catch {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
        const t = setInterval(load, 30 * 1000);
        return () => clearInterval(t);
    }, [load]);

    return (
        <div className="min-h-screen px-6 py-10 md:px-12">
            <main className="mx-auto max-w-3xl space-y-6">
                <Link href="/admin/dashboard" className="text-sm text-gray-600 hover:underline">
                    ← Admin dashboard
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                <p className="text-sm text-gray-600">
                    Page views (how many times each page was opened) and number of users currently on the site (active in the last 2 minutes).
                </p>

                {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

                {loading ? (
                    <p className="text-gray-500">Loading…</p>
                ) : (
                    <>
                        <div className="card">
                            <h2 className="text-lg font-semibold">Online now</h2>
                            <p className="mt-2 text-3xl font-bold text-emerald-600">{onlineNow}</p>
                            <p className="mt-1 text-xs text-gray-500">Unique sessions active in the last 2 minutes</p>
                        </div>

                        <div className="card overflow-hidden">
                            <h2 className="mb-3 text-lg font-semibold">Page views</h2>
                            {pageViews.length === 0 ? (
                                <p className="text-gray-500">No page views recorded yet.</p>
                            ) : (
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50">
                                            <th className="p-3 font-medium">Path</th>
                                            <th className="p-3 font-medium text-right">Views</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pageViews.map((row) => (
                                            <tr key={row.path} className="border-b border-gray-100 last:border-0">
                                                <td className="p-3 font-mono text-gray-700">{row.path}</td>
                                                <td className="p-3 text-right font-medium">{row.count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
