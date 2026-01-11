'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to monitoring service
        console.error('Error boundary caught:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
            <div className="gta-card p-8 max-w-md text-center space-y-6">
                {/* Error Icon */}
                <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full border-2 border-red-500/30 flex items-center justify-center animate-pulse">
                    <svg
                        className="w-10 h-10 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                {/* Error Message */}
                <div>
                    <h2 className="text-2xl font-bold text-red-500 mb-2 font-display uppercase tracking-wide">
                        Algo deu errado!
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        {error.message || 'Ocorreu um erro inesperado. Por favor, tente novamente.'}
                    </p>
                    {error.digest && (
                        <p className="text-xs text-muted-foreground mt-2 font-mono">
                            ID do erro: {error.digest}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="gta-btn"
                    >
                        Tentar Novamente
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="gta-btn-secondary"
                    >
                        Voltar ao Início
                    </button>
                </div>
            </div>
        </div>
    );
}
