import { backendAuthedFetch } from "@/lib/auth/backendProxy";

type Params = {
    params: Promise<{ conversationId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
    const { conversationId } = await params;
    return backendAuthedFetch(`/chat/${conversationId}/messages`);
}
