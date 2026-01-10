'use strict';
"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            if (event.reason?.message?.includes('Corruption') || event.reason?.message?.includes('IndexedDB')) {
                console.warn('[Provider] IndexedDB error caught, clearing affected storage:', event.reason);
                event.preventDefault();
                if (typeof window !== 'undefined' && 'indexedDB' in window) {
                    const req = indexedDB.deleteDatabase('next-auth');
                    req.onerror = (e) => console.error('[Provider] Failed to clear IndexedDB:', e);
                    req.onsuccess = () => console.log('[Provider] IndexedDB cleared successfully');
                }
            }
        };

        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    }, []);

    return <SessionProvider>{children}</SessionProvider>;
}
