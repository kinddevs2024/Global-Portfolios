import { backendAuthedFetch } from "@/lib/auth/backendProxy";

type Params = {
    params: Promise<{ conversationId: string }>;
};

export async function GET(request: Request, { params }: Params) {
    const { conversationId } = await params;
    return backendAuthedFetch(`/chat/${conversationId}/messages`, {}, request);
}

export async function POST(request: Request, { params }: Params) {
    const { conversationId } = await params;
    const body = await request.json().catch(() => ({}));
    return backendAuthedFetch(`/chat/${conversationId}/messages`, { method: "POST", body }, request);
}
