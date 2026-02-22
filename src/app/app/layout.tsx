import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/guards";
import LogoutButton from "./logout-button";
import LanguageMenu from "@/components/language-menu";
import AppLayoutClient from "./app-layout-client";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
    try {
        await requireAuth();
    } catch {
        redirect("/auth/login");
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="bg-[var(--surface)]">
                <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
                    <div className="flex items-center justify-between gap-4 border-b border-emerald-100 py-4">
                        <div className="flex items-center gap-3">
                            <Image alt="Global Portfolios logo" className="h-10 w-10 object-contain" height={40} src="/logo_logo.png" width={40} />
                            <div>
                                <p className="text-base font-semibold">Global Portfolios</p>
                                <p className="text-xs text-gray-500">Bridge between students and universities</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <LanguageMenu />
                            <Link className="rounded-lg px-3 py-2 text-sm hover:bg-emerald-50" href="/">
                                Главная сайта
                            </Link>
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </header>

            <AppLayoutClient>{children}</AppLayoutClient>
        </div>
    );
}
