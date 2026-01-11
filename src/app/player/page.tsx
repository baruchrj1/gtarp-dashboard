"use client";

import { useSession } from "next-auth/react";
import { ShieldAlert, FileText, Clock, CheckCircle, TrendingUp } from "lucide-react";
import PlayerSidebar from "@/components/player/PlayerSidebar";
import StatsCard from "@/components/admin/StatsCard";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PlayerDashboard() {
    const { data: session, status } = useSession();

    const isAuthenticated = status === "authenticated";
    const isLoadingAuth = status === "loading";

    // Fetch player's reports
    const { data: reportsData, isLoading: isLoadingReports } = useSWR(
        isAuthenticated ? "/api/reports" : null,
        fetcher
    );

    const allReports = reportsData?.reports || [];
    const myReports = allReports.filter((r: any) => r.reporterId === session?.user?.id);
    const openReports = allReports.filter((r: any) => r.status === "PENDING");
    const resolvedReports = myReports.filter((r: any) => r.status === "APPROVED" || r.status === "REJECTED");

    // Show loading state
    if (isLoadingAuth) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Check authentication
    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-24 h-24 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center justify-center mb-6 animate-pulse">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold mb-2 font-display uppercase tracking-wide text-white">
                    Acesso Negado
                </h2>
                <p className="text-zinc-500">Você precisa estar autenticado para acessar esta área.</p>
            </div>
        );
    }

    const stats = [
        {
            title: "Minhas Denúncias",
            value: myReports.length,
            icon: <FileText className="w-6 h-6 text-primary" />,
            description: "Total de denúncias feitas"
        },
        {
            title: "Denúncias Abertas",
            value: openReports.length,
            icon: <Clock className="w-6 h-6 text-yellow-500" />,
            description: "Aguardando análise"
        },
        {
            title: "Resolvidas",
            value: resolvedReports.length,
            icon: <CheckCircle className="w-6 h-6 text-emerald-500" />,
            description: "Denúncias finalizadas"
        },
        {
            title: "Taxa de Resolução",
            value: myReports.length > 0 ? `${Math.round((resolvedReports.length / myReports.length) * 100)}%` : "0%",
            icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
            description: "Das suas denúncias",
            isText: true
        },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1800px] mx-auto pb-12">
            <aside className="w-full lg:w-64 flex-shrink-0">
                <PlayerSidebar />
            </aside>

            <main className="flex-1 space-y-8 min-w-0">
                <div className="bg-black/40 p-6 rounded border border-white/5">
                    <h1 className="text-3xl font-bold text-white tracking-widest uppercase font-display">
                        Bem-vindo, <span className="text-primary">{session?.user?.name}</span>
                    </h1>
                    <p className="text-zinc-400 mt-1 text-sm font-mono uppercase tracking-wider">
                        Dashboard do Jogador
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <StatsCard key={i} {...stat} />
                    ))}
                </div>

                {/* Recent Reports */}
                <div className="bg-black/40 border border-white/5 rounded p-6">
                    <div className="flex items-center justify-between border-b border-primary/20 pb-4 mb-6">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Minhas Denúncias Recentes
                        </h2>
                    </div>

                    {isLoadingReports ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : myReports.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                            <p className="text-zinc-400">Você ainda não fez nenhuma denúncia.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {myReports.slice(0, 5).map((report: any) => (
                                <div
                                    key={report.id}
                                    className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded p-4 hover:border-primary/20 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-foreground font-bold text-sm mb-1">
                                                {report.accusedName}
                                            </h3>
                                            <p className="text-muted-foreground text-xs line-clamp-2 mb-2">
                                                {report.description}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>ID: #{String(report.id).padStart(4, '0')}</span>
                                                <span>•</span>
                                                <span>{new Date(report.createdAt).toLocaleDateString("pt-BR")}</span>
                                            </div>
                                        </div>
                                        <div>
                                            {report.status === "PENDING" && (
                                                <span className="inline-flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 rounded px-2 py-1 text-xs font-bold text-yellow-400">
                                                    Pendente
                                                </span>
                                            )}
                                            {report.status === "APPROVED" && (
                                                <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-1 text-xs font-bold text-emerald-400">
                                                    Aprovada
                                                </span>
                                            )}
                                            {report.status === "REJECTED" && (
                                                <span className="inline-flex items-center gap-1 bg-red-500/10 border border-red-500/20 rounded px-2 py-1 text-xs font-bold text-red-400">
                                                    Rejeitada
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
