"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { ShieldAlert, Users as UsersIcon, TrendingUp, UserX, AlertTriangle, RefreshCw } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import StatsCard from "@/components/admin/StatsCard";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UsersPage() {
    const { data: session, status } = useSession();
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState("");

    const isAuthenticated = status === "authenticated";
    const isLoadingAuth = status === "loading";
    const role = session?.user?.role || "PLAYER";
    const isAdmin = role === "ADMIN";
    const isEvaluator = role === "EVALUATOR";
    const canAccess = isAdmin || isEvaluator;

    // Fetch players data
    const { data, isLoading, mutate } = useSWR(
        isAuthenticated && canAccess ? "/api/admin/players" : null,
        fetcher
    );

    const players = data?.players || [];
    const stats = data?.stats || {
        totalPlayers: 0,
        totalReports: 0,
        suspendedPlayers: 0,
        warnedPlayers: 0,
        mostReportedPlayer: { name: "N/A", reportsCount: 0 }
    };

    const handleSyncPlayers = async () => {
        setIsSyncing(true);
        setSyncMessage("");

        try {
            const response = await fetch("/api/admin/sync-players");
            const result = await response.json();

            if (result.success) {
                setSyncMessage(`✅ ${result.message}`);
                // Refresh the players list
                mutate();
            } else {
                setSyncMessage(`❌ ${result.error}`);
            }
        } catch (error) {
            setSyncMessage("❌ Erro ao sincronizar jogadores");
        } finally {
            setIsSyncing(false);
            setTimeout(() => setSyncMessage(""), 5000);
        }
    };

    // Show loading state while checking session
    if (isLoadingAuth) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Redirect or show denied if not authorized
    if (!isAuthenticated || !canAccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-24 h-24 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center justify-center mb-6 animate-pulse">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold mb-2 font-display uppercase tracking-wide text-white">
                    Acesso Negado
                </h2>
                <div className="text-zinc-500 max-w-md text-center">
                    <p className="mb-2">Apenas administradores e avaliadores podem acessar esta área.</p>
                    <p className="text-xs font-mono bg-zinc-900 p-2 rounded border border-zinc-800">
                        Status: {status} | Role: {role}
                    </p>
                </div>
            </div>
        );
    }

    const statsCards = [
        {
            title: "Total de Jogadores",
            value: stats.totalPlayers,
            icon: <UsersIcon className="w-6 h-6 text-primary" />,
            description: "Cadastrados no servidor"
        },
        {
            title: "Total de Denúncias",
            value: stats.totalReports,
            icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
            description: "Acumuladas no sistema"
        },
        {
            title: "Usuários Suspensos",
            value: stats.suspendedPlayers,
            icon: <UserX className="w-6 h-6 text-red-500" />,
            description: "Temporariamente banidos"
        },
        {
            title: "Mais Denunciado",
            value: stats.mostReportedPlayer.name,
            icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
            description: `${stats.mostReportedPlayer.reportsCount} denúncias`,
            isText: true
        },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return (
                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-1 text-xs font-bold text-emerald-400">
                        Ativo
                    </span>
                );
            case "warned":
                return (
                    <span className="inline-flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 rounded px-2 py-1 text-xs font-bold text-yellow-400">
                        Advertido
                    </span>
                );
            case "suspended":
                return (
                    <span className="inline-flex items-center gap-1 bg-red-500/10 border border-red-500/20 rounded px-2 py-1 text-xs font-bold text-red-400">
                        Suspenso
                    </span>
                );
            default:
                return null;
        }
    };

    const getReportsBadge = (count: number) => {
        if (count === 0) {
            return <span className="text-zinc-500 text-sm">Nenhuma</span>;
        } else if (count <= 3) {
            return (
                <span className="inline-flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-full w-8 h-8 text-sm font-bold text-blue-400">
                    {count}
                </span>
            );
        } else if (count <= 9) {
            return (
                <span className="inline-flex items-center justify-center bg-yellow-500/10 border border-yellow-500/20 rounded-full w-8 h-8 text-sm font-bold text-yellow-400">
                    {count}
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center justify-center bg-red-500/10 border border-red-500/20 rounded-full w-8 h-8 text-sm font-bold text-red-400">
                    {count}
                </span>
            );
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1800px] mx-auto pb-12">
            <aside className="w-full lg:w-64 flex-shrink-0">
                <AdminSidebar />
            </aside>

            <main className="flex-1 space-y-8 min-w-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/40 p-6 rounded border border-white/5">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-widest uppercase font-display">
                            Gerenciamento de <span className="text-primary">Usuários</span>
                        </h1>
                        <p className="text-zinc-400 mt-1 text-sm font-mono uppercase tracking-wider">
                            Monitore jogadores e suas denúncias
                        </p>
                    </div>
                    <button
                        onClick={handleSyncPlayers}
                        disabled={isSyncing}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black font-bold px-4 py-2 rounded uppercase tracking-wider text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? "Sincronizando..." : "Sincronizar Discord"}
                    </button>
                </div>

                {syncMessage && (
                    <div className={`p-4 rounded border ${syncMessage.startsWith('✅') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        {syncMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsCards.map((stat, i) => (
                        <StatsCard key={i} {...stat} />
                    ))}
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-primary/20 pb-4">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <UsersIcon className="w-5 h-5 text-primary" />
                            Lista de Jogadores
                        </h2>
                    </div>

                    {isLoading ? (
                        <div className="grid place-items-center h-64 border border-zinc-800 rounded bg-black/20">
                            <div className="animate-spin rounded h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : players.length === 0 ? (
                        <div className="bg-black/40 border border-white/5 rounded p-12 text-center">
                            <UsersIcon className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                            <p className="text-zinc-400 text-sm mb-4">Nenhum jogador encontrado.</p>
                            <p className="text-zinc-500 text-xs">Clique em "Sincronizar Discord" para importar jogadores.</p>
                        </div>
                    ) : (
                        <div className="bg-black/40 border border-white/5 rounded overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-black/20">
                                            <th className="text-left p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                                Jogador
                                            </th>
                                            <th className="text-center p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th className="text-center p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                                Denúncias
                                            </th>
                                            <th className="text-center p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {players.map((player: any, index: number) => (
                                            <tr
                                                key={player.id}
                                                className={`border-b border-white/5 hover:bg-white/5 transition-colors ${index % 2 === 0 ? "bg-black/10" : ""
                                                    }`}
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        {player.avatar ? (
                                                            <Image
                                                                src={player.avatar}
                                                                alt={player.name}
                                                                width={40}
                                                                height={40}
                                                                className="rounded-full border-2 border-primary/20"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary/20 flex items-center justify-center">
                                                                <span className="text-primary font-bold text-sm">
                                                                    {player.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-white font-medium text-sm">
                                                                {player.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="text-zinc-500 text-xs font-mono">
                                                        {player.id.slice(0, 8)}...
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    {getReportsBadge(player.reportsCount)}
                                                </td>
                                                <td className="p-4 text-center">
                                                    {getStatusBadge(player.status)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
