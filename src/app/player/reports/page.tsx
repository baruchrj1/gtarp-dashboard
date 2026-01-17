"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ShieldAlert, FileText, Filter } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PlayerReportsPage() {
    const { data: session, status } = useSession();
    const [filter, setFilter] = useState<"all" | "mine" | "open">("all");

    const isAuthenticated = status === "authenticated";
    const isLoadingAuth = status === "loading";

    // Fetch all reports
    const { data: reportsData, isLoading: isLoadingReports } = useSWR(
        isAuthenticated ? "/api/reports" : null,
        fetcher
    );

    const allReports = reportsData?.reports || [];

    // Filter reports based on selection
    const filteredReports = allReports.filter((report: any) => {
        if (filter === "open") {
            return report.status === "PENDING";
        }
        return true; // "all"
    });

    // Show loading state (Client side fallback)
    if (isLoadingAuth) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) return null; // Layout handles redirect

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return (
                    <span className="inline-flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 rounded px-3 py-1 text-xs font-bold text-yellow-400 uppercase tracking-wider">
                        Pendente
                    </span>
                );
            case "INVESTIGATING":
                return (
                    <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 rounded px-3 py-1 text-xs font-bold text-blue-400 uppercase tracking-wider">
                        Em Análise
                    </span>
                );
            case "APPROVED":
                return (
                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded px-3 py-1 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        Aprovada
                    </span>
                );
            case "REJECTED":
                return (
                    <span className="inline-flex items-center gap-1 bg-red-500/10 border border-red-500/20 rounded px-3 py-1 text-xs font-bold text-red-400 uppercase tracking-wider">
                        Rejeitada
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="gta-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-widest uppercase font-display">
                        <span className="text-primary">Minhas Denúncias</span>
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm font-mono uppercase tracking-wider">
                        Histórico completo das suas denúncias
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <Filter className="w-4 h-4" />
                    Filtrar por:
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setFilter("all")}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === "all"
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                            }`}
                    >
                        Todas ({allReports.length})
                    </button>
                    <button
                        onClick={() => setFilter("open")}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === "open"
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                            }`}
                    >
                        Em Aberto ({allReports.filter((r: any) => r.status === "PENDING").length})
                    </button>
                </div>
            </div>

            {/* Reports List */}
            <div className="gta-card overflow-hidden">
                {isLoadingReports ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-bold text-foreground mb-1">Nenhuma denúncia encontrada</h3>
                        <p className="text-muted-foreground text-sm">Você ainda não registrou nenhuma denúncia com este filtro.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-muted/30 dark:bg-white/5 border-b border-border">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-24">ID</th>
                                    <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Acusado</th>
                                    <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Motivo</th>
                                    <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Descrição</th>
                                    <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Status</th>
                                    <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Data</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filteredReports.map((report: any) => (
                                    <tr
                                        key={report.id}
                                        className="hover:bg-muted/50 dark:hover:bg-white/[0.02] transition-colors group"
                                    >
                                        <td className="p-4">
                                            <span className="text-muted-foreground text-xs font-mono font-medium group-hover:text-primary transition-colors">
                                                #{report.id ? String(report.id).padStart(4, '0') : "????"}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-foreground font-bold text-sm">
                                                    {report.accusedName || "Desconhecido"}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-mono">
                                                    ID: {report.accusedId || "N/A"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            {report.reason || "Outros"}
                                        </td>
                                        <td className="p-4 hidden md:table-cell">
                                            <p className="text-muted-foreground text-xs line-clamp-1 max-w-[200px]">
                                                {report.description || "Sem descrição"}
                                            </p>
                                        </td>
                                        <td className="p-4 text-center">
                                            {getStatusBadge(report.status || "PENDING")}
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="text-muted-foreground text-xs font-mono">
                                                {report.createdAt ? new Date(report.createdAt).toLocaleDateString("pt-BR") : "-"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
