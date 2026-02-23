"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type UserData = {
    _id: string;
    email: string;
    role: string;
    verificationStatus?: string;
    createdAt?: string;
};

export default function AdminUserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [user, setUser] = useState<UserData | null>(null);
    const [portfolio, setPortfolio] = useState<object | null>(null);
    const [university, setUniversity] = useState<object | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [role, setRole] = useState("");
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [userRes, portfolioRes, universityRes] = await Promise.all([
                fetch(`/api/admin/users/${id}`, { credentials: "include" }),
                fetch(`/api/admin/users/${id}/portfolio`, { credentials: "include" }),
                fetch(`/api/admin/users/${id}/university`, { credentials: "include" }),
            ]);

            if (userRes.status === 403) {
                router.push("/admin");
                return;
            }
            if (!userRes.ok) {
                setError("User not found");
                return;
            }

            const userData = (await userRes.json()) as { data?: UserData };
            setUser(userData.data ?? null);
            setRole(userData.data?.role ?? "");

            if (portfolioRes.ok) {
                const p = (await portfolioRes.json()) as { data?: unknown };
                setPortfolio(typeof p.data === "object" && p.data !== null ? p.data : null);
            } else {
                setPortfolio(null);
            }
            if (universityRes.ok) {
                const u = (await universityRes.json()) as { data?: unknown };
                setUniversity(typeof u.data === "object" && u.data !== null ? u.data : null);
            } else {
                setUniversity(null);
            }
        } catch {
            setError("Failed to load");
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        void load();
    }, [load]);

    async function handleUpdateRole() {
        if (!user || saving) return;
        setSaving(true);
        setError("");
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role }),
            });
            if (res.ok) {
                const data = (await res.json()) as { data?: UserData };
                setUser(data.data ?? user);
            } else {
                const err = (await res.json()) as { error?: string };
                setError(err.error ?? "Update failed");
            }
        } catch {
            setError("Network error");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!user || deleting || !confirm("Delete this user permanently? This cannot be undone.")) return;
        setDeleting(true);
        setError("");
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                router.push("/admin/users");
                return;
            }
            const err = (await res.json()) as { error?: string };
            setError(err.error ?? "Delete failed");
        } catch {
            setError("Network error");
        } finally {
            setDeleting(false);
        }
    }

    if (loading) return <div className="p-6">Loading...</div>;
    if (!user) return <div className="p-6">User not found. <Link href="/admin/users" className="text-emerald-600 underline">Back to list</Link></div>;

    return (
        <div className="min-h-screen px-6 py-10 md:px-12">
            <main className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/users" className="text-sm text-gray-600 hover:underline">← Users</Link>
                    <h1 className="text-2xl font-bold">User: {user.email}</h1>
                </div>

                {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

                <section className="card p-6">
                    <h2 className="text-lg font-semibold">Details</h2>
                    <p className="mt-2 text-sm text-gray-600">ID: {user._id}</p>
                    <p className="text-sm text-gray-600">Email: {user.email}</p>
                    <p className="text-sm text-gray-600">Role: {user.role}</p>
                    <p className="text-sm text-gray-600">Verification: {user.verificationStatus ?? "—"}</p>
                    <p className="text-sm text-gray-600">Created: {user.createdAt ? new Date(user.createdAt).toLocaleString() : "—"}</p>

                    <div className="mt-6 flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">Change role:</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            >
                                <option value="student">student</option>
                                <option value="university">university</option>
                                <option value="investor">investor</option>
                                <option value="admin">admin</option>
                            </select>
                            <button
                                type="button"
                                onClick={() => void handleUpdateRole()}
                                disabled={saving || role === user.role}
                                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save role"}
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => void handleDelete()}
                            disabled={deleting}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                        >
                            {deleting ? "Deleting..." : "Delete user"}
                        </button>
                    </div>
                </section>

                {user.role === "student" && portfolio && (
                    <section className="card p-6">
                        <h2 className="text-lg font-semibold">Student portfolio (read-only)</h2>
                        <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-gray-50 p-4 text-xs">
                            {JSON.stringify(portfolio, null, 2)}
                        </pre>
                    </section>
                )}

                {user.role === "university" && university && (
                    <section className="card p-6">
                        <h2 className="text-lg font-semibold">University data (read-only)</h2>
                        <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-gray-50 p-4 text-xs">
                            {JSON.stringify(university, null, 2)}
                        </pre>
                    </section>
                )}

                {user.role === "student" && !portfolio && (
                    <section className="card p-6">
                        <p className="text-sm text-gray-500">No student portfolio found for this user.</p>
                    </section>
                )}

                {user.role === "university" && !university && (
                    <section className="card p-6">
                        <p className="text-sm text-gray-500">No university profile found for this user.</p>
                    </section>
                )}
            </main>
        </div>
    );
}
