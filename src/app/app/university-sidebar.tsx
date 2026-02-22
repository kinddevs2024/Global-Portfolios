"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/app/university/dashboard", label: "Dashboard", icon: "▦" },
    { href: "/app/university/interests", label: "Отклики студентов", icon: "○" },
    { href: "/app/university/discovery", label: "Discovery", icon: "○" },
    { href: "/app/university/profile", label: "University Profile", icon: "◉" },
    { href: "/app/university/representatives", label: "Manage Representatives", icon: "◐" },
    { href: "/app/university/scholarships", label: "Scholarships", icon: "◔" },
    { href: "/app/university/chats", label: "Chats", icon: "◕" },
    { href: "/app/university/help", label: "Help Center", icon: "◗" },
];

export default function UniversitySidebar() {
    const pathname = usePathname();

    return (
        <aside className="flex w-56 shrink-0 flex-col border-r border-amber-100 bg-gradient-to-b from-amber-50/50 to-white">
            <div className="flex items-center gap-2 border-b border-amber-100 p-4">
                <Image alt="Global Portfolios" height={32} src="/logo_logo.png" width={32} />
                <span className="font-semibold text-amber-900">Global Portfolios</span>
            </div>
            <div className="rounded-xl mx-3 mt-3 bg-amber-100/60 p-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                    U
                </div>
                <p className="mt-2 text-sm font-medium text-amber-900">University</p>
            </div>
            <nav className="mt-4 flex-1 space-y-0.5 px-3 pb-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                isActive
                                    ? "bg-amber-500 text-white shadow-sm"
                                    : "text-amber-900/80 hover:bg-amber-100/80"
                            }`}
                        >
                            <span className="text-base opacity-80">{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t border-amber-100 p-3">
                <div className="flex items-center gap-2 rounded-lg px-2 py-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600" />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-amber-900">Uni Representative</p>
                        <p className="truncate text-[10px] text-amber-700/70">University</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
