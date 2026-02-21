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