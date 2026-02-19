export default function Home() {
  return (
    <div className="min-h-screen px-6 py-10 md:px-12">
      <main className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-4">
          <span className="pill inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
            Student ↔ University Bridge
          </span>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">Global Portfolios</h1>
          <p className="max-w-3xl text-base text-gray-600 md:text-lg">
            Intelligent ranking and verified portfolio platform for transparent student selection.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <a className="card p-6 transition hover:-translate-y-0.5" href="/auth/register">
            <h2 className="text-lg font-semibold">Register</h2>
            <p className="mt-2 text-sm text-gray-600">Create account as Student, Investor, University, or Admin.</p>
          </a>
          <a className="card p-6 transition hover:-translate-y-0.5" href="/auth/login">
            <h2 className="text-lg font-semibold">Login</h2>
            <p className="mt-2 text-sm text-gray-600">Sign in and open your account workspace.</p>
          </a>
          <a className="card p-6 transition hover:-translate-y-0.5" href="/app">
            <h2 className="text-lg font-semibold">Open Platform</h2>
            <p className="mt-2 text-sm text-gray-600">Manage your data profile and access role-based dashboards.</p>
          </a>
        </section>
      </main>
    </div>
  );
}
