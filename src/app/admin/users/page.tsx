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

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="min-h-screen px-6 py-10 md:px-12">
            <main className="mx-auto max-w-6xl space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/dashboard" className="text-sm text-gray-600 hover:underline">← Dashboard</Link>
                    <h1 className="text-3xl font-bold">User Management</h1>
                </div>

                <div className="card overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="p-3 font-medium">Email</th>
                                <th className="p-3 font-medium">Role</th>
                                <th className="p-3 font-medium">Status</th>
                                <th className="p-3 font-medium">Created</th>
                                <th className="p-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u._id} className="border-b last:border-0">
                                    <td className="p-3">{u.email}</td>
                                    <td className="p-3">{u.role}</td>
                                    <td className="p-3">{u.verificationStatus ?? "—"}</td>
                                    <td className="p-3">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                                    <td className="p-3">
                                        <Link
                                            href={`/admin/users/${u._id}`}
                                            className="text-emerald-600 hover:underline"
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
