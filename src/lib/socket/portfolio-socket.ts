import { io, Socket } from "socket.io-client";
import { getSocketOrigin } from "@/lib/auth/backendAuth";
import { getCookie } from "./getCookie";
import { AUTH_TOKEN_COOKIE } from "@/lib/auth/backendAuth";

const PORTFOLIO_NAMESPACE = "/portfolio";

export type PortfolioSocket = Socket;

export function createPortfolioSocket(): Socket | null {
    if (typeof window === "undefined") return null;
    const token = getCookie(AUTH_TOKEN_COOKIE);
    if (!token) return null;
    const origin = getSocketOrigin();
    const socket = io(origin + PORTFOLIO_NAMESPACE, {
        auth: { token },
        path: "/socket.io",
        transports: ["websocket", "polling"],
    });
    return socket;
}
