import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
    AUTH_TOKEN_COOKIE,
    fetchBackendWithFallback,
    parseBackendErrorMessage,
} from "@/lib/auth/backendAuth";

export async function POST(request: Request) {
    const body = (await request.json()) as { toUniversity: string; message?: string };

    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    async function apply() {
        const { response } = await fetchBackendWithFallback("/applications/apply", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            cache: "no-store",
        }, request);
        return response;
    }

    let response: Response;
    try {
        response = await apply();
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Backend is unavailable" }, { status: 502 });
    }

    if (!response.ok) {
        const message = await parseBackendErrorMessage(response, "Request failed");

        if (message.includes("Student profile is required before applying")) {
            let createProfileResponse: Response;
            try {
                const result = await fetchBackendWithFallback("/students", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({}),
                    cache: "no-store",
                }, request);

                createProfileResponse = result.response;
            } catch (error) {
                return NextResponse.json({ error: error instanceof Error ? error.message : "Backend is unavailable" }, { status: 502 });
            }

            if (createProfileResponse.ok || createProfileResponse.status === 409) {
                response = await apply();
            }
        }
    }

    let payload: unknown = null;
    try {
        payload = await response.json();
    } catch {
        payload = null;
    }

    if (!response.ok) {
        const errorMessage =
            payload && typeof payload === "object" && "message" in payload
                ? String((payload as { message?: string }).message)
                : "Request failed";
        return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    return NextResponse.json(payload, { status: response.status });
}
