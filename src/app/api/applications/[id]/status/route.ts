import { backendAuthedFetch } from "@/lib/auth/backendProxy";

type Params = {
    params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
    const { id } = await params;
    const body = (await request.json()) as { status: "accepted" | "rejected" | "withdrawn" };
    return backendAuthedFetch(`/applications/${id}/status`, { method: "PATCH", body }, request);
}
