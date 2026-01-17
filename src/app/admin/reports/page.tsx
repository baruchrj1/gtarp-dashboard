"use client";

import { useSession } from "next-auth/react";
import useSWR from "swr";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ReportsTable from "@/components/admin/ReportsTable";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { ShieldAlert, Clock } from "lucide-react";



export default function AdminReportsPage() {
    const { data: session, status } = useSession();

    const isAuthenticated = status === "authenticated";
    const isLoadingAuth = status === "loading";
    const role = session?.user?.role || "PLAYER";
    const isAdmin = role === "ADMIN" || session?.user?.isAdmin;
    const isEvaluator = role === "EVALUATOR";
    const hasAccess = isAdmin || isEvaluator;

    // The table handles its own fetching


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
        return <AccessDenied />;
    }

    return (
        <div className="flex flex-col gap-8">
            <main className="flex-1 space-y-8 min-w-0">
                {/* Header - Same as admin dashboard */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 gta-card p-6">
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
                    <ReportsTable />
                </div>
            </main>
        </div>
    );
}
