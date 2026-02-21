import { backendAuthedFetch } from "@/lib/auth/backendProxy";

export async function GET() {
    return backendAuthedFetch("/chat/conversations");
}
