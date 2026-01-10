"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ShieldAlert, FileText, Filter } from "lucide-react";
import PlayerSidebar from "@/components/player/PlayerSidebar";
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
        if (filter === "mine") {
            return report.reporterId === session?.user?.id;
        } else if (filter === "open") {
            return report.status === "PENDING";
        }
        return true; // "all"
    });

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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return (
                    <span className="inline-flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 rounded px-3 py-1 text-xs font-bold text-yellow-400">
                        Pendente
                    </span>
                );
            case "INVESTIGATING":
                return (
                    <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 rounded px-3 py-1 text-xs font-bold text-blue-400">
                        Em Análise
                    </span>
                );
            case "APPROVED":
                return (
                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded px-3 py-1 text-xs font-bold text-emerald-400">
                        Aprovada
                    </span>
                );
            case "REJECTED":
                return (
                    <span className="inline-flex items-center gap-1 bg-red-500/10 border border-red-500/20 rounded px-3 py-1 text-xs font-bold text-red-400">
                        Rejeitada
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1800px] mx-auto pb-12">
            <aside className="w-full lg:w-64 flex-shrink-0">
                <PlayerSidebar />
            </aside>

            <main className="flex-1 space-y-8 min-w-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/40 p-6 rounded border border-white/5">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-widest uppercase font-display">
                            <span className="text-primary">Denúncias</span>
                        </h1>
                        <p className="text-zinc-400 mt-1 text-sm font-mono uppercase tracking-wider">
                            Visualize denúncias abertas e suas denúncias
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-black/40 border border-white/5 rounded p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-4 h-4 text-zinc-400" />
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                            Filtrar por:
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-4 py-2 rounded text-sm font-bold uppercase tracking-wider transition-all ${filter === "all"
                                ? "bg-primary text-black"
                                : "bg-zinc-900 text-zinc-400 hover:text-white"
                                }`}
                        >
                            Todas ({allReports.length})
                        </button>
                        <button
                            onClick={() => setFilter("mine")}
                            className={`px-4 py-2 rounded text-sm font-bold uppercase tracking-wider transition-all ${filter === "mine"
                                ? "bg-primary text-black"
                                : "bg-zinc-900 text-zinc-400 hover:text-white"
                                }`}
                        >
                            Minhas Denúncias ({allReports.filter((r: any) => r.reporterId === session?.user?.id).length})
                        </button>
                        <button
                            onClick={() => setFilter("open")}
                            className={`px-4 py-2 rounded text-sm font-bold uppercase tracking-wider transition-all ${filter === "open"
                                ? "bg-primary text-black"
                                : "bg-zinc-900 text-zinc-400 hover:text-white"
                                }`}
                        >
                            Em Aberto ({allReports.filter((r: any) => r.status === "PENDING").length})
                        </button>
                    </div>
                </div>

                {/* Reports List */}
                <div className="bg-black/40 border border-white/5 rounded overflow-hidden">
                    {isLoadingReports ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                            <p className="text-zinc-400">Nenhuma denúncia encontrada.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5 bg-black/20">
                                        <th className="text-left p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="text-left p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                            Acusado
                                        </th>
                                        <th className="text-left p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                            Descrição
                                        </th>
                                        <th className="text-center p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="text-center p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                            Data
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReports.map((report: any, index: number) => (
                                        <tr
                                            key={report.id}
                                            className={`border-b border-white/5 hover:bg-white/5 transition-colors ${index % 2 === 0 ? "bg-black/10" : ""
                                                }`}
                                        >
                                            <td className="p-4">
                                                <span className="text-zinc-500 text-xs font-mono">
                                                    #{report.id ? String(report.id).padStart(4, '0') : "????"}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-white font-medium text-sm">
                                                    {report.accusedName || "Desconhecido"}
                                                </p>
                                                <p className="text-zinc-500 text-xs">
                                                    ID: {report.accusedId || "N/A"}
                                                </p>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-zinc-300 text-sm line-clamp-2">
                                                    {report.description || "Sem descrição"}
                                                </p>
                                            </td>
                                            <td className="p-4 text-center">
                                                {getStatusBadge(report.status || "PENDING")}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="text-zinc-400 text-xs">
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
            </main>
        </div>
    );
}
