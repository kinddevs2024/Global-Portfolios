import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/guards";

export default async function UniversityPanelLayout({ children }: { children: React.ReactNode }) {
    try {
        await requireAuth(["university", "admin"]);
        return <>{children}</>;
    } catch {
        redirect("/auth/login");
    }
}
