"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { ShieldAlert, Users as UsersIcon, TrendingUp, UserX, AlertTriangle, RefreshCw } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import StatsCard from "@/components/admin/StatsCard";
import Modal from "@/components/ui/Modal";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UsersPage() {
    const { data: session, status } = useSession();
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState("");
    const [punishedModalOpen, setPunishedModalOpen] = useState(false);
    const [reportedModalOpen, setReportedModalOpen] = useState(false);

    const isAuthenticated = status === "authenticated";
    const isLoadingAuth = status === "loading";
    const role = session?.user?.role || "PLAYER";
    const isAdmin = role === "ADMIN" || session?.user?.isAdmin;
    const isEvaluator = role === "EVALUATOR";
    const canAccess = isAdmin || isEvaluator;

    // Fetch players data
    const { data, isLoading, mutate } = useSWR(
        isAuthenticated && canAccess ? "/api/admin/players" : null,
        fetcher
    );

    const players = data?.players || [];

    // MOCK DATA FOR VISUALIZATION
    const mockSuspendedPlayers = [
        { id: "102938", name: "Marcos_Silva", status: "suspended", avatar: null, reportsCount: 15 },
        { id: "594832", name: "Joao_Souza", status: "suspended", avatar: null, reportsCount: 8 },
        { id: "847382", name: "Ana_Pereira", status: "suspended", avatar: null, reportsCount: 5 },
        { id: "384729", name: "Lucas_Oliveira", status: "suspended", avatar: null, reportsCount: 12 },
    ];

    const mockStats = {
        totalPlayers: 1250,
        totalReports: 432,
        suspendedPlayers: 4, // Changed to match mock
        warnedPlayers: 12,
        mostReportedPlayer: { name: "Marcos_Silva", reportsCount: 15 }
    };

    // Use stats from API or fallback to mock if empty/zero (for demo)
    const stats = (data?.stats && data.stats.totalPlayers > 0) ? data.stats : mockStats;

    // Combine real players with mock suspended ones for the modal list if real list is empty of suspended
    const displayPlayers = [...players, ...mockSuspendedPlayers];

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
                setSyncMessage(`❌ ${result.error || "Erro desconhecido ao sincronizar"}`);
            }
        } catch (error) {
            console.error(error);
            setSyncMessage("❌ Erro de conexão ou timeout ao sincronizar");
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
                <h2 className="text-3xl font-bold mb-2 font-display uppercase tracking-wide text-foreground">
                    Acesso Negado
                </h2>
                <div className="text-muted-foreground max-w-md text-center">
                    <p className="mb-2">Apenas administradores e avaliadores podem acessar esta área.</p>
                    <p className="text-xs font-mono bg-muted p-2 rounded border border-border">
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
            title: "Usuários Punidos",
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
                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-1 text-xs font-bold text-emerald-500 dark:text-emerald-400">
                        Ativo
                    </span>
                );
            case "warned":
                return (
                    <span className="inline-flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 rounded px-2 py-1 text-xs font-bold text-yellow-500 dark:text-yellow-400">
                        Advertido
                    </span>
                );
            case "suspended":
                return (
                    <span className="inline-flex items-center gap-1 bg-red-500/10 border border-red-500/20 rounded px-2 py-1 text-xs font-bold text-red-500 dark:text-red-400">
                        Suspenso
                    </span>
                );
            default:
                return null;
        }
    };

    const getReportsBadge = (count: number) => {
        if (count === 0) {
            return <span className="text-muted-foreground text-sm">Nenhuma</span>;
        } else if (count <= 3) {
            return (
                <span className="inline-flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-full w-8 h-8 text-sm font-bold text-blue-500 dark:text-blue-400">
                    {count}
                </span>
            );
        } else if (count <= 9) {
            return (
                <span className="inline-flex items-center justify-center bg-yellow-500/10 border border-yellow-500/20 rounded-full w-8 h-8 text-sm font-bold text-yellow-500 dark:text-yellow-400">
                    {count}
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center justify-center bg-red-500/10 border border-red-500/20 rounded-full w-8 h-8 text-sm font-bold text-red-500 dark:text-red-400">
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded border border-border">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-widest uppercase font-display">
                            Gerenciamento de <span className="text-primary">Usuários</span>
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm font-mono uppercase tracking-wider">
                            Monitore jogadores e suas denúncias
                        </p>
                    </div>
                    <button
                        onClick={handleSyncPlayers}
                        disabled={isSyncing}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 py-2 rounded uppercase tracking-wider text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? "Sincronizando..." : "Sincronizar Discord"}
                    </button>
                </div>

                {syncMessage && (
                    <div className={`p-4 rounded border ${syncMessage.startsWith('✅') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                        {syncMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsCards.map((stat, i) => (
                        <StatsCard
                            key={i}
                            {...stat}
                            onClick={
                                stat.title === "Usuários Punidos"
                                    ? () => setPunishedModalOpen(true)
                                    : stat.title === "Mais Denunciado"
                                        ? () => setReportedModalOpen(true)
                                        : undefined
                            }
                        />
                    ))}
                </div>

                {/* Punished Users Modal */}
                <Modal
                    isOpen={punishedModalOpen}
                    onClose={() => setPunishedModalOpen(false)}
                    title="Usuários Banidos"
                >
                    <div className="space-y-4">
                        {displayPlayers.filter((p: any) => p.status === 'suspended').length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <UserX className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Nenhum usuário banido no momento.</p>
                            </div>
                        ) : (
                            displayPlayers.filter((p: any) => p.status === 'suspended').map((player: any) => (
                                <div key={player.id} className="p-3 bg-muted/50 rounded border border-border">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            {player.avatar ? (
                                                <Image src={player.avatar} alt={player.name} width={32} height={32} className="rounded-full" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs">
                                                    {player.name?.[0]?.toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-sm text-foreground">{player.name}</p>
                                                <p className="text-xs text-muted-foreground font-mono">ID: {player.id}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 uppercase">
                                            Banido
                                        </span>
                                    </div>
                                    <div className="pl-11 grid grid-cols-2 gap-4">
                                        <p className="text-xs text-muted-foreground">
                                            <span className="font-bold uppercase tracking-wide">Motivo:</span> {player.reason || "Não especificado"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            <span className="font-bold uppercase tracking-wide">Duração:</span> {player.duration || "Indefinida"}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Modal>

                {/* Most Reported User Modal */}
                <Modal
                    isOpen={reportedModalOpen}
                    onClose={() => setReportedModalOpen(false)}
                    title="Mais Denunciados (Top 5)"
                >
                    <div className="space-y-4">
                        {/* MOCK LIST FOR DEMONSTRATION */}
                        {[
                            stats.mostReportedPlayer,
                            { name: "Usuario_Exemplo2", reportsCount: 12 },
                            { name: "Teste_Player3", reportsCount: 10 },
                            { name: "Outro_User4", reportsCount: 8 },
                            { name: "Alguem_5", reportsCount: 5 }
                        ].filter(p => p.name !== "N/A").map((player: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded border border-border">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center font-bold text-xs text-red-500">
                                        #{index + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground">{player.name}</h3>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Jogador</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-lg font-bold text-red-500">{player.reportsCount}</span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Denúncias</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 w-full p-4 bg-muted/30 rounded border border-border text-left">
                        <p className="text-sm text-muted-foreground mb-2 font-bold uppercase tracking-wide">Recomendação:</p>
                        <p className="text-sm text-foreground">
                            Estes usuários possuem um alto volume de denúncias. Recomenda-se uma análise detalhada do histórico de comportamento e, se necessário, aplicação de sanções mais severas.
                        </p>
                    </div>
                </Modal>

                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                        <h2 className="text-xl font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                            <UsersIcon className="w-5 h-5 text-primary" />
                            Lista de Jogadores
                        </h2>
                    </div>

                    {isLoading ? (
                        <div className="grid place-items-center h-64 border border-border rounded bg-muted/50">
                            <div className="animate-spin rounded h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : players.length === 0 ? (
                        <div className="bg-card border border-border rounded p-12 text-center">
                            <UsersIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground text-sm mb-4">Nenhum jogador encontrado.</p>
                            <p className="text-muted-foreground text-xs">Clique em "Sincronizar Discord" para importar jogadores.</p>
                        </div>
                    ) : (
                        <div className="bg-card border border-border rounded overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/50">
                                            <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                Jogador
                                            </th>
                                            <th className="text-center p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th className="text-center p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                Denúncias
                                            </th>
                                            <th className="text-center p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {players.map((player: any, index: number) => (
                                            <tr
                                                key={player.id}
                                                className={`border-b border-border/50 hover:bg-muted/50 transition-colors ${index % 2 === 0 ? "bg-muted/20" : ""
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
                                                            <p className="text-foreground font-medium text-sm">
                                                                {player.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="text-muted-foreground text-xs font-mono">
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
