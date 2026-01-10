"use client";

import useSWR from "swr";
import AdminSidebar from "@/components/admin/AdminSidebar";
import StatsCard from "@/components/admin/StatsCard";
import ReportsTable from "@/components/admin/ReportsTable";
import { ShieldAlert, CheckCircle, Clock } from "lucide-react";

interface Report {
    id: number;
    accusedId: string;
    reason: string;
    status: string;
    createdAt: string;
    reporter: {
        username: string;
        avatar: string | null;
    };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminDashboard() {
    const { data: session } = useSWR("/api/auth/session");
    const { data: reportsData, isLoading } = useSWR(
        session?.user?.isAdmin ? "/api/admin/reports?limit=100" : null,
        fetcher
    );

    const reports = reportsData?.reports || [];

    const stats = [
        {
            title: "Total de Ocorrências",
            value: reports.length,
            icon: <ShieldAlert className="w-6 h-6 text-primary" />,
            trend: "+12% esta semana",
            description: "Total acumulado"
        },
        {
            title: "Em Análise",
            value: reports.filter((r: Report) => r.status === 'PENDING').length,
            icon: <Clock className="w-6 h-6 text-yellow-500" />,
            description: "Aguardando veredito"
        },
        {
            title: "Casos Encerrados",
            value: reports.filter((r: Report) => r.status !== 'PENDING').length,
            icon: <CheckCircle className="w-6 h-6 text-emerald-500" />,
            trend: "+5 hoje",
            description: "Aprovadas ou Arquivadas"
        },
    ];

    const role = session?.user?.role || "PLAYER";
    const isEvaluator = role === "EVALUATOR";
    const isAdmin = role === "ADMIN";

    if (!session || (!isAdmin && !isEvaluator)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-24 h-24 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center justify-center mb-6 animate-pulse">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold mb-2 font-display uppercase tracking-wide text-white">Acesso Negado</h2>
                <p className="text-zinc-500 max-w-md text-center">Protocolo de segurança: Nível 4 exigido. <br /> Contate a administração superior.</p>
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
                            Painel <span className="text-primary">{isAdmin ? "Administrativo" : "de Avaliação"}</span>
                        </h1>
                        <p className="text-zinc-400 mt-1 text-sm font-mono uppercase tracking-wider">
                            Operador: <span className="text-white">{session.user.name}</span> | ID: 329-Alpha
                        </p>
                    </div>
                </div>

                {isAdmin && (
                    <div className="grid grid-cols-1 md:cols-3 gap-6">
                        {stats.map((stat, i) => (
                            <StatsCard key={i} {...stat} />
                        ))}
                    </div>
                )}

                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-primary/20 pb-4">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            {isAdmin ? "Todas as Denúncias" : "Minhas Avaliações Pendentes"}
                        </h2>
                    </div>

                    {isLoading ? (
                        <div className="grid place-items-center h-64 border border-zinc-800 rounded bg-black/20">
                            <div className="animate-spin rounded h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <ReportsTable />
                    )}
                </div>
            </main>
        </div>
    );
}
