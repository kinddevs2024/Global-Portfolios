import { requireAuth } from "@/lib/auth/guards";
import { redirect } from "next/navigation";

const adminAreas = [
  "Document Verification",
  "University Verification",
  "Olympiad Validation",
  "Fraud Monitoring",
  "Scoring Weight Management",
];

export default async function AdminDashboardPage() {
    try {
        await requireAuth(["admin"]);
    } catch {
        redirect("/admin");
    }

  return (
    <div className="min-h-screen px-6 py-10 md:px-12">
      <main className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-sm text-gray-600">Govern integrity, verification, and scoring policy controls.</p>

        <section className="grid gap-4 md:grid-cols-2">
          {adminAreas.map((area) => (
            <article key={area} className="card p-5">
              <h2 className="text-base font-semibold">{area}</h2>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
