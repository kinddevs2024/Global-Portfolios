export const AUTH_TOKEN_COOKIE = "gp_token";
export const AUTH_REFRESH_TOKEN_COOKIE = "gp_refresh_token";

const defaultBackendApiBase = "http://127.0.0.1:4000/api";

export function getBackendApiBase() {
    return (process.env.BACKEND_API_URL ?? defaultBackendApiBase).replace(/\/$/, "");
}

export function getBackendApiUrl(path: string) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${getBackendApiBase()}${normalizedPath}`;
}

export async function parseBackendErrorMessage(response: Response, fallback: string) {
    try {
        const payload = (await response.json()) as { message?: string; error?: string };
        return payload.message ?? payload.error ?? fallback;
    } catch {
        return fallback;
    }
}

function parseBooleanEnv(value: string | undefined) {
    if (!value) return undefined;
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) return true;
    if (["0", "false", "no", "off"].includes(normalized)) return false;
    return undefined;
}

export function shouldUseSecureAuthCookies(request: Request) {
    const forced = parseBooleanEnv(process.env.AUTH_COOKIE_SECURE);
    if (typeof forced === "boolean") {
        return forced;
    }

    const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
    if (forwardedProto) {
        return forwardedProto === "https";
    }

    try {
        return new URL(request.url).protocol === "https:";
    } catch {
        return process.env.NODE_ENV === "production";
    }
}

function normalizeApiBase(value: string) {
    const trimmed = value.trim().replace(/\/$/, "");
    return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

export function getBackendApiBaseCandidates(request?: Request) {
    const candidates = new Set<string>([
        normalizeApiBase(getBackendApiBase()),
        "http://127.0.0.1:4000/api",
        "http://localhost:4000/api",
    ]);

    if (request) {
        try {
            const hostname = new URL(request.url).hostname;
            if (hostname && hostname !== "127.0.0.1" && hostname !== "localhost") {
                candidates.add(`http://${hostname}:4000/api`);
            }
        } catch {
            // no-op
        }
    }

    return Array.from(candidates);
}

export function getBackendApiUrlCandidates(path: string, request?: Request) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return getBackendApiBaseCandidates(request).map((base) => `${base}${normalizedPath}`);
}

type BackendFetchResult = {
    response: Response;
    url: string;
};

export async function fetchBackendWithFallback(path: string, init: RequestInit = {}, request?: Request): Promise<BackendFetchResult> {
    const candidates = getBackendApiUrlCandidates(path, request);
    let lastError: unknown = null;

    for (const url of candidates) {
        try {
            const response = await fetch(url, init);
            return { response, url };
        } catch (error) {
            lastError = error;
        }
    }

    throw new Error(`Backend fetch failed for candidates: ${candidates.join(", ")}. Last error: ${String(lastError)}`);
}