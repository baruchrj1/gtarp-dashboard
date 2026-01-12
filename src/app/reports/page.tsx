
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Clock, CheckCircle, XCircle, Search, AlertCircle, FileText, ChevronRight } from "lucide-react";

interface Report {
    id: number;
    reason: string;
    description: string | null;
    status: "PENDING" | "APPROVED" | "REJECTED" | "INVESTIGATING";
    createdAt: string;
}

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/reports")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setReports(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "APPROVED": return { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Aprovado" };
            case "REJECTED": return { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Rejeitado" };
            case "INVESTIGATING": return { icon: Search, color: "text-amber-500", bg: "bg-amber-500/10", label: "Em Análise" };
            default: return { icon: Clock, color: "text-zinc-400", bg: "bg-zinc-500/10", label: "Pendente" };
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-display uppercase tracking-wider text-white">Minhas Denúncias</h1>
                    <p className="text-zinc-400">Acompanhe o status das suas denúncias abertas.</p>
                </div>
                <Link
                    href="/reports/new"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-bold uppercase tracking-wider transition-all transform hover:translate-y-[-2px] shadow-lg shadow-primary/25"
                >
                    <Plus className="w-5 h-5" />
                    Nova Denúncia
                </Link>
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-20 text-zinc-500 animate-pulse">Carregando denúncias...</div>
                ) : reports.length === 0 ? (
                    <div className="bg-card border border-border rounded-xl p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-zinc-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Nenhuma denúncia encontrada</h3>
                        <p className="text-zinc-400 mb-6 max-w-sm">Você ainda não criou nenhuma denúncia neste servidor.</p>
                        <Link
                            href="/reports/new"
                            className="text-primary hover:underline font-medium"
                        >
                            Criar minha primeira denúncia
                        </Link>
                    </div>
                ) : (
                    reports.map(report => {
                        const status = getStatusConfig(report.status);
                        const StatusIcon = status.icon;

                        return (
                            <Link
                                href={`/reports/${report.id}`}
                                key={report.id}
                                className="group block bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 hover:border-primary/30 rounded-xl p-5 transition-all duration-200"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrikh-0 ${status.bg}`}>
                                        <StatusIcon className={`w-6 h-6 ${status.color}`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono text-zinc-500">#{report.id}</span>
                                            <h3 className="text-white font-bold truncate group-hover:text-primary transition-colors">{report.reason}</h3>
                                        </div>
                                        <p className="text-sm text-zinc-400 truncate">{report.description || "Sem descrição adicional"}</p>
                                    </div>

                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide ${status.bg} ${status.color}`}>
                                            {status.label}
                                        </span>
                                        <span className="text-xs text-zinc-600">
                                            {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>

                                    <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
