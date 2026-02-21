import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_TOKEN_COOKIE, fetchBackendWithFallback } from "@/lib/auth/backendAuth";

type ProxyInit = {
    method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    body?: unknown;
};

export async function backendAuthedFetch(path: string, init: ProxyInit = {}, request?: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let backendResponse: Response;
    try {
        const result = await fetchBackendWithFallback(
            path,
            {
                method: init.method ?? "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    ...(init.body ? { "Content-Type": "application/json" } : {}),
                },
                body: init.body ? JSON.stringify(init.body) : undefined,
                cache: "no-store",
            },
            request,
        );

        backendResponse = result.response;
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Backend is unavailable" },
            { status: 502 },
        );
    }

    let payload: unknown = null;
    try {
        payload = await backendResponse.json();
    } catch {
        payload = null;
    }

    if (!backendResponse.ok) {
        const message =
            payload && typeof payload === "object" && "message" in payload
                ? String((payload as { message?: string }).message)
                : "Request failed";

        return NextResponse.json({ error: message }, { status: backendResponse.status });
    }

    return NextResponse.json(payload, { status: backendResponse.status });
}
