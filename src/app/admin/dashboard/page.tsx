import Link from "next/link";
import { requireAuth } from "@/lib/auth/guards";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AUTH_TOKEN_COOKIE } from "@/lib/auth/backendAuth";
import { getBackendApiUrl } from "@/lib/auth/backendAuth";

type Analytics = {
    users?: { total?: number; byRole?: { student?: number; university?: number; admin?: number }; activeLast30Days?: number };
    applications?: { total?: number; acceptanceRate?: number };
};

export default async function AdminDashboardPage() {
    try {
        await requireAuth(["admin"]);
    } catch {
        redirect("/admin");
    }

    let analytics: Analytics | null = null;
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
        if (token) {
            const res = await fetch(getBackendApiUrl("/admin/analytics"), {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            });
            if (res.ok) analytics = await res.json();
        }
    } catch {
        analytics = null;
    }

    const areas = [
        { href: "/admin/users", label: "User Management", description: "View, edit roles, delete users. View student portfolios and university data." },
        { href: "/admin/scoring-weights", label: "Scoring Weights", description: "Manage scoring policy." },
    ];

    const u = analytics?.users;
    const a = analytics?.applications;

    return (
        <div className="min-h-screen px-6 py-10 md:px-12">
            <main className="mx-auto max-w-6xl space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
                <p className="text-sm text-gray-600">Full control: users, roles, portfolios, universities (chats are not visible).</p>

                {analytics && (
                    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="card p-4">
                            <p className="text-sm text-gray-600">Users</p>
                            <p className="text-2xl font-bold">{u?.total ?? 0}</p>
                            {u?.byRole && (
                                <p className="mt-1 text-xs text-gray-500">
                                    S: {u.byRole.student ?? 0} · U: {u.byRole.university ?? 0} · A: {u.byRole.admin ?? 0}
                                </p>
                            )}
                        </div>
                        <div className="card p-4">
                            <p className="text-sm text-gray-600">Active (30d)</p>
                            <p className="text-2xl font-bold">{u?.activeLast30Days ?? 0}</p>
                        </div>
                        <div className="card p-4">
                            <p className="text-sm text-gray-600">Applications</p>
                            <p className="text-2xl font-bold">{a?.total ?? 0}</p>
                        </div>
                        <div className="card p-4">
                            <p className="text-sm text-gray-600">Acceptance rate</p>
                            <p className="text-2xl font-bold">{typeof a?.acceptanceRate === "number" ? `${a.acceptanceRate}%` : "—"}</p>
                        </div>
                    </section>
                )}

                <section className="grid gap-4 md:grid-cols-2">
                    {areas.map((area) => (
                        <Link key={area.href} href={area.href}>
                            <article className="card p-5 transition hover:shadow-md">
                                <h2 className="text-base font-semibold">{area.label}</h2>
                                <p className="mt-1 text-sm text-gray-600">{area.description}</p>
                            </article>
                        </Link>
                    ))}
                </section>
            </main>
        </div>
    );
}
