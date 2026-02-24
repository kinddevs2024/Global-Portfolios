import Link from "next/link";
import { requireAuth } from "@/lib/auth/guards";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
    try {
        await requireAuth(["admin"]);
    } catch {
        redirect("/admin");
    }

    const areas = [
        { href: "/admin/users", label: "User Management", description: "View, edit roles, delete users. View student portfolios and university data." },
        { href: "/admin/scoring-weights", label: "Scoring Weights", description: "Manage scoring policy." },
        { href: "/admin/analytics", label: "Analytics", description: "Page views and how many users are online now." },
    ];

    return (
        <div className="min-h-screen px-6 py-10 md:px-12">
            <main className="mx-auto max-w-6xl space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
                <p className="text-sm text-gray-600">Full control: users, roles, portfolios, universities (chats are not visible).</p>

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
