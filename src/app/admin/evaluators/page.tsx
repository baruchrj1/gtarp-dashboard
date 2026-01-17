"use client";

import { useSession } from "next-auth/react";
import useSWR from "swr";

import StatsCard from "@/components/admin/StatsCard";
import EvaluatorsTable from "@/components/admin/EvaluatorsTable";
import { AccessDenied } from "@/components/admin/AccessDenied";
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
    const isAdmin = role === "ADMIN" || session?.user?.isAdmin;

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
            <AccessDenied
                message="Apenas administradores podem acessar esta área."
            />
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
        <div className="flex flex-col gap-8">
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
