"use client";

import { useSession } from "next-auth/react";
import { Settings, Bell, Shield, Database, Save } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useState } from "react";

export default function SettingsPage() {
    const { data: session, status } = useSession();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const isAuthenticated = status === "authenticated";
    const isLoadingAuth = status === "loading";
    const role = session?.user?.role || "PLAYER";
    const isAdmin = role === "ADMIN" || session?.user?.isAdmin === true;

    if (isLoadingAuth) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated || !isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-24 h-24 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center justify-center mb-6 animate-pulse">
                    <Shield className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold mb-2 font-display uppercase tracking-wide text-white">
                    Acesso Negado
                </h2>
                <p className="text-zinc-500">Apenas administradores podem acessar esta área.</p>
            </div>
        );
    }

    const handleSave = async () => {
        setSaving(true);
        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1800px] mx-auto pb-12">
            <aside className="w-full lg:w-64 flex-shrink-0">
                <AdminSidebar />
            </aside>

            <main className="flex-1 space-y-8 min-w-0">
                {/* Header */}
                <div className="gta-card p-6">
                    <h1 className="text-3xl font-bold text-foreground tracking-widest uppercase font-display flex items-center gap-3">
                        <Settings className="w-8 h-8 text-primary" />
                        <span className="text-primary">Configurações</span>
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm font-mono uppercase tracking-wider">
                        Gerencie as configurações do sistema
                    </p>
                </div>

                {/* Settings Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Notifications */}
                    <div className="gta-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Bell className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-bold text-foreground uppercase tracking-wider">Notificações</h2>
                        </div>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm text-muted-foreground">Notificar novas denúncias via Discord</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm text-muted-foreground">Notificar jogadores sobre status</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm text-muted-foreground">Enviar resumo diário para admins</span>
                                <input type="checkbox" className="w-5 h-5 accent-primary" />
                            </label>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="gta-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-bold text-foreground uppercase tracking-wider">Segurança</h2>
                        </div>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm text-muted-foreground">Exigir verificação de Discord</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm text-muted-foreground">Limitar denúncias por dia (anti-spam)</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm text-muted-foreground">Registrar logs de ações administrativas</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
                            </label>
                        </div>
                    </div>

                    {/* Database */}
                    <div className="gta-card p-6 lg:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-bold text-foreground uppercase tracking-wider">Banco de Dados</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-secondary p-4 rounded border border-border">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total de Usuários</p>
                                <p className="text-2xl font-bold text-foreground">--</p>
                            </div>
                            <div className="bg-secondary p-4 rounded border border-border">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total de Denúncias</p>
                                <p className="text-2xl font-bold text-foreground">--</p>
                            </div>
                            <div className="bg-secondary p-4 rounded border border-border">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status do Banco</p>
                                <p className="text-sm font-bold text-emerald-500">● Conectado</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${saved
                            ? "bg-emerald-500 text-black"
                            : "bg-primary text-black hover:bg-primary/80"
                            } disabled:opacity-50`}
                    >
                        <Save className="w-4 h-4" />
                        {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar Configurações"}
                    </button>
                </div>
            </main>
        </div>
    );
}
