"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ShieldAlert, FileText, Filter, Eye, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import StatsCard from "@/components/admin/StatsCard";
import useSWR from "swr";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminReportsPage() {
    const { data: session, status } = useSession();
    const [filter, setFilter] = useState<"all" | "pending" | "investigating">("all");
    const [searchQuery, setSearchQuery] = useState("");

    const isAuthenticated = status === "authenticated";
    const isLoadingAuth = status === "loading";
    const role = session?.user?.role || "PLAYER";
    const isAdmin = role === "ADMIN";
    const isEvaluator = role === "EVALUATOR";

    // Fetch all reports
    const { data: reportsData, isLoading: isLoadingReports, mutate } = useSWR(
        isAuthenticated && (isAdmin || isEvaluator) ? "/api/reports" : null,
        fetcher
    );

    const allReports = reportsData?.reports || [];

    // Only show active reports (PENDING or INVESTIGATING) - resolved go to History
    const activeReports = allReports.filter((r: any) => r.status === "PENDING" || r.status === "INVESTIGATING");

    // Filter reports
    const filteredReports = activeReports.filter((report: any) => {
        // Status filter
        if (filter === "pending" && report.status !== "PENDING") return false;
        if (filter === "investigating" && report.status !== "INVESTIGATING") return false;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                (report.accusedName && report.accusedName.toLowerCase().includes(query)) ||
                (report.accusedId && report.accusedId.toLowerCase().includes(query)) ||
                (report.id && String(report.id).toLowerCase().includes(query)) ||
                (report.description && report.description.toLowerCase().includes(query))
            );
        }

        return true;
    });

    // Stats
    const pendingCount = activeReports.filter((r: any) => r.status === "PENDING").length;
    const investigatingCount = activeReports.filter((r: any) => r.status === "INVESTIGATING").length;
    const resolvedCount = allReports.filter((r: any) => r.status === "APPROVED" || r.status === "REJECTED").length;

    // Show loading state
    if (isLoadingAuth) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Check access
    if (!isAuthenticated || (!isAdmin && !isEvaluator)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-24 h-24 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center justify-center mb-6 animate-pulse">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold mb-2 font-display uppercase tracking-wide text-white">
                    Acesso Negado
                </h2>
                <p className="text-zinc-500">Apenas administradores e avaliadores podem acessar esta área.</p>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return (
                    <span className="inline-flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 rounded px-3 py-1 text-xs font-bold text-yellow-400">
                        <Clock className="w-3 h-3" />
                        Pendente
                    </span>
                );
            case "INVESTIGATING":
                return (
                    <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 rounded px-3 py-1 text-xs font-bold text-blue-400">
                        <Eye className="w-3 h-3" />
                        Em Análise
                    </span>
                );
            case "APPROVED":
                return (
                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded px-3 py-1 text-xs font-bold text-emerald-400">
                        <CheckCircle className="w-3 h-3" />
                        Aprovada
                    </span>
                );
            case "REJECTED":
                return (
                    <span className="inline-flex items-center gap-1 bg-red-500/10 border border-red-500/20 rounded px-3 py-1 text-xs font-bold text-red-400">
                        <XCircle className="w-3 h-3" />
                        Rejeitada
                    </span>
                );
            default:
                return null;
        }
    };

    const stats = [
        {
            title: "Ativas",
            value: activeReports.length,
            icon: <FileText className="w-6 h-6 text-primary" />,
            description: "Aguardando resolução"
        },
        {
            title: "Pendentes",
            value: pendingCount,
            icon: <Clock className="w-6 h-6 text-yellow-500" />,
            description: "Aguardando análise"
        },
        {
            title: "Em Investigação",
            value: investigatingCount,
            icon: <Eye className="w-6 h-6 text-blue-500" />,
            description: "Sendo analisadas"
        },
        {
            title: "No Histórico",
            value: resolvedCount,
            icon: <CheckCircle className="w-6 h-6 text-emerald-500" />,
            description: "Ver aba Histórico"
        },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1800px] mx-auto pb-12">
            <aside className="w-full lg:w-64 flex-shrink-0">
                <AdminSidebar />
            </aside>

            <main className="flex-1 space-y-8 min-w-0">
                <div className="bg-black/40 p-6 rounded border border-white/5">
                    <h1 className="text-3xl font-bold text-white tracking-widest uppercase font-display">
                        Gerenciar <span className="text-primary">Denúncias</span>
                    </h1>
                    <p className="text-zinc-400 mt-1 text-sm font-mono uppercase tracking-wider">
                        Visualize e avalie denúncias de jogadores
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <StatsCard key={i} {...stat} />
                    ))}
                </div>

                {/* Search and Filter */}
                <div className="bg-black/40 border border-white/5 rounded p-4 space-y-4">
                    {/* Search */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                            🔍 Buscar Denúncia
                        </label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Digite o nome do acusado, ID ou descrição..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="w-4 h-4 text-zinc-400" />
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mr-2">
                            Filtrar:
                        </span>
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
                            onClick={() => setFilter("pending")}
                            className={`px-4 py-2 rounded text-sm font-bold uppercase tracking-wider transition-all ${filter === "pending"
                                ? "bg-yellow-500 text-black"
                                : "bg-zinc-900 text-zinc-400 hover:text-white"
                                }`}
                        >
                            Pendentes ({pendingCount})
                        </button>
                        <button
                            onClick={() => setFilter("investigating")}
                            className={`px-4 py-2 rounded text-sm font-bold uppercase tracking-wider transition-all ${filter === "investigating"
                                ? "bg-blue-500 text-black"
                                : "bg-zinc-900 text-zinc-400 hover:text-white"
                                }`}
                        >
                            Em Análise ({investigatingCount})
                        </button>
                    </div>
                </div>

                {/* Reports Table */}
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
                                            ID / Protocolo
                                        </th>
                                        <th className="text-left p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                            Acusado
                                        </th>
                                        <th className="text-left p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                            Denunciante
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
                                        <th className="text-center p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                            Ações
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
                                                <p className="text-zinc-300 text-sm">
                                                    {report.reporter?.name || report.reporter?.username || "Anônimo"}
                                                </p>
                                            </td>
                                            <td className="p-4 max-w-xs">
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
                                            <td className="p-4 text-center">
                                                <Link
                                                    href={`/admin/reports/${report.id}`}
                                                    className="inline-flex items-center gap-1 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded px-3 py-2 text-xs font-bold text-primary transition-colors"
                                                >
                                                    <Eye className="w-3 h-3" />
                                                    Analisar
                                                </Link>
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
