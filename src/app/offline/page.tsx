'use client';

/**
 * Offline fallback page
 * Shown when user is offline and page is not cached
 */
export default function OfflinePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="gta-card p-8 max-w-md text-center space-y-6">
                {/* Offline Icon */}
                <div className="w-20 h-20 mx-auto bg-yellow-500/10 rounded-full border-2 border-yellow-500/30 flex items-center justify-center">
                    <svg
                        className="w-10 h-10 text-yellow-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                        />
                    </svg>
                </div>

                {/* Message */}
                <div>
                    <h1 className="text-2xl font-bold text-yellow-500 mb-2 font-display uppercase tracking-wide">
                        Você está offline
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="gta-btn"
                    >
                        Tentar Novamente
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        className="gta-btn-secondary"
                    >
                        Voltar
                    </button>
                </div>

                {/* Tip */}
                <div className="text-xs text-muted-foreground border-t border-border pt-4">
                    💡 <strong>Dica:</strong> Algumas páginas podem funcionar offline se você já as visitou antes.
                </div>
            </div>
        </div>
    );
}
