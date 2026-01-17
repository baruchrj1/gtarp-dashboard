"use client";

import useSWR, { mutate } from "swr";
import Link from "next/link";
import Image from "next/image";
import { useState, useCallback, useMemo, memo } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, Eye, UserPlus, Loader2, UserMinus } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { NoSearchResults } from "@/components/ui/EmptyState";
import { SkeletonTableRow } from "@/components/ui/Skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { useSession } from "next-auth/react";
import type { Report, ReportsResponse } from "@/types";


export default function ReportsTable() {
    const { data: session } = useSession();
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

    const { data, isLoading, mutate: refreshReports } = useSWR<ReportsResponse>(`/api/admin/reports?${queryString}`, {
        keepPreviousData: true
    });

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
        if (!session?.user?.id) return;

        // Optimistic Update
        const optimisticData = {
            ...data,
            reports: data?.reports.map(r => {
                if (r.id === reportId) {
                    return {
                        ...r,
                        status: "INVESTIGATING",
                        handledBy: session.user.id
                    };
                }
                return r;
            }) || []
        };

        // Update cache immediately without validation
        mutate(`/api/admin/reports?${queryString}`, optimisticData, false);

        setClaimingId(reportId);
        try {
            const res = await fetch(`/api/admin/reports/${reportId}/claim`, {
                method: "POST",
            });

            if (!res.ok) {
                const errorData = await res.json();
                alert(errorData.error || "Erro ao puxar denúncia");
                // Revert on error
                refreshReports();
            } else {
                // Silently revalidate to ensure consistency
                refreshReports();
            }
        } catch (error) {
            console.error("Error claiming report:", error);
            alert("Erro ao puxar denúncia");
            refreshReports();
        } finally {
            setClaimingId(null);
        }
    }, [data, queryString, refreshReports, session]);

    const handleUnclaim = useCallback(async (reportId: number) => {
        if (!confirm("Deseja devolver esta denúncia para a fila?")) return;

        // Optimistic Update
        const optimisticData = {
            ...data,
            reports: data?.reports.map(r => {
                if (r.id === reportId) {
                    return {
                        ...r,
                        status: "PENDING",
                        handledBy: null
                    };
                }
                return r;
            }) || []
        };

        // Update cache immediately
        mutate(`/api/admin/reports?${queryString}`, optimisticData, false);

        try {
            const res = await fetch(`/api/admin/reports/${reportId}/claim`, {
                method: "DELETE", // Assuming DELETE endpoint exists for unclaim based on standard REST for this resource interaction
            });

            if (!res.ok) {
                const errorData = await res.json();
                alert(errorData.error || "Erro ao devolver denúncia");
                refreshReports();
            } else {
                refreshReports();
            }
        } catch (error) {
            console.error("Error unclaiming report:", error);
            alert("Erro ao devolver denúncia");
            refreshReports();
        }
    }, [data, queryString, refreshReports]);

    return (
        <div className="relative min-h-[600px] flex flex-col">
            {/* Bulk Action Bar - Premium "Dynamic Island" Style */}
            <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${selectedIds.length > 0 ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"}`}>
                <div className="bg-popover dark:bg-zinc-950/80 backdrop-blur-xl border border-border dark:border-white/10 shadow-2xl shadow-black/20 dark:shadow-black/50 rounded-full px-2 py-2 flex items-center gap-2 ring-1 ring-border dark:ring-white/5">
                    <div className="pl-4 pr-3 flex items-center gap-3 border-r border-border dark:border-white/10">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">
                            {selectedIds.length}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground dark:text-zinc-400">selecionados</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            disabled={bulkActionLoading}
                            onClick={() => handleBulkAction("APPROVED")}
                            className="px-4 py-2 rounded-full text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-all uppercase tracking-wide flex items-center gap-2 disabled:opacity-50"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                            Aprovar
                        </button>
                        <button
                            disabled={bulkActionLoading}
                            onClick={() => handleBulkAction("REJECTED")}
                            className="px-4 py-2 rounded-full text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-all uppercase tracking-wide flex items-center gap-2 disabled:opacity-50"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                            Rejeitar
                        </button>
                        <button
                            disabled={bulkActionLoading}
                            onClick={() => handleBulkAction("INVESTIGATING")}
                            className="px-4 py-2 rounded-full text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition-all uppercase tracking-wide flex items-center gap-2 disabled:opacity-50"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                            Mover pra mim
                        </button>
                    </div>

                    <button
                        onClick={() => setSelectedIds([])}
                        className="ml-2 w-8 h-8 flex items-center justify-center rounded-full bg-muted dark:bg-white/5 hover:bg-muted/80 dark:hover:bg-white/10 text-muted-foreground dark:text-zinc-400 hover:text-foreground dark:hover:text-white transition-colors"
                    >
                        <span className="sr-only">Fechar</span>
                        &#10005;
                    </button>
                </div>
            </div>

            <div className="gta-card overflow-hidden mb-4">
                {/* Header */}
                <div className="p-6 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-muted/50 via-transparent to-transparent">
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
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="w-full sm:w-40 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs rounded-lg px-4 py-2.5 pl-4 outline-none text-foreground focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer appearance-none uppercase tracking-wide font-bold transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700"
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
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                        <input
                            type="text"
                            placeholder="BUSCAR ID, NOME..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full sm:w-64 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs rounded-lg pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary outline-none text-foreground placeholder-muted-foreground uppercase font-mono transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-primary/20 dark:bg-primary/10 border-b border-primary/30">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-primary dark:text-primary-foreground/80 uppercase tracking-wider w-12">
                                <div className="w-2 h-2 rounded-full bg-primary/40 dark:bg-primary/60"></div>
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-primary dark:text-primary-foreground/80 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-4 text-xs font-bold text-primary dark:text-primary-foreground/80 uppercase tracking-wider">Autor</th>
                            <th className="px-6 py-4 text-xs font-bold text-primary dark:text-primary-foreground/80 uppercase tracking-wider">Motivo</th>
                            <th className="px-6 py-4 text-xs font-bold text-primary dark:text-primary-foreground/80 uppercase tracking-wider">Acusado</th>
                            <th className="px-6 py-4 text-xs font-bold text-primary dark:text-primary-foreground/80 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-primary dark:text-primary-foreground/80 uppercase tracking-wider text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border dark:divide-white/5">
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
                                    className={`group transition-all duration-200 hover:bg-primary/10 dark:hover:bg-primary/15 border-b border-primary/10 ${selectedIds.includes(report.id) ? "bg-primary/15 hover:bg-primary/20" : ""}`}
                                    style={{
                                        animationDelay: `${index * 50}ms`,
                                    }}
                                >
                                    <td className="p-4 text-center">
                                        <input
                                            type="checkbox"
                                            className="appearance-none w-4 h-4 rounded border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 checked:bg-primary checked:border-primary focus:ring-offset-0 focus:ring-1 focus:ring-primary transition-all cursor-pointer relative after:content-['✓'] after:absolute after:text-primary-foreground after:text-[10px] after:font-bold after:top-[0px] after:left-[2px] after:opacity-0 checked:after:opacity-100"
                                            checked={selectedIds.includes(report.id)}
                                            onChange={() => toggleSelectOne(report.id)}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors">
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
                                                <div className="w-8 h-8 rounded-lg bg-muted dark:bg-zinc-800 flex items-center justify-center">
                                                    <span className="text-xs font-bold text-muted-foreground">{report.reporter?.username?.[0]?.toUpperCase()}</span>
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-foreground transition-colors">
                                                    {report.reporter?.username || "Desconhecido"}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-tighter font-mono">Autor</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <span className="inline-flex items-center px-2 py-1 rounded border border-border dark:border-white/20 bg-muted dark:bg-transparent text-[10px] font-bold text-foreground dark:text-white uppercase tracking-wider hover:bg-muted/80 dark:hover:bg-white/5 transition-colors cursor-default">
                                            {report.reason}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                <span className="text-xs font-black text-primary font-mono">
                                                    {report.accusedId.substring(0, 2).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-foreground dark:text-white tracking-tight flex items-center gap-2">
                                                    ID {report.accusedId}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-muted-foreground font-mono">
                                                        {new Date(report.createdAt).toLocaleDateString("pt-BR")}
                                                    </span>
                                                    {report.accusedFamily && (
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/10 border border-primary/20 text-primary uppercase tracking-wider">
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
                                                    title="Puxar para mim"
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500 hover:text-black transition-all"
                                                >
                                                    {claimingId === report.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                                </button>
                                            )}

                                            {/* Unclaim (Devolver) Button - Only for current user or admin */}
                                            {(report.status === "INVESTIGATING" && (report.handledBy === session?.user?.id || session?.user?.isAdmin)) && (
                                                <button
                                                    onClick={() => handleUnclaim(report.id)}
                                                    title="Devolver para fila"
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-all"
                                                >
                                                    <UserMinus className="w-4 h-4" />
                                                </button>
                                            )}
                                            <Link
                                                href={`/admin/reports/${report.id}`}
                                                className="pl-3 pr-4 py-1.5 rounded-lg bg-white border border-primary/20 dark:bg-zinc-800 dark:border-transparent hover:bg-primary hover:border-primary text-primary hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all group/btn shadow-sm hover:shadow-primary/25"
                                            >
                                                <Eye className="w-3 h-3 group-hover/btn:text-white transition-colors" />
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
                <div className="p-4 border-t border-border dark:border-white/5 bg-white dark:bg-zinc-950/30 flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    <span>
                        Mostrando {(pagination.page - 1) * pagination.limit + 1}-
                        {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrevPage}
                            disabled={pagination.page === 1}
                            className="w-8 h-8 flex items-center justify-center rounded bg-white dark:bg-zinc-900 border border-border dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-foreground dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={pagination.page === pagination.totalPages}
                            className="w-8 h-8 flex items-center justify-center rounded bg-white dark:bg-zinc-900 border border-border dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-foreground dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
