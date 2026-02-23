"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { createPortfolioSocket } from "@/lib/socket/portfolio-socket";

type PortfolioSocketContextValue = {
    socket: Socket | null;
    isConnected: boolean;
    /** Subscribe to new notifications (returns unsubscribe). */
    onNotification: (callback: (payload: unknown) => void) => () => void;
    /** Subscribe to new chat messages (returns unsubscribe). */
    onMessage: (callback: (payload: unknown) => void) => () => void;
    /** Join a conversation room to receive message:new for that conversation. */
    joinConversation: (conversationId: string) => void;
    /** Leave a conversation room. */
    leaveConversation: (conversationId: string) => void;
};

const PortfolioSocketContext = createContext<PortfolioSocketContextValue | null>(null);

export function PortfolioSocketProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const notificationListeners = useRef<Set<(payload: unknown) => void>>(new Set());
    const messageListeners = useRef<Set<(payload: unknown) => void>>(new Set());

    useEffect(() => {
        const s = createPortfolioSocket();
        if (!s) {
            setSocket(null);
            setIsConnected(false);
            return;
        }
        setSocket(s);

        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);
        const onNotification = (payload: unknown) => {
            notificationListeners.current.forEach((cb) => cb(payload));
        };
        const onMessage = (payload: unknown) => {
            messageListeners.current.forEach((cb) => cb(payload));
        };

        s.on("connect", onConnect);
        s.on("disconnect", onDisconnect);
        s.on("notification:new", onNotification);
        s.on("message:new", onMessage);

        if (s.connected) setIsConnected(true);

        return () => {
            s.off("connect", onConnect);
            s.off("disconnect", onDisconnect);
            s.off("notification:new", onNotification);
            s.off("message:new", onMessage);
            s.disconnect();
        };
    }, []);

    const onNotification = useCallback((callback: (payload: unknown) => void) => {
        notificationListeners.current.add(callback);
        return () => {
            notificationListeners.current.delete(callback);
        };
    }, []);

    const onMessage = useCallback((callback: (payload: unknown) => void) => {
        messageListeners.current.add(callback);
        return () => {
            messageListeners.current.delete(callback);
        };
    }, []);

    const joinConversation = useCallback(
        (conversationId: string) => {
            socket?.emit("join-conversation", conversationId);
        },
        [socket]
    );

    const leaveConversation = useCallback(
        (conversationId: string) => {
            socket?.emit("leave-conversation", conversationId);
        },
        [socket]
    );

    const value: PortfolioSocketContextValue = {
        socket,
        isConnected,
        onNotification,
        onMessage,
        joinConversation,
        leaveConversation,
    };

    return (
        <PortfolioSocketContext.Provider value={value}>
            {children}
        </PortfolioSocketContext.Provider>
    );
}

export function usePortfolioSocket(): PortfolioSocketContextValue {
    const ctx = useContext(PortfolioSocketContext);
    if (!ctx) {
        throw new Error("usePortfolioSocket must be used within PortfolioSocketProvider");
    }
    return ctx;
}

/** Safe hook that returns null if used outside provider (e.g. on public pages). */
export function usePortfolioSocketOptional(): PortfolioSocketContextValue | null {
    return useContext(PortfolioSocketContext);
}
