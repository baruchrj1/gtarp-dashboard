"use client";

import useSWR, { mutate } from "swr";
import Link from "next/link";
import Image from "next/image";
import { useState, useCallback, useMemo, memo } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, Eye, UserPlus, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { NoSearchResults } from "@/components/ui/EmptyState";
import { SkeletonTableRow } from "@/components/ui/Skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import type { Report, ReportsResponse } from "@/types";


export default function ReportsTable() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [claimingId, setClaimingId] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkActionLoading, setBulkActionLoading] = useState(false);

    // Debounce search term to reduce API calls
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Memoize query string to prevent unnecessary refetches
    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        params.set("page", currentPage.toString());
        params.set("limit", "20");
        if (statusFilter !== "ALL") params.set("status", statusFilter);
        if (debouncedSearch) params.set("search", debouncedSearch);
        return params.toString();
    }, [currentPage, statusFilter, debouncedSearch]);

    const { data, isLoading, mutate: refreshReports } = useSWR<ReportsResponse>(`/api/admin/reports?${queryString}`);

    const reports = data?.reports || [];
    const pagination = data?.pagination;

    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
        setSelectedIds([]);
    }, []);

    const handleStatusChange = useCallback((value: string) => {
        setStatusFilter(value);
        setCurrentPage(1);
        setSelectedIds([]);
    }, []);

    const handlePrevPage = useCallback(() => {
        setCurrentPage((p) => Math.max(1, p - 1));
        setSelectedIds([]);
    }, []);

    const handleNextPage = useCallback(() => {
        if (pagination) {
            setCurrentPage((p) => Math.min(pagination.totalPages, p + 1));
            setSelectedIds([]);
        }
    }, [pagination]);

    // Selection Logic
    const toggleSelectAll = () => {
        if (selectedIds.length === reports.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(reports.map(r => r.id));
        }
    };

    const toggleSelectOne = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // Bulk Action Logic
    const handleBulkAction = async (status: string) => {
        if (!confirm(`Tem certeza que deseja marcar ${selectedIds.length} denúncias como ${status}?`)) return;

        setBulkActionLoading(true);
        try {
            const res = await fetch("/api/admin/reports/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selectedIds, status })
            });

            if (res.ok) {
                // Refresh
                refreshReports();
                setSelectedIds([]);
                alert("Ação em massa realizada com sucesso!");
            } else {
                alert("Erro ao realizar ação em massa.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro interno.");
        } finally {
            setBulkActionLoading(false);
        }
    };

    const handleClaim = useCallback(async (reportId: number) => {
        setClaimingId(reportId);
        try {
            const res = await fetch(`/api/admin/reports/${reportId}/claim`, {
                method: "POST",
            });
            if (res.ok) {
                // Refresh the reports list
                refreshReports();
            } else {
                const data = await res.json();
                alert(data.error || "Erro ao puxar denúncia");
            }
        } catch (error) {
            console.error("Error claiming report:", error);
            alert("Erro ao puxar denúncia");
        } finally {
            setClaimingId(null);
        }
    }, [refreshReports]); // Changed dependency to refreshReports fn

    return (
        <div className="relative min-h-[600px] flex flex-col">
            {/* Bulk Action Bar - Premium "Dynamic Island" Style */}
            <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${selectedIds.length > 0 ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"}`}>
                <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 rounded-full px-2 py-2 flex items-center gap-2 ring-1 ring-white/5">
                    <div className="pl-4 pr-3 flex items-center gap-3 border-r border-white/10">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">
                            {selectedIds.length}
                        </div>
                        <span className="text-xs font-medium text-zinc-400">selecionados</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            disabled={bulkActionLoading}
                            onClick={() => handleBulkAction("APPROVED")}
                            className="px-4 py-2 rounded-full text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all uppercase tracking-wide flex items-center gap-2 disabled:opacity-50"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                            Aprovar
                        </button>
                        <button
                            disabled={bulkActionLoading}
                            onClick={() => handleBulkAction("REJECTED")}
                            className="px-4 py-2 rounded-full text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all uppercase tracking-wide flex items-center gap-2 disabled:opacity-50"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                            Rejeitar
                        </button>
                        <button
                            disabled={bulkActionLoading}
                            onClick={() => handleBulkAction("INVESTIGATING")}
                            className="px-4 py-2 rounded-full text-xs font-bold text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-all uppercase tracking-wide flex items-center gap-2 disabled:opacity-50"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                            Mover pra mim
                        </button>
                    </div>

                    <button
                        onClick={() => setSelectedIds([])}
                        className="ml-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                    >
                        <span className="sr-only">Fechar</span>
                        &#10005;
                    </button>
                </div>
            </div>

            <div className="gta-card overflow-hidden bg-card/50 backdrop-blur-sm border-border flex-1 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-input">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                            <Filter className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground uppercase tracking-tight font-display">
                                Registros
                            </h3>
                            <p className="text-xs text-muted-foreground font-mono">
                                TOTAL: <span className="text-primary">{pagination?.total || 0}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Status Filter */}
                        <div className="relative group">
                            <select
                                value={statusFilter}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="w-full sm:w-40 bg-zinc-950/50 border border-border text-xs rounded-lg px-4 py-2.5 pl-4 outline-none text-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 cursor-pointer appearance-none uppercase tracking-wide font-bold transition-all hover:bg-zinc-900"
                            >
                                <option value="ALL">Status: Todos</option>
                                <option value="PENDING">Pendentes</option>
                                <option value="INVESTIGATING">Em Análise</option>
                                <option value="APPROVED">Aprovados</option>
                                <option value="REJECTED">Rejeitados</option>
                            </select>
                        </div>

                        {/* Search Input */}
                        <div className="relative group">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors pointer-events-none" />
                            <input
                                type="text"
                                placeholder="BUSCAR ID, NOME..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full sm:w-64 bg-zinc-950/50 border border-border text-xs rounded-lg pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-primary/50 focus:border-primary/50 outline-none text-foreground placeholder-zinc-600 uppercase font-mono transition-all hover:bg-zinc-900"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-950/30 border-b border-white/5">
                                <th className="p-4 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        className="appearance-none w-4 h-4 rounded border border-zinc-700 bg-zinc-900 checked:bg-primary checked:border-primary focus:ring-offset-0 focus:ring-1 focus:ring-primary transition-all cursor-pointer relative after:content-['✓'] after:absolute after:text-black after:text-[10px] after:font-bold after:top-[1px] after:left-[3px] after:opacity-0 checked:after:opacity-100"
                                        checked={reports.length > 0 && selectedIds.length === reports.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="p-4 text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest font-display">ID</th>
                                <th className="p-4 text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest font-display">Autor</th>
                                <th className="p-4 text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest font-display">Motivo</th>
                                <th className="p-4 text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest font-display">Acusado</th>
                                <th className="p-4 text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest font-display">Status</th>
                                <th className="p-4 text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest font-display text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {/* Loading State */}
                            {isLoading && (
                                <>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <SkeletonTableRow key={i} />
                                    ))}
                                </>
                            )}

                            {/* Data Rows */}
                            {!isLoading &&
                                reports.map((report, index) => (
                                    <tr
                                        key={report.id}
                                        className={`group transition-all duration-200 hover:bg-white/[0.02] ${selectedIds.includes(report.id) ? "bg-primary/[0.08] hover:bg-primary/[0.12]" : ""}`}
                                        style={{
                                            animationDelay: `${index * 50}ms`,
                                        }}
                                    >
                                        <td className="p-4 text-center">
                                            <input
                                                type="checkbox"
                                                className="appearance-none w-4 h-4 rounded border border-zinc-700 bg-zinc-900 checked:bg-primary checked:border-primary focus:ring-offset-0 focus:ring-1 focus:ring-primary transition-all cursor-pointer relative after:content-['✓'] after:absolute after:text-black after:text-[10px] after:font-bold after:top-[1px] after:left-[3px] after:opacity-0 checked:after:opacity-100"
                                                checked={selectedIds.includes(report.id)}
                                                onChange={() => toggleSelectOne(report.id)}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <span className="font-mono text-xs text-zinc-400 group-hover:text-white transition-colors">
                                                #{report.id.toString().padStart(4, "0")}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {report.reporter?.avatar ? (
                                                    <Image
                                                        src={report.reporter.avatar}
                                                        alt={report.reporter.username || "Avatar"}
                                                        width={32}
                                                        height={32}
                                                        className="rounded-lg grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all ring-2 ring-transparent group-hover:ring-white/10"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                                                        <span className="text-xs font-bold text-zinc-500">{report.reporter?.username?.[0]?.toUpperCase()}</span>
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">
                                                        {report.reporter?.username || "Desconhecido"}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-600 uppercase tracking-tighter font-mono">Autor</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span className="inline-flex items-center px-2 py-1 rounded border border-white/20 bg-transparent text-[10px] font-bold text-white uppercase tracking-wider hover:bg-white/5 transition-colors cursor-default">
                                                {report.reason}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                    <span className="text-xs font-black text-zinc-400 font-mono">
                                                        {report.accusedId.substring(0, 2).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                                                        ID {report.accusedId}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-zinc-500 font-mono">
                                                            {new Date(report.createdAt).toLocaleDateString("pt-BR")}
                                                        </span>
                                                        {report.accusedFamily && (
                                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-800 border border-zinc-700 text-zinc-400 uppercase tracking-wider">
                                                                {report.accusedFamily}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <StatusBadge status={report.status} size="sm" />
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                {/* Claim Button */}
                                                {report.status === "PENDING" && (
                                                    <button
                                                        onClick={() => handleClaim(report.id)}
                                                        disabled={claimingId === report.id}
                                                        title="Puxar"
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500 hover:text-black transition-all"
                                                    >
                                                        {claimingId === report.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                                    </button>
                                                )}
                                                <Link
                                                    href={`/admin/reports/${report.id}`}
                                                    className="pl-3 pr-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all group/btn"
                                                >
                                                    <Eye className="w-3 h-3 group-hover/btn:text-primary transition-colors" />
                                                    Analisar
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                            {/* Empty State */}
                            {!isLoading && reports.length === 0 && (
                                <tr>
                                    <td colSpan={7}>
                                        <NoSearchResults searchTerm={searchTerm} />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="p-4 border-t border-white/5 bg-zinc-950/30 flex items-center justify-between text-xs text-zinc-500 uppercase tracking-wider font-medium">
                        <span>
                            Mostrando {(pagination.page - 1) * pagination.limit + 1}-
                            {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={pagination.page === 1}
                                className="w-8 h-8 flex items-center justify-center rounded bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleNextPage}
                                disabled={pagination.page === pagination.totalPages}
                                className="w-8 h-8 flex items-center justify-center rounded bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
