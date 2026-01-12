"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Settings, Save, Layout } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/components/ui/Toast";

export default function SettingsPage() {
    const { data: session } = useSession();
    const { settings, refreshSettings } = useSettings();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Local state for form
    const [formData, setFormData] = useState({
        server_name: "",
        server_logo: "",
        theme_color: "",
    });

    // Load initial data
    useEffect(() => {
        if (settings) {
            setFormData({
                server_name: settings.server_name || "",
                server_logo: settings.server_logo || "",
                theme_color: settings.theme_color || "#8b5cf6",
            });
        }
    }, [settings]);

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
            toast.success("Configurações Salvas", "A aparência do sistema foi atualizada com sucesso.");
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

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <AdminSidebar />

            <main className="flex-1 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-display uppercase tracking-widest flex items-center gap-3">
                        <Settings className="w-8 h-8 text-primary" />
                        Configurações Gerais
                    </h1>
                    <p className="text-zinc-400 mt-2">Personalize a identidade visual e informações do sistema.</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Form Panel */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-6 text-zinc-400">
                            <Layout className="w-5 h-5" />
                            <h2 className="font-bold uppercase tracking-wider text-sm">Personalização</h2>
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

                            {/* Logo URL */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">
                                    URL da Logo (Imagem)
                                </label>
                                <input
                                    type="text"
                                    value={formData.server_logo}
                                    onChange={(e) => setFormData({ ...formData, server_logo: e.target.value })}
                                    className="w-full bg-black/30 border border-white/10 rounded px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono text-sm"
                                    placeholder="https://exemplo.com/logo.png"
                                />
                                <p className="text-[10px] text-zinc-500 mt-1">Recomendado: PNG Transparente. Deixe vazio para usar apenas texto.</p>
                            </div>

                            {/* Theme Color */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">
                                    Cor Principal (Tema)
                                </label>
                                <div className="flex gap-4 items-center">
                                    <div className="relative group">
                                        <input
                                            type="color"
                                            value={formData.theme_color}
                                            onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                                            className="h-12 w-16 p-0 bg-transparent border-0 rounded cursor-pointer opacity-0 absolute inset-0 z-10"
                                        />
                                        <div
                                            className="h-12 w-16 rounded border border-white/20 shadow-lg"
                                            style={{ backgroundColor: formData.theme_color }}
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.theme_color}
                                        onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                                        className="flex-1 bg-black/30 border border-white/10 rounded px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono text-sm uppercase"
                                        placeholder="#8B5CF6"
                                        maxLength={7}
                                    />
                                </div>
                                <p className="text-[10px] text-zinc-500 mt-1">Define a cor de destaque em todo o sistema.</p>
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

                    {/* Preview Panel */}
                    <div className="space-y-6">
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h3 className="text-xs font-bold text-zinc-400 mb-4 uppercase tracking-wide">Preview: Topo do Site</h3>

                            <div className="bg-black/80 border-b border-white/10 p-4 rounded-lg relative overflow-hidden">
                                <div className="flex items-center gap-2">
                                    {formData.server_logo ? (
                                        <img src={formData.server_logo} alt="Logo" className="h-10 w-auto object-contain" />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className="bg-primary/20 p-2 rounded" style={{ backgroundColor: `${formData.theme_color}33` }}>
                                                <div className="w-6 h-6" style={{ color: formData.theme_color }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                                </div>
                                            </div>
                                            <span className="text-xl font-display font-bold text-white tracking-wider uppercase">
                                                {formData.server_name || "NOME DO SERVIDOR"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-6">
                            <h3 className="text-xs font-bold text-zinc-400 mb-4 uppercase tracking-wide">Preview: Cores</h3>
                            <div className="space-y-4">
                                <button className="w-full py-3 rounded font-bold text-black uppercase tracking-wider transition-opacity hover:opacity-90" style={{ backgroundColor: formData.theme_color }}>
                                    Botão Primário
                                </button>
                                <div className="p-4 rounded border border-l-4 bg-zinc-900" style={{ borderLeftColor: formData.theme_color, borderColor: 'rgba(255,255,255,0.1)' }}>
                                    <h4 className="font-bold text-white mb-1">Card de Exemplo</h4>
                                    <p className="text-sm text-zinc-400">Este é um exemplo de como a cor será aplicada em bordas e detalhes.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
