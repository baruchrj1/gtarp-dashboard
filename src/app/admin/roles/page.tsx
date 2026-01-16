"use client";

import { useState } from "react";
import useSWR from "swr";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Shield, Save, Settings, Users, Search, Crown, CheckCircle, User, Clock } from "lucide-react";

export default function RolesManagement() {
    const { data: session } = useSWR("/api/auth/session");
    const isAdmin = session?.user?.role === "ADMIN" || session?.user?.isAdmin === true;

    const { data: usersData, isLoading, mutate } = useSWR(isAdmin ? "/api/admin/roles/users" : null);
    const { data: reasonsData, mutate: mutateReasons } = useSWR(isAdmin ? "/api/admin/config/reasons" : null);
    const { data: orgsData, mutate: mutateOrgs } = useSWR(isAdmin ? "/api/admin/config/organizations" : null);
    const { data: durationsData, mutate: mutateDurations } = useSWR(isAdmin ? "/api/admin/config/durations" : null);

    const [activeTab, setActiveTab] = useState<"users" | "lists" | "tempos">("users");
    const [searchQuery, setSearchQuery] = useState("");
    const [saving, setSaving] = useState(false);

    // Dynamic Lists State
    const [newItemValue, setNewItemValue] = useState(""); // For Organization Name or Reason Label
    const [newItemSecondValue, setNewItemSecondValue] = useState(""); // For Reason Value (e.g. RDM)
    const [addingParam, setAddingParam] = useState<"org" | "reason" | "duration" | null>(null);

    const users = usersData?.users || [];
    const reasons = reasonsData?.reasons || [];
    const organizations = orgsData?.organizations || [];
    const durations = durationsData?.durations || [];

    const filteredUsers = users.filter((user: { username: string }) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );


    const handleAddItem = async () => {
        if (!newItemValue) return;
        setSaving(true);
        try {
            let endpoint = "";
            let body = {};

            if (addingParam === "org") {
                endpoint = "/api/admin/config/organizations";
                body = { name: newItemValue };
            } else if (addingParam === "reason") {
                endpoint = "/api/admin/config/reasons";
                body = { label: newItemValue, value: newItemSecondValue || newItemValue };
            } else if (addingParam === "duration") {
                endpoint = "/api/admin/config/durations";
                body = { label: newItemValue, value: newItemSecondValue || newItemValue };
            }

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setNewItemValue("");
                setNewItemSecondValue("");
                setAddingParam(null);
                if (addingParam === "org") mutateOrgs();
                else if (addingParam === "reason") mutateReasons();
                else if (addingParam === "duration") mutateDurations();
            } else {
                const data = await res.json();
                alert(data.error || "Erro ao adicionar item");
            }
        } catch (error) {
            alert("Erro ao adicionar item");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteItem = async (type: "org" | "reason" | "duration", id: string) => {
        if (!confirm("Tem certeza que deseja remover este item?")) return;
        try {
            let endpoint = "";
            if (type === "org") endpoint = "/api/admin/config/organizations";
            else if (type === "reason") endpoint = "/api/admin/config/reasons";
            else if (type === "duration") endpoint = "/api/admin/config/durations";

            const res = await fetch(`${endpoint}?id=${id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                if (type === "org") mutateOrgs();
                else if (type === "reason") mutateReasons();
                else if (type === "duration") mutateDurations();
            } else {
                alert("Erro ao remover item");
            }
        } catch (error) {
            alert("Erro ao remover item");
        }
    };

    const getRoleIcon = (role: string, isAdmin: boolean) => {
        if (isAdmin) return <Crown className="w-4 h-4 text-yellow-500" />;
        if (role === "EVALUATOR") return <CheckCircle className="w-4 h-4 text-blue-500" />;
        return <User className="w-4 h-4 text-muted-foreground" />;
    };

    const getRoleColor = (role: string, isAdmin: boolean) => {
        if (isAdmin) return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
        if (role === "EVALUATOR") return "bg-blue-500/20 text-blue-500 border-blue-500/30";
        return "bg-muted text-muted-foreground border-border";
    };

    if (!isAdmin) {
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded border border-border">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-widest uppercase font-display">
                            Gerenciamento de <span className="text-primary">Sistema</span>
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm font-mono uppercase tracking-wider">
                            Controle de Acessos e Configurações
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 border-b border-border overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("users")}
                        className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === "users"
                            ? "text-primary border-b-2 border-primary"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Users className="w-4 h-4 inline mr-2" />
                        Usuários
                    </button>

                    <button
                        onClick={() => setActiveTab("lists")}
                        className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === "lists"
                            ? "text-primary border-b-2 border-primary"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Settings className="w-4 h-4 inline mr-2" />
                        Listas & Opções
                    </button>
                    <button
                        onClick={() => setActiveTab("tempos")}
                        className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === "tempos"
                            ? "text-primary border-b-2 border-primary"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Clock className="w-4 h-4 inline mr-2" />
                        Tempos
                    </button>
                </div>

                {activeTab === "users" ? (
                    <div className="space-y-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar usuário..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50"
                            />
                        </div>

                        <div className="bg-card border border-border rounded overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-4">Usuário</th>
                                        <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-4">Cargo</th>
                                        <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-4">Admin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                                                Carregando...
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                                                Nenhum usuário encontrado
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user: { id: string; username: string; role: string; isAdmin: boolean; avatar?: string }) => (
                                            <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {user.avatar ? (
                                                            <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                                                <User className="w-5 h-5 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="text-foreground font-medium">{user.username}</div>
                                                            <div className="text-muted-foreground text-xs font-mono">{user.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role, user.isAdmin)}`}
                                                    >
                                                        {getRoleIcon(user.role, user.isAdmin)}
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {user.isAdmin ? (
                                                        <Crown className="w-4 h-4 text-yellow-500" />
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </td>

                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                ) : activeTab === "tempos" ? (
                    <div className="space-y-6">
                        <div className="bg-card border border-border rounded p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary" />
                                    Durações de Punição
                                </h2>
                                <button
                                    onClick={() => { setAddingParam("duration"); setNewItemValue(""); setNewItemSecondValue(""); }}
                                    className="px-4 py-2 bg-primary/10 text-primary text-xs font-bold uppercase rounded hover:bg-primary/20 transition-all"
                                >
                                    + Adicionar
                                </button>
                            </div>

                            {addingParam === "duration" && (
                                <div className="mb-6 p-4 bg-muted/30 rounded border border-border space-y-4">
                                    <div>
                                        <label className="block text-xs text-muted-foreground uppercase mb-1">Nome de Exibição (ex: 3 Dias)</label>
                                        <input
                                            type="text"
                                            value={newItemValue}
                                            onChange={(e) => setNewItemValue(e.target.value)}
                                            className="w-full bg-input border border-border rounded px-3 py-2 text-foreground text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-muted-foreground uppercase mb-1">Valor Interno (ex: 3d)</label>
                                        <input
                                            type="text"
                                            value={newItemSecondValue}
                                            onChange={(e) => setNewItemSecondValue(e.target.value)}
                                            className="w-full bg-input border border-border rounded px-3 py-2 text-foreground text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={handleAddItem} disabled={saving} className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded">
                                            {saving ? "Salvando..." : "Salvar"}
                                        </button>
                                        <button onClick={() => setAddingParam(null)} className="px-4 py-2 bg-red-500/10 text-red-500 text-xs font-bold rounded">
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                {durations.map((duration: any) => (
                                    <div key={duration.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded border border-border">
                                        <div>
                                            <p className="font-bold text-foreground text-sm">{duration.label}</p>
                                            <p className="text-xs text-muted-foreground font-mono">{duration.value}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteItem("duration", duration.id)}
                                            className="text-red-500/50 hover:text-red-500 transition-colors"
                                            title="Remover"
                                        >
                                            <Shield className="w-4 h-4 rotate-45" />
                                        </button>
                                    </div>
                                ))}
                                {durations.length === 0 && <p className="text-muted-foreground text-sm italic">Nenhuma duração configurada.</p>}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Report Reasons Management */}
                        <div className="bg-card border border-border rounded p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-primary" />
                                    Motivos de Denúncia
                                </h2>
                                <button
                                    onClick={() => { setAddingParam("reason"); setNewItemValue(""); setNewItemSecondValue(""); }}
                                    className="px-4 py-2 bg-primary/10 text-primary text-xs font-bold uppercase rounded hover:bg-primary/20 transition-all"
                                >
                                    + Adicionar
                                </button>
                            </div>

                            {addingParam === "reason" && (
                                <div className="mb-6 p-4 bg-muted/30 rounded border border-border space-y-4">
                                    <div>
                                        <label className="block text-xs text-muted-foreground uppercase mb-1">Nome de Exibição (ex: RDM (Morte Aleatória))</label>
                                        <input
                                            type="text"
                                            value={newItemValue}
                                            onChange={(e) => setNewItemValue(e.target.value)}
                                            className="w-full bg-input border border-border rounded px-3 py-2 text-foreground text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-muted-foreground uppercase mb-1">Valor Interno (ex: RDM)</label>
                                        <input
                                            type="text"
                                            value={newItemSecondValue}
                                            onChange={(e) => setNewItemSecondValue(e.target.value)}
                                            className="w-full bg-input border border-border rounded px-3 py-2 text-foreground text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={handleAddItem} disabled={saving} className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded">
                                            {saving ? "Salvando..." : "Salvar"}
                                        </button>
                                        <button onClick={() => setAddingParam(null)} className="px-4 py-2 bg-red-500/10 text-red-500 text-xs font-bold rounded">
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                {reasons.map((reason: any) => (
                                    <div key={reason.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded border border-border">
                                        <div>
                                            <p className="font-bold text-foreground text-sm">{reason.label}</p>
                                            <p className="text-xs text-muted-foreground font-mono">{reason.value}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteItem("reason", reason.id)}
                                            className="text-red-500/50 hover:text-red-500 transition-colors"
                                            title="Remover"
                                        >
                                            <Shield className="w-4 h-4 rotate-45" />
                                        </button>
                                    </div>
                                ))}
                                {reasons.length === 0 && <p className="text-muted-foreground text-sm italic">Nenhum motivo configurado.</p>}
                            </div>
                        </div>

                        {/* Organizations Management */}
                        <div className="bg-card border border-border rounded p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Users className="w-5 h-5 text-primary" />
                                    Organizações / Famílias
                                </h2>
                                <button
                                    onClick={() => { setAddingParam("org"); setNewItemValue(""); }}
                                    className="px-4 py-2 bg-primary/10 text-primary text-xs font-bold uppercase rounded hover:bg-primary/20 transition-all"
                                >
                                    + Adicionar
                                </button>
                            </div>

                            {addingParam === "org" && (
                                <div className="mb-6 p-4 bg-muted/30 rounded border border-border space-y-4">
                                    <div>
                                        <label className="block text-xs text-muted-foreground uppercase mb-1">Nome da Organização</label>
                                        <input
                                            type="text"
                                            value={newItemValue}
                                            onChange={(e) => setNewItemValue(e.target.value)}
                                            className="w-full bg-input border border-border rounded px-3 py-2 text-foreground text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={handleAddItem} disabled={saving} className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded">
                                            {saving ? "Salvando..." : "Salvar"}
                                        </button>
                                        <button onClick={() => setAddingParam(null)} className="px-4 py-2 bg-red-500/10 text-red-500 text-xs font-bold rounded">
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {organizations.map((org: any) => (
                                    <div key={org.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded border border-border">
                                        <p className="font-bold text-foreground text-sm">{org.name}</p>
                                        <button
                                            onClick={() => handleDeleteItem("org", org.id)}
                                            className="text-red-500/50 hover:text-red-500 transition-colors"
                                            title="Remover"
                                        >
                                            <Shield className="w-4 h-4 rotate-45" />
                                        </button>
                                    </div>
                                ))}
                                {organizations.length === 0 && <p className="text-muted-foreground text-sm italic col-span-2">Nenhuma organização configurada.</p>}
                            </div>
                        </div>
                    </div>
                )
                }
            </main >
        </div >
    );
}
