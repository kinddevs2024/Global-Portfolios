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