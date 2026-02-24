import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/guards";
import LogoutButton from "./logout-button";
import LanguageMenu from "@/components/language-menu";
import AppLayoutClient from "./app-layout-client";
import { PortfolioSocketProvider } from "@/contexts/PortfolioSocketContext";
import { RoleGuard } from "./role-guard";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
    let auth: { userId: string; role: string; email: string };
    try {
        auth = await requireAuth();
    } catch {
        redirect("/auth/login");
    }

    if (auth.role === "admin") {
        redirect("/admin");
    }

    return (
        <PortfolioSocketProvider>
            <RoleGuard role={auth.role}>
            <div className="min-h-screen bg-background">
                <header
                    className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] backdrop-blur-md"
                    style={{ background: "var(--surface)" }}
                >
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 md:px-10">
                        <div className="flex min-w-0 items-center gap-3">
                            <Image alt="Global Portfolios" className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10" height={40} src="/logo_logo.png" width={40} />
                            <div className="min-w-0">
                                <p className="truncate text-base font-semibold text-[var(--foreground)]">Global Portfolios</p>
                                <p className="hidden truncate text-xs text-[var(--text-muted)] sm:block">Bridge between students and universities</p>
                            </div>
                        </div>
                        <nav className="flex shrink-0 items-center gap-2 sm:gap-3">
                            <LanguageMenu />
                            <Link className="rounded-lg px-2 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)] sm:px-3" href="/">
                                Главная
                            </Link>
                            <LogoutButton />
                        </nav>
                    </div>
                </header>

                <AppLayoutClient>{children}</AppLayoutClient>
            </div>
            </RoleGuard>
        </PortfolioSocketProvider>
    );
}
