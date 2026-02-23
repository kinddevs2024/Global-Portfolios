"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type UserItem = {
    _id: string;
    email: string;
    role: string;
    verificationStatus?: string;
    createdAt: string;
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/admin/users", { credentials: "include" });
                if (res.ok) {
                    const data = (await res.json()) as { items?: UserItem[] };
                    setUsers(data.items ?? []);
                } else if (res.status === 403) {
                    window.location.assign("/admin");
                }
            } catch {
                setUsers([]);
            } finally {
                setLoading(false);
            }
        }
        void load();
    }, []);

    if (loading) return <div className="p-6 text-[var(--text-muted)]">Loading...</div>;

    return (
        <div className="page-container min-h-screen px-4 py-6 sm:px-6 sm:py-8 md:px-10">
            <main className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <Link href="/admin/dashboard" className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] hover:underline">← Dashboard</Link>
                    <h1 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">User Management</h1>
                </div>

                <div className="card overflow-x-auto overflow-y-hidden">
                    <table className="w-full min-w-[520px] text-left text-sm">
                        <thead className="border-b border-[var(--border)] bg-[var(--surface-soft)]">
                            <tr>
                                <th className="p-3 font-medium text-[var(--foreground)]">Email</th>
                                <th className="p-3 font-medium text-[var(--foreground)]">Role</th>
                                <th className="p-3 font-medium text-[var(--foreground)]">Status</th>
                                <th className="p-3 font-medium text-[var(--foreground)]">Created</th>
                                <th className="p-3 font-medium text-[var(--foreground)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u._id} className="border-b border-[var(--border)] last:border-0">
                                    <td className="p-3 text-[var(--foreground)]">{u.email}</td>
                                    <td className="p-3 text-[var(--foreground)]">{u.role}</td>
                                    <td className="p-3 text-[var(--text-muted)]">{u.verificationStatus ?? "—"}</td>
                                    <td className="p-3 text-[var(--text-muted)]">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                                    <td className="p-3">
                                        <Link
                                            href={`/admin/users/${u._id}`}
                                            className="font-medium text-[var(--accent)] hover:underline"
                                        >
                                            View / Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
