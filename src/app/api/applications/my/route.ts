import { backendAuthedFetch } from "@/lib/auth/backendProxy";

export async function GET(request: Request) {
    return backendAuthedFetch("/applications/my-applications", {}, request);
}
