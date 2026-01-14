"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";

interface Tenant {
    id: string;
    name: string;
    slug: string;
    subdomain: string;
    isActive: boolean;
    discordGuildId: string;
    discordClientId: string;
    discordClientSecret: string;
    discordBotToken: string | null;
    discordRoleAdmin: string;
    discordRoleEvaluator: string | null;
    discordRolePlayer: string | null;
}

export function TenantSettingsForm({ tenant }: { tenant: Tenant }) {
    const [isLoading, setIsLoading] = useState(false);

    // Just handling name/slug update for now as a PoC
    const [formData, setFormData] = useState({
        name: tenant.name,
        slug: tenant.slug,
        subdomain: tenant.subdomain,
        isActive: tenant.isActive,
        discordGuildId: tenant.discordGuildId || "",
        discordClientId: tenant.discordClientId || "",
        discordClientSecret: tenant.discordClientSecret || "",
        discordBotToken: tenant.discordBotToken || "",
        discordRoleAdmin: tenant.discordRoleAdmin || "",
        discordRoleEvaluator: tenant.discordRoleEvaluator || "",
        discordRolePlayer: tenant.discordRolePlayer || ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch(`/api/admin/tenants/${tenant.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error("Falha ao atualizar");

            alert("Cliente atualizado com sucesso!");
        } catch (error) {
            alert("Erro ao salvar alterações.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Nome da Organização</label>
                    <input
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded h-10 px-3 text-sm text-white focus:border-violet-500 focus:outline-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Slug (URL Interna)</label>
                    <input
                        value={formData.slug}
                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded h-10 px-3 text-sm text-white focus:border-violet-500 focus:outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Subdomínio</label>
                    <div className="flex">
                        <input
                            value={formData.subdomain}
                            onChange={e => setFormData({ ...formData, subdomain: e.target.value })}
                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-l h-10 px-3 text-sm text-white focus:border-violet-500 focus:outline-none"
                        />
                        <div className="h-10 px-3 flex items-center bg-zinc-800 border-y border-r border-zinc-800 rounded-r text-zinc-400 text-xs">
                            .vercel.app
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</label>
                    <select
                        value={formData.isActive ? "true" : "false"}
                        onChange={e => setFormData({ ...formData, isActive: e.target.value === "true" })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded h-10 px-3 text-sm text-white focus:border-violet-500 focus:outline-none"
                    >
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                    </select>
                </div>
            </div>

            {/* Discord Configuration */}
            <div className="pt-6 border-t border-zinc-800 space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Credenciais Discord</h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Guild ID</label>
                        <input
                            value={formData.discordGuildId}
                            onChange={e => setFormData({ ...formData, discordGuildId: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded h-10 px-3 text-sm text-white focus:border-violet-500 focus:outline-none font-mono"
                            placeholder="Ex: 123456789012345678"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Bot Token</label>
                        <input
                            value={formData.discordBotToken || ""}
                            onChange={e => setFormData({ ...formData, discordBotToken: e.target.value })}
                            type="password"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded h-10 px-3 text-sm text-white focus:border-violet-500 focus:outline-none font-mono"
                            placeholder="MTA..."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Client ID</label>
                        <input
                            value={formData.discordClientId}
                            onChange={e => setFormData({ ...formData, discordClientId: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded h-10 px-3 text-sm text-white focus:border-violet-500 focus:outline-none font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Client Secret</label>
                        <input
                            value={formData.discordClientSecret}
                            onChange={e => setFormData({ ...formData, discordClientSecret: e.target.value })}
                            type="password"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded h-10 px-3 text-sm text-white focus:border-violet-500 focus:outline-none font-mono"
                        />
                    </div>
                </div>
            </div>

            {/* Role Configuration */}
            <div className="pt-6 border-t border-zinc-800 space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Configuração de Cargos (IDs)</h3>
                <p className="text-[10px] text-zinc-500">
                    Defina os IDs dos cargos no Discord que terão acesso a cada nível.
                    <span className="text-zinc-400 font-bold ml-1">Atualização Manual Obrigatória.</span>
                </p>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                            Cargo Admin
                        </label>
                        <input
                            value={formData.discordRoleAdmin}
                            onChange={e => setFormData({ ...formData, discordRoleAdmin: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded h-10 px-3 text-sm text-white focus:border-violet-500 focus:outline-none font-mono"
                            placeholder="Ex: 987654321098765432"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Cargo Avaliador
                        </label>
                        <input
                            value={formData.discordRoleEvaluator || ""}
                            onChange={e => setFormData({ ...formData, discordRoleEvaluator: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded h-10 px-3 text-sm text-white focus:border-violet-500 focus:outline-none font-mono"
                            placeholder="Opcional"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
                            Cargo Player (Whitelist)
                        </label>
                        <input
                            value={formData.discordRolePlayer || ""}
                            onChange={e => setFormData({ ...formData, discordRolePlayer: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded h-10 px-3 text-sm text-white focus:border-violet-500 focus:outline-none font-mono"
                            placeholder="Opcional"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="h-10 px-6 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm tracking-wide uppercase rounded transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar Alterações
                </button>
            </div>
        </form>
    );
}
