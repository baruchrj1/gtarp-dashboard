"use client";

import { SessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";
import { useEffect } from "react";
import { ToastProvider } from "@/components/ui/Toast";

// Global SWR fetcher
const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error("An error occurred while fetching the data.");
        throw error;
    }
    return res.json();
};

// SWR global configuration
const swrConfig = {
    fetcher,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    shouldRetryOnError: true,
};

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            if (
                event.reason?.message?.includes("Corruption") ||
                event.reason?.message?.includes("IndexedDB")
            ) {
                console.warn(
                    "[Provider] IndexedDB error caught, clearing affected storage:",
                    event.reason
                );
                event.preventDefault();
                if (typeof window !== "undefined" && "indexedDB" in window) {
                    const req = indexedDB.deleteDatabase("next-auth");
                    req.onerror = (e) => console.error("[Provider] Failed to clear IndexedDB:", e);
                    req.onsuccess = () => console.log("[Provider] IndexedDB cleared successfully");
                }
            }
        };

        window.addEventListener("unhandledrejection", handleUnhandledRejection);
        return () => window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    }, []);

    return (
        <SessionProvider>
            <SWRConfig value={swrConfig}>
                <ToastProvider>{children}</ToastProvider>
            </SWRConfig>
        </SessionProvider>
    );
}
