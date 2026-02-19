const filters = [
  "Country",
  "Age",
  "GPA",
  "Olympiads",
  "Skills",
  "Technologies",
  "Ranking Tier",
  "AI Potential",
  "Project Type",
  "Language",
  "Grant Status",
];

export default function UniversityDashboardPage() {
  return (
    <div className="min-h-screen px-6 py-10 md:px-12">
      <main className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">University Dashboard</h1>
        <p className="text-sm text-gray-600">Ranked candidates, AI matching, and advanced selection filters.</p>

        <section className="card p-5">
          <h2 className="text-base font-semibold">Filter Engine</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <span key={filter} className="pill rounded-full px-3 py-1 text-xs font-medium">
                {filter}
              </span>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
