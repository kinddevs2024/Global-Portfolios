import { backendAuthedFetch } from "@/lib/auth/backendProxy";

export async function POST(request: Request) {
    const body = await request.json().catch(() => ({}));
    return backendAuthedFetch("/applications/invite-by-user", { method: "POST", body }, request);
}
