"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UniversityShell from "./university-shell";

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isUniversity = pathname?.startsWith("/app/university");

    if (isUniversity) {
        return (
            <div className="flex min-h-0 flex-1">
                <UniversityShell>{children}</UniversityShell>
            </div>
        );
    }

    return (
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-6 md:grid-cols-[240px_1fr] md:px-10">
            <aside className="card h-fit p-3">
                <nav className="space-y-2">
                    <Link className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-emerald-50" href="/app">
                        Главная платформы
                    </Link>
                    <Link className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-emerald-50" href="/app/portfolio">
                        Портфолио
                    </Link>
                    <Link className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-emerald-50" href="/app/profile">
                        Профиль
                    </Link>
                    <Link className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-emerald-50" href="/app/applications">
                        Университеты и интересы
                    </Link>
                    <Link className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-emerald-50" href="/app/chats">
                        Чаты
                    </Link>
                </nav>
            </aside>
            <main>{children}</main>
        </div>
    );
}
