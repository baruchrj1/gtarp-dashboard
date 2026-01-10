"use client";

import Link from "next/link";
import { useState } from "react";

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
        <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">Denúncias ({filteredReports.length})</h3>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="bg-zinc-900 border border-zinc-700 text-sm rounded-lg px-4 py-2 outline-none text-zinc-200 focus:border-primary cursor-pointer"
                    >
                        <option value="ALL">Todos os Status</option>
                        <option value="PENDING">Pendentes</option>
                        <option value="INVESTIGATING">Em Análise</option>
                        <option value="APPROVED">Aprovados</option>
                        <option value="REJECTED">Rejeitados</option>
                    </select>

                    {/* Search Input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar ID, Jogador..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="bg-zinc-900 border border-zinc-700 text-sm rounded-lg pl-10 pr-4 py-2 w-full sm:w-64 focus:ring-1 focus:ring-primary focus:border-primary outline-none text-zinc-200 placeholder-zinc-500"
                        />
                        <svg className="w-4 h-4 text-zinc-500 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-zinc-900/50 border-b border-zinc-800">
                            <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">ID</th>
                            <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Acusado</th>
                            <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Motivo</th>
                            <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Autor</th>
                            <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {paginatedReports.map((report) => (
                            <tr key={report.id} className="group hover:bg-zinc-800/30 transition-colors duration-200">
                                <td className="p-4 text-sm font-medium text-zinc-300">#{report.id}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 border border-zinc-700">
                                            {report.accusedId.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white">ID {report.accusedId}</div>
                                            <div className="text-xs text-zinc-500">{new Date(report.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                                        {report.reason}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        {report.reporter.avatar ? (
                                            <img src={report.reporter.avatar} alt="" className="w-6 h-6 rounded-full" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-zinc-800" />
                                        )}
                                        <span className="text-sm text-zinc-400">{report.reporter.username}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(report.status)}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${report.status === 'PENDING' ? 'bg-yellow-500' :
                                            report.status === 'APPROVED' ? 'bg-emerald-500' :
                                                report.status === 'REJECTED' ? 'bg-red-500' : 'bg-blue-500'
                                            }`}></div>
                                        {report.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <Link
                                        href={`/admin/reports/${report.id}`}
                                        className="inline-block text-sm font-medium text-primary hover:text-primary-foreground hover:bg-primary/10 px-3 py-1.5 rounded-md transition-all"
                                    >
                                        Analisar
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {filteredReports.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-zinc-500">
                                        <svg className="w-12 h-12 mb-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-lg font-medium text-zinc-400">Nenhuma denúncia encontrada</p>
                                        <p className="text-sm mt-1">Tente ajustar seus filtros de busca.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-sm text-zinc-400">
                    <span>
                        Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredReports.length)} de {filteredReports.length} resultados
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Próxima
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
