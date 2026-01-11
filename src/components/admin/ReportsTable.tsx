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

    const { data, isLoading } = useSWR<ReportsResponse>(`/api/admin/reports?${queryString}`);

    const reports = data?.reports || [];
    const pagination = data?.pagination;

    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    }, []);

    const handleStatusChange = useCallback((value: string) => {
        setStatusFilter(value);
        setCurrentPage(1);
    }, []);

    const handlePrevPage = useCallback(() => {
        setCurrentPage((p) => Math.max(1, p - 1));
    }, []);

    const handleNextPage = useCallback(() => {
        if (pagination) {
            setCurrentPage((p) => Math.min(pagination.totalPages, p + 1));
        }
    }, [pagination]);

    const handleClaim = useCallback(async (reportId: number) => {
        setClaimingId(reportId);
        try {
            const res = await fetch(`/api/admin/reports/${reportId}/claim`, {
                method: "POST",
            });
            if (res.ok) {
                // Refresh the reports list
                mutate(`/api/admin/reports?${queryString}`);
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
    }, [queryString]);

    return (
        <div className="gta-card overflow-hidden bg-card/50 backdrop-blur-sm border-border fade-in">
            {/* Header */}
            <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                    <h3 className="text-lg font-bold text-foreground uppercase tracking-wider font-display">
                        Registros ({pagination?.total || 0})
                    </h3>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Status Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="bg-input border border-border text-sm rounded px-4 py-2 pl-10 outline-none text-foreground focus:border-primary cursor-pointer w-full appearance-none uppercase tracking-wide font-bold transition-colors"
                        >
                            <option value="ALL">Todos os Status</option>
                            <option value="PENDING">Pendentes</option>
                            <option value="INVESTIGATING">Em Analise</option>
                            <option value="APPROVED">Aprovados</option>
                            <option value="REJECTED">Rejeitados</option>
                        </select>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <input
                            type="text"
                            placeholder="BUSCAR ID, JOGADOR..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="bg-input border border-border text-sm rounded pl-10 pr-4 py-2 w-full sm:w-64 focus:ring-1 focus:ring-primary focus:border-primary outline-none text-foreground placeholder-muted-foreground uppercase font-mono transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border">
                            <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest font-display">ID</th>
                            <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest font-display">Autor</th>
                            <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest font-display">Motivo</th>
                            <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest font-display">Acusado</th>
                            <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest font-display">Status</th>
                            <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest font-display text-right">Acoes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
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
                                    className="group table-row-hover"
                                    style={{
                                        animationDelay: `${index * 30}ms`,
                                    }}
                                >
                                    <td className="p-4 text-sm font-mono text-muted-foreground">
                                        #{report.id.toString().padStart(4, "0")}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {report.reporter?.avatar ? (
                                                <Image
                                                    src={report.reporter.avatar}
                                                    alt={report.reporter.username || "Avatar"}
                                                    width={24}
                                                    height={24}
                                                    className="rounded grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                                                />
                                            ) : (
                                                <div className="w-6 h-6 rounded bg-secondary" />
                                            )}
                                            <span className="text-sm text-foreground font-medium">
                                                {report.reporter?.username || "Desconhecido"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-secondary text-secondary-foreground border border-border">
                                            {report.reason}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground border border-border font-mono">
                                                {report.accusedId.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-foreground tracking-wide">
                                                    ID {report.accusedId}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                                        {new Date(report.createdAt).toLocaleDateString("pt-BR")}
                                                    </div>
                                                    {report.accusedFamily && (
                                                        <span className="text-[10px] text-primary font-bold uppercase tracking-wider mt-0.5">
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
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Claim Button - only show for PENDING reports */}
                                            {report.status === "PENDING" && (
                                                <button
                                                    onClick={() => handleClaim(report.id)}
                                                    disabled={claimingId === report.id}
                                                    title="Puxar para mim"
                                                    className="inline-flex items-center justify-center w-8 h-8 text-cyan-500 hover:text-cyan-600 hover:bg-cyan-500/10 rounded transition-all border border-cyan-500/20 hover:border-cyan-500/50 active:scale-95 disabled:opacity-50"
                                                >
                                                    {claimingId === report.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <UserPlus className="w-4 h-4" />
                                                    )}
                                                </button>
                                            )}
                                            <Link
                                                href={`/admin/reports/${report.id}`}
                                                className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-foreground hover:bg-primary px-3 py-1.5 rounded transition-all uppercase tracking-wide border border-primary/20 hover:border-primary active:scale-95"
                                            >
                                                <Eye className="w-3 h-3" />
                                                Analisar
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                        {/* Empty State */}
                        {!isLoading && reports.length === 0 && (
                            <tr>
                                <td colSpan={6}>
                                    <NoSearchResults searchTerm={searchTerm} />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    <span>
                        Mostrando {(pagination.page - 1) * pagination.limit + 1}-
                        {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrevPage}
                            disabled={pagination.page === 1}
                            className="p-1 px-3 rounded bg-secondary border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center active:scale-95"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={pagination.page === pagination.totalPages}
                            className="p-1 px-3 rounded bg-secondary border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center active:scale-95"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
