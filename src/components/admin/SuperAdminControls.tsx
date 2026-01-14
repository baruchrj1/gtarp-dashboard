"use client";

import { useState, useEffect } from "react";
import { Loader2, LayoutDashboard, LogOut, ArrowRightLeft, Shield, X, ChevronUp, ChevronDown } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface SuperAdminControlsProps {
    currentTenant: { name: string; slug: string } | null;
}

export function SuperAdminControls({ currentTenant }: SuperAdminControlsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Only show on client side to avoid hydration mismatch if initial state differs? 
    // Actually, we passed internal check from server, so it should be fine.

    async function handleExitMasquerade() {
        if (!confirm("Sair do modo espião e voltar ao padrão?")) return;
        setIsLoading(true);
        try {
            await fetch("/api/admin/switch-tenant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug: null }), // Null clears the cookie
            });
            // Force reload
            window.location.href = "/master";
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    }

    async function handleSwitchTenant() {
        router.push("/master/tenants");
    }

    if (!currentTenant) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] font-sans">
            {/* Main Toggle Button */}
            <div className={`flex flex-col items-end gap-2 transition-all duration-300 ${isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>

                {/* Menu Items */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl p-2 w-64 flex flex-col gap-1 backdrop-blur-xl mb-2">
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Modo Super Admin</p>
                        <p className="text-xs font-medium text-white truncate">
                            {currentTenant ? `Espionando: ${currentTenant.name}` : "Navegando: Master"}
                        </p>
                    </div>

                    <button
                        onClick={() => router.push("/master")}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Painel Master</span>
                    </button>

                    <button
                        onClick={handleSwitchTenant}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                    >
                        <ArrowRightLeft className="w-4 h-4" />
                        <span>Trocar de Cidade</span>
                    </button>

                    <button
                        onClick={handleExitMasquerade}
                        disabled={isLoading}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                        <span>Sair do Modo Espião</span>
                    </button>
                </div>
            </div>

            {/* Floating Trigger */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`h-12 w-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 ${isExpanded ? 'bg-zinc-800 text-white rotate-180' : 'bg-violet-600 text-white hover:bg-violet-500'}`}
                title="Controles Super Admin"
            >
                {isExpanded ? <X className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </button>
        </div>
    );
}
