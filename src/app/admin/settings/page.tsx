"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { Settings, Save, Layout, MessageSquare } from "lucide-react";
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
        discord_webhook_reports: "",
        discord_webhook_logs: "",
        discord_bot_token: "",
        discord_guild_id: "",
        discord_role_player: "",
        discord_role_admin: "",
        discord_role_evaluator: "",
    });

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
                            discord_webhook_reports: data.settings.discord_webhook_reports || "",
                            discord_webhook_logs: data.settings.discord_webhook_logs || "",
                            discord_bot_token: data.settings.discord_bot_token || "",
                            discord_guild_id: data.settings.discord_guild_id || "",
                            discord_role_player: data.settings.discord_role_player || "",
                            discord_role_admin: data.settings.discord_role_admin || "",
                            discord_role_evaluator: data.settings.discord_role_evaluator || "",
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
        <div className="flex min-h-screen bg-background text-foreground">
            <AdminSidebar />

            <main className="flex-1 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-display uppercase tracking-widest flex items-center gap-3">
                        <Settings className="w-8 h-8 text-primary" />
                        Configurações Gerais
                    </h1>
                    <p className="text-zinc-400 mt-2">Gerencie as informações principais do servidor.</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Form Panel */}
                    <div className="bg-card border border-border rounded-lg p-6">
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
                                    className="w-full bg-black/30 border border-white/10 rounded px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-display tracking-wide"
                                    placeholder="Ex: CIDADE ALTA"
                                />
                                <p className="text-[10px] text-zinc-500 mt-1">Aparece na aba do navegador e no topo do site.</p>
                            </div>

                            <div className="pt-6 border-t border-white/10">
                                <div className="flex items-center gap-2 mb-6 text-zinc-400">
                                    <MessageSquare className="w-5 h-5" />
                                    <h2 className="font-bold uppercase tracking-wider text-sm">Configuração do Bot (Sync)</h2>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">
                                            Discord Bot Token
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.discord_bot_token}
                                            onChange={(e) => setFormData({ ...formData, discord_bot_token: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono text-sm"
                                            placeholder="MTE..."
                                        />
                                        <p className="text-[10px] text-zinc-500 mt-1">Token do bot que fará a sincronização de cargos.</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">
                                            ID do Servidor (Guild ID)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.discord_guild_id}
                                            onChange={(e) => setFormData({ ...formData, discord_guild_id: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono text-sm"
                                            placeholder="123456789..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">
                                                ID Cargo Jogador
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.discord_role_player}
                                                onChange={(e) => setFormData({ ...formData, discord_role_player: e.target.value })}
                                                className="w-full bg-black/30 border border-white/10 rounded px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono text-sm"
                                                placeholder="ID..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">
                                                ID Cargo Admin
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.discord_role_admin}
                                                onChange={(e) => setFormData({ ...formData, discord_role_admin: e.target.value })}
                                                className="w-full bg-black/30 border border-white/10 rounded px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono text-sm"
                                                placeholder="ID..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">
                                                ID Cargo Avaliador
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.discord_role_evaluator}
                                                onChange={(e) => setFormData({ ...formData, discord_role_evaluator: e.target.value })}
                                                className="w-full bg-black/30 border border-white/10 rounded px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono text-sm"
                                                placeholder="ID..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Old Webhooks Section */}
                            <div className="pt-6 border-t border-white/10">
                                <div className="flex items-center gap-2 mb-6 text-zinc-400">
                                    <MessageSquare className="w-5 h-5" />
                                    <h2 className="font-bold uppercase tracking-wider text-sm">Webhooks (Logs)</h2>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">
                                            Webhook para Novas Denúncias
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.discord_webhook_reports}
                                            onChange={(e) => setFormData({ ...formData, discord_webhook_reports: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono text-sm"
                                            placeholder="https://discord.com/api/webhooks/..."
                                        />
                                        <p className="text-[10px] text-zinc-500 mt-1">Sempre que uma denúncia for criada, uma notificação será enviada aqui.</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">
                                            Webhook para Logs (Aprovações/Rejeições)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.discord_webhook_logs}
                                            onChange={(e) => setFormData({ ...formData, discord_webhook_logs: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono text-sm"
                                            placeholder="https://discord.com/api/webhooks/..."
                                        />
                                        <p className="text-[10px] text-zinc-500 mt-1">Logs de ações da staff (aprovar, rejeitar, banir) serão enviados aqui.</p>
                                    </div>
                                </div>
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
