"use client";

import { useSession } from "next-auth/react";
import useSWR from "swr";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ReportsTable from "@/components/admin/ReportsTable";
import { ShieldAlert, Clock } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminReportsPage() {
    const { data: session, status } = useSession();

    const isAuthenticated = status === "authenticated";
    const isLoadingAuth = status === "loading";
    const role = session?.user?.role || "PLAYER";
    const isAdmin = role === "ADMIN";
    const isEvaluator = role === "EVALUATOR";
    const hasAccess = isAdmin || isEvaluator;

    const { data: reportsData, isLoading: isLoadingReports } = useSWR(
        isAuthenticated && hasAccess ? "/api/admin/reports?limit=100" : null,
        fetcher
    );

    // Show loading state
    if (isLoadingAuth) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Check access
    if (!isAuthenticated || !hasAccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-24 h-24 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center justify-center mb-6 animate-pulse">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold mb-2 font-display uppercase tracking-wide text-foreground">
                    Acesso Negado
                </h2>
                <p className="text-muted-foreground">Apenas administradores e avaliadores podem acessar esta área.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1800px] mx-auto pb-12">
            <aside className="w-full lg:w-64 flex-shrink-0">
                <AdminSidebar />
            </aside>

            <main className="flex-1 space-y-8 min-w-0">
                {/* Header - Same as admin dashboard */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded border border-border">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-widest uppercase font-display">
                            Painel <span className="text-primary">{isAdmin ? "Administrativo" : "de Avaliação"}</span>
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm font-mono uppercase tracking-wider">
                            Operador: <span className="text-foreground">{session?.user?.name}</span> | ID: 329-Alpha
                        </p>
                    </div>
                </div>

                {/* Section Header */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-primary/20 pb-4">
                        <h2 className="text-xl font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            {isAdmin ? "Todas as Denúncias" : "Minhas Avaliações Pendentes"}
                        </h2>
                    </div>

                    {/* Reports Table */}
                    {isLoadingReports ? (
                        <div className="grid place-items-center h-64 border border-border rounded bg-muted/20">
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
