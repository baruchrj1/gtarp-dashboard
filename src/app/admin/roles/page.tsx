"use client";

import { useState } from "react";
import useSWR from "swr";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Shield, RefreshCw, Save, Settings, Users, Search, Crown, CheckCircle, User } from "lucide-react";

export default function RolesManagement() {
    const { data: session } = useSWR("/api/auth/session");
    const { data: usersData, isLoading, mutate } = useSWR(session?.user?.isAdmin ? "/api/admin/roles/users" : null);
    const { data: configData, mutate: mutateConfig } = useSWR(session?.user?.isAdmin ? "/api/admin/roles/config" : null);

    const [activeTab, setActiveTab] = useState<"users" | "config">("users");
    const [searchQuery, setSearchQuery] = useState("");
    const [syncing, setSyncing] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [editingUser, setEditingUser] = useState<string | null>(null);

    const [config, setConfig] = useState({
        guildId: configData?.config?.guildId || "",
        adminRoleId: configData?.config?.adminRoleId || "",
        evaluatorRoleId: configData?.config?.evaluatorRoleId || ""
    });

    const users = usersData?.users || [];

    const filteredUsers = users.filter((user: { username: string }) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSyncRoles = async (userId: string) => {
        setSyncing(userId);
        try {
            const res = await fetch("/api/admin/roles/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });
            const data = await res.json();
            if (res.ok) {
                mutate();
            } else {
                alert(data.error || "Erro ao sincronizar cargos");
            }
        } catch (error) {
            alert("Erro ao sincronizar cargos");
        } finally {
            setSyncing(null);
        }
    };

    const handleRoleChange = async (userId: string, role: string, isAdmin: boolean) => {
        try {
            const res = await fetch("/api/admin/roles/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, role, isAdmin })
            });
            if (res.ok) {
                mutate();
            }
        } catch (error) {
            alert("Erro ao atualizar cargo");
        }
    };

    const handleSaveConfig = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/roles/config", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config)
            });
            const data = await res.json();
            if (res.ok) {
                mutateConfig();
                alert("Configuração salva!");
            } else {
                alert(data.error || "Erro ao salvar configuração");
            }
        } catch (error) {
            alert("Erro ao salvar configuração");
        } finally {
            setSaving(false);
        }
    };

    const getRoleIcon = (role: string, isAdmin: boolean) => {
        if (isAdmin) return <Crown className="w-4 h-4 text-yellow-500" />;
        if (role === "EVALUATOR") return <CheckCircle className="w-4 h-4 text-blue-500" />;
        return <User className="w-4 h-4 text-zinc-500" />;
    };

    const getRoleColor = (role: string, isAdmin: boolean) => {
        if (isAdmin) return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
        if (role === "EVALUATOR") return "bg-blue-500/20 text-blue-500 border-blue-500/30";
        return "bg-zinc-500/20 text-zinc-500 border-zinc-500/30";
    };

    if (!session?.user?.isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Shield className="w-16 h-16 text-red-500" />
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1800px] mx-auto pb-12">
            <aside className="w-full lg:w-64 flex-shrink-0">
                <AdminSidebar />
            </aside>

            <main className="flex-1 space-y-8 min-w-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/40 p-6 rounded border border-white/5">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-widest uppercase font-display">
                            Gerenciamento de <span className="text-primary">Cargos</span>
                        </h1>
                        <p className="text-zinc-400 mt-1 text-sm font-mono uppercase tracking-wider">
                            Sincronização e Controle de Acessos
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab("users")}
                        className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                            activeTab === "users"
                                ? "text-primary border-b-2 border-primary"
                                : "text-zinc-500 hover:text-white"
                        }`}
                    >
                        <Users className="w-4 h-4 inline mr-2" />
                        Usuários
                    </button>
                    <button
                        onClick={() => setActiveTab("config")}
                        className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                            activeTab === "config"
                                ? "text-primary border-b-2 border-primary"
                                : "text-zinc-500 hover:text-white"
                        }`}
                    >
                        <Settings className="w-4 h-4 inline mr-2" />
                        Configuração
                    </button>
                </div>

                {activeTab === "users" ? (
                    <div className="space-y-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Buscar usuário..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-primary/50"
                            />
                        </div>

                        <div className="bg-black/40 border border-white/5 rounded overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left text-xs font-bold text-zinc-500 uppercase tracking-wider px-6 py-4">Usuário</th>
                                        <th className="text-left text-xs font-bold text-zinc-500 uppercase tracking-wider px-6 py-4">Cargo</th>
                                        <th className="text-left text-xs font-bold text-zinc-500 uppercase tracking-wider px-6 py-4">Admin</th>
                                        <th className="text-right text-xs font-bold text-zinc-500 uppercase tracking-wider px-6 py-4">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                                                Carregando...
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                                                Nenhum usuário encontrado
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user: { id: string; username: string; role: string; isAdmin: boolean; avatar?: string }) => (
                                            <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {user.avatar ? (
                                                            <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                                                <User className="w-5 h-5 text-zinc-500" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="text-white font-medium">{user.username}</div>
                                                            <div className="text-zinc-500 text-xs font-mono">{user.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {editingUser === user.id ? (
                                                        <select
                                                            value={user.role}
                                                            onChange={(e) => handleRoleChange(user.id, e.target.value, user.isAdmin)}
                                                            onBlur={() => setEditingUser(null)}
                                                            className="bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50"
                                                        >
                                                            <option value="PLAYER">PLAYER</option>
                                                            <option value="EVALUATOR">EVALUATOR</option>
                                                            <option value="ADMIN">ADMIN</option>
                                                        </select>
                                                    ) : (
                                                        <span
                                                            onClick={() => setEditingUser(user.id)}
                                                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border cursor-pointer hover:opacity-80 ${getRoleColor(user.role, user.isAdmin)}`}
                                                        >
                                                            {getRoleIcon(user.role, user.isAdmin)}
                                                            {user.role}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={user.isAdmin}
                                                        onChange={(e) => handleRoleChange(user.id, user.role, e.target.checked)}
                                                        className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-primary focus:ring-primary"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleSyncRoles(user.id)}
                                                        disabled={syncing === user.id}
                                                        className="p-2 text-zinc-500 hover:text-primary hover:bg-primary/10 rounded transition-all disabled:opacity-50"
                                                        title="Sincronizar com Discord"
                                                    >
                                                        <RefreshCw className={`w-4 h-4 ${syncing === user.id ? "animate-spin" : ""}`} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 bg-black/40 border border-white/5 rounded p-6">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary" />
                            Configuração de Cargos Discord
                        </h2>

                        <div className="grid gap-6">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                    Discord Guild ID
                                </label>
                                <input
                                    type="text"
                                    value={config.guildId}
                                    onChange={(e) => setConfig({ ...config, guildId: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-primary/50"
                                    placeholder="123456789012345678"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                    Admin Role ID
                                </label>
                                <input
                                    type="text"
                                    value={config.adminRoleId}
                                    onChange={(e) => setConfig({ ...config, adminRoleId: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-primary/50"
                                    placeholder="123456789012345678"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                    Evaluator Role ID
                                </label>
                                <input
                                    type="text"
                                    value={config.evaluatorRoleId}
                                    onChange={(e) => setConfig({ ...config, evaluatorRoleId: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-primary/50"
                                    placeholder="123456789012345678"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                            <button
                                onClick={handleSaveConfig}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-primary text-black font-bold text-sm uppercase tracking-wider rounded hover:bg-primary/90 transition-all disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? "Salvando..." : "Salvar Configuração"}
                            </button>
                            <p className="text-xs text-zinc-500">
                                Nota: Atualize também suas variáveis de ambiente (.env)
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
