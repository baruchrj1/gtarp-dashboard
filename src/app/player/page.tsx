"use client";

import { useSession } from "next-auth/react";
import { ShieldAlert, FileText, Clock, CheckCircle, TrendingUp } from "lucide-react";
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

    // Check authentication (Client side fallback, layout handles server side)
    if (isLoadingAuth) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) return null; // Layout redirects

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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="gta-card p-6 flex items-center justify-between relative overflow-hidden group">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-foreground tracking-widest uppercase font-display">
                        Bem-vindo, <span className="text-primary">{session?.user?.name}</span>
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm font-mono uppercase tracking-wider">
                        Dashboard Pessoal
                    </p>
                </div>
                {/* Decoration */}
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <StatsCard key={i} {...stat} />
                ))}
            </div>

            {/* Recent Reports */}
            <div className="gta-card p-6">
                <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
                    <h2 className="text-xl font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
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
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground font-medium">Você ainda não fez nenhuma denúncia.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {myReports.slice(0, 5).map((report: any) => (
                            <div
                                key={report.id}
                                className="bg-muted/30 dark:bg-white/5 border border-transparent hover:border-primary/20 hover:bg-muted/50 dark:hover:bg-white/10 rounded-xl p-4 transition-all duration-300 group"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-foreground font-bold text-sm group-hover:text-primary transition-colors">
                                                {report.accusedName || "Desconhecido"}
                                            </h3>
                                            <span className="text-[10px] bg-muted dark:bg-zinc-800 px-1.5 py-0.5 rounded text-muted-foreground border border-border">
                                                ID {report.accusedId}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground text-xs line-clamp-1 mb-2">
                                            {report.description || "Sem descrição"}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                                            <span>#{String(report.id).padStart(4, '0')}</span>
                                            <span className="w-1 h-1 rounded-full bg-zinc-500"></span>
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
        </div>
    );
}
