"use client";

import { useSession } from "next-auth/react";
import useSWR from "swr";
import AdminSidebar from "@/components/admin/AdminSidebar";
import StatsCard from "@/components/admin/StatsCard";
import EvaluatorsTable from "@/components/admin/EvaluatorsTable";
import { ShieldAlert, Users, Activity, TrendingUp, UserCheck } from "lucide-react";

interface EvaluatorStats {
    totalHandled: number;
    approved: number;
    rejected: number;
    investigating: number;
    lastActivity: string | null;
}

interface Evaluator {
    id: string;
    username: string;
    avatar: string | null;
    joinedAt: string;
    stats: EvaluatorStats;
}

interface EvaluatorsResponse {
    evaluators: Evaluator[];
    summary: {
        totalEvaluators: number;
        activeEvaluators: number;
        totalReportsHandled: number;
        mostActiveEvaluator: {
            username: string;
            totalHandled: number;
        } | null;
    };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function EvaluatorsPage() {
    const { data: session, status } = useSession();

    const isAuthenticated = status === "authenticated";
    const isLoadingAuth = status === "loading";
    const role = session?.user?.role || "PLAYER";
    const isAdmin = role === "ADMIN";

    const { data, isLoading: isLoadingData } = useSWR<EvaluatorsResponse>(
        isAuthenticated && isAdmin ? "/api/admin/evaluators" : null,
        fetcher
    );

    // Show loading state while checking session
    if (isLoadingAuth) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Redirect or show denied if not authorized
    if (!isAuthenticated || !isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-24 h-24 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center justify-center mb-6 animate-pulse">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold mb-2 font-display uppercase tracking-wide text-zinc-900 dark:text-white">
                    Acesso Negado
                </h2>
                <div className="text-zinc-500 max-w-md text-center">
                    <p className="mb-2">Apenas administradores podem acessar esta área.</p>
                    <p className="text-xs font-mono bg-zinc-900 p-2 rounded border border-zinc-800">
                        Status: {status} | Role: {role}
                    </p>
                </div>
            </div>
        );
    }

    const stats = [
        {
            title: "Total de Avaliadores",
            value: data?.summary.totalEvaluators || 0,
            icon: <Users className="w-6 h-6 text-primary" />,
            description: "Registrados no sistema"
        },
        {
            title: "Avaliadores Ativos",
            value: data?.summary.activeEvaluators || 0,
            icon: <Activity className="w-6 h-6 text-emerald-500" />,
            description: "Ativos nos últimos 7 dias"
        },
        {
            title: "Total Processado",
            value: data?.summary.totalReportsHandled || 0,
            icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
            description: "Denúncias avaliadas"
        },
        {
            title: "Mais Ativo",
            value: data?.summary.mostActiveEvaluator?.username || "N/A",
            icon: <UserCheck className="w-6 h-6 text-yellow-500" />,
            description: data?.summary.mostActiveEvaluator
                ? `${data.summary.mostActiveEvaluator.totalHandled} processadas`
                : "Nenhum avaliador ativo",
            isText: true
        },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1800px] mx-auto pb-12">
            <aside className="w-full lg:w-64 flex-shrink-0">
                <AdminSidebar />
            </aside>

            <main className="flex-1 space-y-8 min-w-0">
                <div className="gta-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/50 backdrop-blur-sm">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-widest uppercase font-display">
                            Gerenciamento de <span className="text-primary">Avaliadores</span>
                        </h1>
                        <p className="text-muted-foreground dark:text-zinc-400 mt-1 text-sm font-mono uppercase tracking-wider">
                            Monitore o desempenho e atividade dos avaliadores
                        </p>
                    </div>
                </div>

                {isLoadingData ? (
                    <div className="grid place-items-center h-64 border border-zinc-800 rounded bg-black/20">
                        <div className="animate-spin rounded h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, i) => (
                                <StatsCard key={i} {...stat} />
                            ))}
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <h2 className="text-xl font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                                    <UserCheck className="w-5 h-5 text-primary" />
                                    Lista de Avaliadores
                                </h2>
                            </div>

                            <EvaluatorsTable evaluators={data?.evaluators || []} />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
