import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/guards";
import InvestorDashboardClient from "@/app/investor/dashboard/InvestorDashboardClient";

export default async function InvestorDashboardPage() {
    try {
        await requireAuth(["investor", "university", "admin"]);
    } catch {
        redirect("/app");
    }

    return <InvestorDashboardClient />;
}
