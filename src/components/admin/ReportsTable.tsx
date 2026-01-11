"use client";

import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { useState, useCallback, useMemo } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { NoSearchResults } from "@/components/ui/EmptyState";
import { SkeletonTableRow } from "@/components/ui/Skeleton";

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

interface ReportsResponse {
    reports: Report[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export default function ReportsTable() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);

    // Memoize query string to prevent unnecessary refetches
    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        params.set("page", currentPage.toString());
        params.set("limit", "20");
        if (statusFilter !== "ALL") params.set("status", statusFilter);
        if (searchTerm) params.set("search", searchTerm);
        return params.toString();
    }, [currentPage, statusFilter, searchTerm]);

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

    return (
        <div className="gta-card overflow-hidden bg-card/50 backdrop-blur-sm border-zinc-800 fade-in">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider font-display">
                        Registros ({pagination?.total || 0})
                    </h3>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Status Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="bg-zinc-900 border border-zinc-700 text-sm rounded px-4 py-2 pl-10 outline-none text-zinc-200 focus:border-primary cursor-pointer w-full appearance-none uppercase tracking-wide font-bold transition-colors"
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
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="BUSCAR ID, JOGADOR..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="bg-black/50 border border-zinc-700 text-sm rounded pl-10 pr-4 py-2 w-full sm:w-64 focus:ring-1 focus:ring-primary focus:border-primary outline-none text-white placeholder-zinc-600 uppercase font-mono transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-black/40 border-b border-zinc-800">
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest font-display">ID</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest font-display">Acusado</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest font-display">Motivo</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest font-display">Autor</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest font-display">Status</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest font-display text-right">Acoes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
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
                                    <td className="p-4 text-sm font-mono text-zinc-400">
                                        #{report.id.toString().padStart(4, "0")}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 border border-zinc-700 font-mono">
                                                {report.accusedId.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white tracking-wide">
                                                    ID {report.accusedId}
                                                </div>
                                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                                    {new Date(report.createdAt).toLocaleDateString("pt-BR")}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-900 text-zinc-300 border border-zinc-800">
                                            {report.reason}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {report.reporter.avatar ? (
                                                <Image
                                                    src={report.reporter.avatar}
                                                    alt={report.reporter.username}
                                                    width={24}
                                                    height={24}
                                                    className="rounded grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                                                />
                                            ) : (
                                                <div className="w-6 h-6 rounded bg-zinc-800" />
                                            )}
                                            <span className="text-sm text-zinc-400 font-medium">
                                                {report.reporter.username}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <StatusBadge status={report.status} size="sm" />
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link
                                            href={`/admin/reports/${report.id}`}
                                            className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-white hover:bg-primary px-3 py-1.5 rounded transition-all uppercase tracking-wide border border-primary/20 hover:border-primary active:scale-95"
                                        >
                                            <Eye className="w-3 h-3" />
                                            Analisar
                                        </Link>
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
                <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500 uppercase tracking-wider font-medium">
                    <span>
                        Mostrando {(pagination.page - 1) * pagination.limit + 1}-
                        {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrevPage}
                            disabled={pagination.page === 1}
                            className="p-1 px-3 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center active:scale-95"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={pagination.page === pagination.totalPages}
                            className="p-1 px-3 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center active:scale-95"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
