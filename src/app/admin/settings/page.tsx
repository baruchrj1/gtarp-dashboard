"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import { LoadingButton } from "@/components/ui/LoadingButton";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { Settings, Save, Layout, MessageSquare, Palette } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/components/ui/Toast";

export default function SettingsPage() {
    const { data: session } = useSession();
    const { settings, refreshSettings } = useSettings();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // Local state for form
    const [formData, setFormData] = useState({
        server_name: "",
        theme_color: "",
    });

    const PREDEFINED_COLORS = [
        { name: "Roxo (Padrão)", value: "#8B5CF6", class: "bg-[#8B5CF6]" },
        { name: "Azul", value: "#3B82F6", class: "bg-[#3B82F6]" },
        { name: "Verde", value: "#22C55E", class: "bg-[#22C55E]" },
        { name: "Vermelho", value: "#EF4444", class: "bg-[#EF4444]" },
        { name: "Laranja", value: "#F97316", class: "bg-[#F97316]" },
        { name: "Rosa", value: "#EC4899", class: "bg-[#EC4899]" },
    ];

    // Load initial data from Admin API to get all fields including secrets
    useEffect(() => {
        async function loadSettings() {
            try {
                const res = await fetch("/api/admin/settings");
                if (res.ok) {
                    const data = await res.json();
                    if (data.settings) {
                        setFormData((prev) => ({
                            ...prev,
                            // Only load fields we allow editing
                            server_name: data.settings.server_name || "",
                            theme_color: data.settings.theme_color || "#8B5CF6",
                        }));
                    }
                }
            } catch (error) {
                console.error("Failed to load settings", error);
                toast.error("Erro", "Falha ao carregar configurações atuais.");
            } finally {
                setIsInitialLoading(false);
            }
        }
        loadSettings();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/admin/settings/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Falha ao salvar");
            }

            await refreshSettings();
            toast.success("Configurações Salvas", "As configurações do servidor foram atualizadas.");
        } catch (error) {
            console.error(error);
            toast.error("Erro", error instanceof Error ? error.message : "Erro ao salvar configurações.");
        } finally {
            setIsLoading(false);
        }
    }

    if (session?.user?.role !== "ADMIN" && !session?.user?.isAdmin) {
        return (
            <div className="flex h-screen items-center justify-center bg-background text-red-500 font-bold">
                ACESSO NEGADO
            </div>
        );
    }

    if (isInitialLoading) {
        return <PageLoading text="Carregando configurações..." />;
    }

    return (
        <div className="flex flex-col gap-8">
            <main className="flex-1 space-y-8 min-w-0">
                <div className="gta-card p-6 mb-8">
                    <h1 className="text-3xl font-bold font-display uppercase tracking-widest flex items-center gap-3">
                        <Settings className="w-8 h-8 text-primary" />
                        Configurações Gerais
                    </h1>
                    <p className="text-zinc-400 mt-2">Gerencie as informações principais do servidor.</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Form Panel */}
                    <div className="gta-card p-6">
                        <div className="flex items-center gap-2 mb-6 text-zinc-400">
                            <Layout className="w-5 h-5" />
                            <h2 className="font-bold uppercase tracking-wider text-sm">Informações Básicas</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Nome do Servidor */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">
                                    Nome do Servidor
                                </label>
                                <input
                                    type="text"
                                    value={formData.server_name}
                                    onChange={(e) => setFormData({ ...formData, server_name: e.target.value })}
                                    className="w-full bg-input border border-border rounded px-4 py-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-display tracking-wide"
                                    placeholder="Ex: CIDADE ALTA"
                                />
                                <p className="text-[10px] text-zinc-500 mt-1">Aparece na aba do navegador e no topo do site.</p>
                            </div>


                            <div className="pt-4 border-t border-white/10 flex justify-end">
                                <LoadingButton
                                    type="submit"
                                    loading={isLoading}
                                    loadingText="SALVANDO..."
                                    className="bg-primary hover:bg-primary/90 text-black font-bold uppercase tracking-wider px-6 h-12 w-full sm:w-auto"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Salvar Alterações
                                </LoadingButton>
                            </div>
                        </form>
                    </div>

                    {/* Preview Panel - Simplified */}
                    <div className="space-y-6">
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h3 className="text-xs font-bold text-zinc-400 mb-4 uppercase tracking-wide">Preview: Topo do Site</h3>

                            <div className="bg-black/80 border-b border-white/10 p-4 rounded-lg relative overflow-hidden">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-primary/20 p-2 rounded">
                                            <div className="w-6 h-6 text-primary">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                            </div>
                                        </div>
                                        <span className="text-xl font-display font-bold text-white tracking-wider uppercase">
                                            {formData.server_name || "NOME DO SERVIDOR"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
