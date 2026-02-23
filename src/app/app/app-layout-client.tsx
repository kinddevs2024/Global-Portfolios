"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const STUDENT_NAV = [
    { href: "/app", label: "Dashboard", icon: "▦" },
    { href: "/app/applications", label: "Application", icon: "▤" },
    { href: "/app/offers", label: "Offers", icon: "◫" },
    { href: "/app/explore", label: "Explore Universities", icon: "▥" },
    { href: "/app/compare", label: "Compare Universities", icon: "⬡" },
];

const UNIVERSITY_NAV = [
    { href: "/app/university/dashboard", label: "Dashboard", icon: "▦" },
    { href: "/app/university/interests", label: "Отклики студентов", icon: "▤" },
    { href: "/app/university/discovery", label: "Discovery", icon: "◫" },
    { href: "/app/university/profile", label: "Профиль университета", icon: "▥" },
    { href: "/app/university/representatives", label: "Представители", icon: "⬡" },
    { href: "/app/university/chats", label: "Чаты", icon: "◕" },
];

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isUniversity = pathname?.startsWith("/app/university");
    const path = pathname ?? "";
    const navItems = isUniversity ? UNIVERSITY_NAV : STUDENT_NAV;

    return (
        <div className="mx-auto w-full max-w-7xl gap-4 px-4 py-4 sm:gap-6 sm:px-6 sm:py-6 md:grid md:grid-cols-[220px_1fr] md:px-10">
            <aside className="card sticky top-[calc(3rem+1px)] h-fit p-3 max-md:static max-md:mb-4">
                <nav className="space-y-0.5">
                    {navItems.map((item) => {
                        const isActive = path === item.href || (item.href !== "/app" && item.href !== "/app/university/dashboard" && path.startsWith(item.href));
                        const isActiveDashboard = (item.href === "/app" && path === "/app") || (item.href === "/app/university/dashboard" && path === "/app/university/dashboard");
                        const active = isActive || isActiveDashboard;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                    active
                                        ? "bg-[var(--accent)] text-[var(--primary-foreground)]"
                                        : "text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
                                }`}
                            >
                                <span className="opacity-80">{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                {!isUniversity && (
                    <div className="mt-4 space-y-0.5 border-t border-[var(--border)] pt-3">
                        <Link className="block rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]" href="/app/portfolio">
                            Портфолио
                        </Link>
                        <Link className="block rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]" href="/app/profile">
                            Профиль
                        </Link>
                        <Link className="block rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]" href="/app/chats">
                            Чаты
                        </Link>
                    </div>
                )}
            </aside>
            <main className="min-w-0">{children}</main>
        </div>
    );
}
