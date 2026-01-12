'use client';

import { useEffect } from 'react';

/**
 * Service Worker Registration Component
 * Registers the service worker for offline support and caching
 */
export function ServiceWorkerRegistration() {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
            // Register service worker
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('[SW] Service Worker registered successfully:', registration.scope);

                    // Check for updates periodically
                    setInterval(() => {
                        registration.update();
                    }, 60000); // Check every minute
                })
                .catch((error) => {
                    console.error('[SW] Service Worker registration failed:', error);
                });

            // Listen for updates
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('[SW] New service worker activated, reloading page...');
                window.location.reload();
            });
        }
    }, []);

    return null; // This component doesn't render anything
}
