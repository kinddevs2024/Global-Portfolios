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
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-6 md:grid-cols-[240px_1fr] md:px-10">
            <aside className="card h-fit p-3">
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = path === item.href || (item.href !== "/app" && item.href !== "/app/university/dashboard" && path.startsWith(item.href));
                        const isActiveDashboard = (item.href === "/app" && path === "/app") || (item.href === "/app/university/dashboard" && path === "/app/university/dashboard");
                        const active = isActive || isActiveDashboard;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                    active ? "bg-emerald-600 text-white" : "hover:bg-emerald-50 text-gray-700"
                                }`}
                            >
                                <span className="opacity-80">{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                {!isUniversity && (
                    <div className="mt-4 border-t border-gray-200 pt-3 space-y-1">
                        <Link className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100" href="/app/portfolio">
                            Портфолио
                        </Link>
                        <Link className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100" href="/app/profile">
                            Профиль
                        </Link>
                        <Link className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100" href="/app/chats">
                            Чаты
                        </Link>
                    </div>
                )}
            </aside>
            <main>{children}</main>
        </div>
    );
}
