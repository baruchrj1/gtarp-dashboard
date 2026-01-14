'use client';

import { useEffect } from 'react';

// Global error boundary for the root layout
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[Global Error Boundry]', error);
    }, [error]);

    return (
        <html>
            <body className="bg-black text-white flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-2xl font-bold text-red-500 mb-4">Erro Crítico no Sistema</h2>
                <p className="mb-4">Ocorreu um erro irrecoverável na inicialização.</p>
                <pre className="bg-zinc-900 p-4 rounded text-xs text-zinc-400 mb-6 max-w-lg overflow-auto">
                    {error.message}
                    {error.digest && `\n\nDigest: ${error.digest}`}
                </pre>
                <button
                    onClick={() => reset()}
                    className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 transition"
                >
                    Tentar Novamente
                </button>
            </body>
        </html>
    );
}
