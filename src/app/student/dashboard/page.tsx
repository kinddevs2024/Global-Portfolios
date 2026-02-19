const studentCards = [
  { title: "Academic Score", range: "0–100" },
  { title: "Olympiad Score", range: "0–150" },
  { title: "Project Score", range: "0–120" },
  { title: "Skills Score", range: "0–80" },
  { title: "Activity Score", range: "0–50" },
  { title: "AI Potential", range: "0–100" },
];

export default function StudentDashboardPage() {
  return (
    <div className="min-h-screen px-6 py-10 md:px-12">
      <main className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="text-sm text-gray-600">Build verified portfolio and monitor your Global Score position.</p>

        <section className="grid gap-4 md:grid-cols-3">
          {studentCards.map((card) => (
            <article key={card.title} className="card p-5">
              <h2 className="text-base font-semibold">{card.title}</h2>
              <p className="mt-2 text-sm text-gray-600">Range: {card.range}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
