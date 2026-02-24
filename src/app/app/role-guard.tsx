"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function RoleGuard({ role, children }: { role: string; children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!role) return;
        const path = pathname ?? "";

        if (path.startsWith("/app/university")) {
            if (role !== "university") {
                router.replace("/app");
                return;
            }
        } else if (path.startsWith("/app")) {
            if (role === "university") {
                router.replace("/app/university/dashboard");
                return;
            }
        }
    }, [role, pathname, router]);

    return <>{children}</>;
}
