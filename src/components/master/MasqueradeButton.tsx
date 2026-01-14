"use client";

import { ArrowUpRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function MasqueradeButton({ tenantSlug }: { tenantSlug: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function handleEnter() {
        if (!confirm(`Entrar no painel de "${tenantSlug}"?`)) return;

        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/switch-tenant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug: tenantSlug }),
            });

            if (res.ok) {
                // Open in new tab so Master remain open
                window.open("/admin", "_blank");
            } else {
                alert("Erro ao entrar: " + (await res.json()).message);
            }
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    }

    return (
        <button
            onClick={handleEnter}
            disabled={isLoading}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-zinc-400 hover:text-violet-400 transition-colors"
            title={`Acessar Painel de ${tenantSlug}`}
        >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
        </button>
    );
}
