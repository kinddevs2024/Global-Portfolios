import Link from "next/link";
import Image from "next/image";
import { requireAuth } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function Home() {
  let showCabinet = false;

  try {
    const auth = await requireAuth();
    showCabinet = auth.role !== "admin";
  } catch {
    showCabinet = false;
  }

  return (
    <div className="min-h-screen px-6 py-8 md:px-12 md:py-10">
      <main className="mx-auto max-w-6xl space-y-8">
        <header className="card p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image alt="Global Portfolios logo" className="h-10 w-10 object-contain" height={40} src="/logo_logo.png" width={40} />
              <div className="space-y-1">
                <p className="text-lg font-semibold">Global Portfolios</p>
                <p className="text-sm text-gray-600">Student ↔ University Bridge Platform</p>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-3 text-sm">
              <a className="rounded-lg px-3 py-2 hover:bg-emerald-50" href="#about">About</a>
              <a className="rounded-lg px-3 py-2 hover:bg-emerald-50" href="#contact">Contact</a>
              {showCabinet ? (
                <Link className="rounded-xl bg-emerald-600 px-4 py-2 text-white" href="/app">Кабинет</Link>
              ) : (
                <>
                  <Link className="rounded-xl border border-emerald-300 px-4 py-2" href="/auth/choose-role">Register</Link>
                  <Link className="rounded-xl bg-emerald-600 px-4 py-2 text-white" href="/auth/login">Login</Link>
                </>
              )}
            </nav>
          </div>
        </header>

        <section className="card p-6 md:p-10">
          <span className="pill inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
            Verified selection platform
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">Find strong students and build trust in admissions</h1>
          <p className="mt-4 max-w-3xl text-base text-gray-600 md:text-lg">
            Global Portfolios helps students present verified achievements and helps universities evaluate applicants fairly using transparent scoring, profile verification, and structured communication.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {showCabinet ? (
              <Link className="rounded-xl bg-emerald-600 px-5 py-3 text-white" href="/app">Перейти в кабинет</Link>
            ) : (
              <>
                <Link className="rounded-xl bg-emerald-600 px-5 py-3 text-white" href="/auth/login">Login to platform</Link>
                <Link className="rounded-xl border border-emerald-300 px-5 py-3" href="/auth/choose-role">Create account</Link>
              </>
            )}
          </div>
        </section>

        <section id="about" className="grid gap-4 md:grid-cols-3">
          <article className="card p-6">
            <h2 className="text-lg font-semibold">Why this platform</h2>
            <p className="mt-2 text-sm text-gray-600">Structured profiles reduce noise and make student strengths comparable across regions and schools.</p>
          </article>
          <article className="card p-6">
            <h2 className="text-lg font-semibold">How it works</h2>
            <p className="mt-2 text-sm text-gray-600">Register, login, complete your profile, then participate in matching and application workflows.</p>
          </article>
          <article className="card p-6">
            <h2 className="text-lg font-semibold">Who uses it</h2>
            <p className="mt-2 text-sm text-gray-600">Students, universities, and administrators working with transparent, role-based access.</p>
          </article>
        </section>

        <section id="contact" className="card p-6">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="mt-2 text-sm text-gray-600">Questions or partnership requests: support@globalportfolios.app</p>
        </section>
      </main>
    </div>
  );
}
