"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, Eye } from "lucide-react";

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

interface ReportsTableProps {
    reports: Report[];
}

export default function ReportsTable({ reports }: ReportsTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter logic
    const filteredReports = reports.filter(report => {
        const matchesSearch =
            report.accusedId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.reporter.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.id.toString().includes(searchTerm);

        const matchesStatus = statusFilter === "ALL" || report.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
    const paginatedReports = filteredReports.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
            case "APPROVED":
                return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "REJECTED":
                return "bg-red-500/10 text-red-500 border-red-500/20";
            case "INVESTIGATING":
                return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            default:
                return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
        }
    };

    return (
        <div className="gta-card overflow-hidden bg-card/50 backdrop-blur-sm border-zinc-800">
            <div className="p-6 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider font-display">Registros ({filteredReports.length})</h3>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Status Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            className="bg-zinc-900 border border-zinc-700 text-sm rounded px-4 py-2 pl-10 outline-none text-zinc-200 focus:border-primary cursor-pointer w-full appearance-none uppercase tracking-wide font-bold"
                        >
                            <option value="ALL">Todos os Status</option>
                            <option value="PENDING">Pendentes</option>
                            <option value="INVESTIGATING">Em Análise</option>
                            <option value="APPROVED">Aprovados</option>
                            <option value="REJECTED">Rejeitados</option>
                        </select>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="BUSCAR ID, JOGADOR..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="bg-black/50 border border-zinc-700 text-sm rounded pl-10 pr-4 py-2 w-full sm:w-64 focus:ring-1 focus:ring-primary focus:border-primary outline-none text-white placeholder-zinc-600 uppercase font-mono"
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-black/40 border-b border-zinc-800">
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest font-display">ID</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest font-display">Acusado</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest font-display">Motivo</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest font-display">Autor</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest font-display">Status</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest font-display text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                        {paginatedReports.map((report) => (
                            <tr key={report.id} className="group hover:bg-white/5 transition-colors duration-200">
                                <td className="p-4 text-sm font-mono text-zinc-400">#{report.id.toString().padStart(4, '0')}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 border border-zinc-700 font-mono">
                                            {report.accusedId.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white tracking-wide">ID {report.accusedId}</div>
                                            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{new Date(report.createdAt).toLocaleDateString()}</div>
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
                                            <img src={report.reporter.avatar} alt="" className="w-6 h-6 rounded grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                                        ) : (
                                            <div className="w-6 h-6 rounded bg-zinc-800" />
                                        )}
                                        <span className="text-sm text-zinc-400 font-medium">{report.reporter.username}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border ${getStatusStyles(report.status)}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${report.status === 'PENDING' ? 'bg-yellow-500 animate-pulse' :
                                            report.status === 'APPROVED' ? 'bg-emerald-500' :
                                                report.status === 'REJECTED' ? 'bg-red-500' : 'bg-blue-500'
                                            }`}></div>
                                        {report.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <Link
                                        href={`/admin/reports/${report.id}`}
                                        className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-white hover:bg-primary px-3 py-1.5 rounded transition-all uppercase tracking-wide border border-primary/20 hover:border-primary"
                                    >
                                        <Eye className="w-3 h-3" />
                                        Analisar
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {filteredReports.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-zinc-500">
                                        <div className="w-16 h-16 bg-zinc-900 rounded border border-zinc-800 flex items-center justify-center mb-4">
                                            <Search className="w-8 h-8 text-zinc-600" />
                                        </div>
                                        <p className="text-lg font-bold text-zinc-400 uppercase tracking-widest">Nenhum registro</p>
                                        <p className="text-xs mt-1 uppercase tracking-wide">Ajuste os filtros de busca</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500 uppercase tracking-wider font-medium">
                    <span>
                        Mostrando {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredReports.length)} / {filteredReports.length}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1 px-3 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1 px-3 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
