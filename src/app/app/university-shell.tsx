"use client";

import UniversitySidebar from "./university-sidebar";
import Link from "next/link";
import LogoutButton from "./logout-button";
import LanguageMenu from "@/components/language-menu";

export default function UniversityShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-0 flex-1">
            <UniversitySidebar />
            <div className="flex flex-1 flex-col min-w-0">
                <header className="flex items-center justify-between border-b border-amber-100 bg-white/80 px-6 py-3 backdrop-blur">
                    <div />
                    <div className="flex items-center gap-3">
                        <LanguageMenu />
                        <Link className="rounded-lg px-3 py-2 text-sm hover:bg-amber-50" href="/">
                            Главная сайта
                        </Link>
                        <LogoutButton />
                    </div>
                </header>
                <main className="flex-1 overflow-auto bg-gray-50/30 p-6">{children}</main>
            </div>
        </div>
    );
}
