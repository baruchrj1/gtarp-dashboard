"use client";

import useSWR, { mutate } from "swr";
import Link from "next/link";
import { useState, use } from "react";
import { ChevronLeft, Check, X, HelpCircle, Shield, User, FileText, ExternalLink } from "lucide-react";

type ReportDetail = {
    id: number;
    accusedId: string;
    reason: string;
    description: string;
    evidence: string;
    status: string;
    createdAt: string;
    adminNotes: string | null;
    reporter: {
        username: string;
        avatar: string | null;
        id: string;
    };
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ReportDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session } = useSWR("/api/auth/session");
    const { data: reportData, isLoading } = useSWR<ReportDetail>(
        session?.user?.isAdmin ? `/api/admin/reports/${id}` : null,
        fetcher
    );

    const report = reportData;
    const [actionLoading, setActionLoading] = useState(false);
    const [notes, setNotes] = useState(report?.adminNotes || "");
    const [localReport, setLocalReport] = useState<ReportDetail | null>(null);

    if (!session?.user?.isAdmin) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                <Shield className="w-16 h-16 text-zinc-700 mb-4" />
                <h2 className="text-xl font-bold text-white uppercase tracking-widest">Acesso Negado</h2>
                <p className="text-zinc-500 mt-2">Você não tem permissão para visualizar esta página.</p>
                <Link href="/" className="mt-6 gta-btn">Voltar ao Início</Link>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!report && !localReport) return null;

    const currentReport = localReport || report;

    if (!currentReport) return null;

    const getStatusColors = (status: string) => {
        switch (status) {
            case "PENDING": return { bg: "bg-yellow-500", text: "text-yellow-500", border: "border-yellow-500/30", label: "Pendente" };
            case "APPROVED": return { bg: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-500/30", label: "Aprovada" };
            case "REJECTED": return { bg: "bg-red-500", text: "text-red-500", border: "border-red-500/30", label: "Rejeitada" };
            case "INVESTIGATING": return { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500/30", label: "Em Análise" };
            default: return { bg: "bg-zinc-500", text: "text-zinc-500", border: "border-zinc-500/30", label: "Desconhecido" };
        }
    };

    const statusStyle = getStatusColors(currentReport?.status || "PENDING");

    const handleUpdateStatus = async (status: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/reports/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, adminNotes: notes }),
            });

            if (res.ok) {
                const data = await res.json();
                setLocalReport(data.report);
                mutate("/api/admin/reports");
            }
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <Link href="/admin" className="inline-flex items-center text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors group">
                <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                Voltar para Lista
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="gta-card p-8 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 p-4 opacity-5 pointer-events-none`}>
                            <FileText className="w-32 h-32" />
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="bg-zinc-900/50 border border-zinc-700 px-3 py-1 rounded text-xs font-mono text-zinc-400">
                                        ID #{currentReport.id.toString().padStart(4, '0')}
                                    </span>
                                    <span className={`flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${statusStyle.border} bg-opacity-10 ${statusStyle.bg} bg-opacity-10 ${statusStyle.text}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${statusStyle.bg}`}></div>
                                        {statusStyle.label}
                                    </span>
                                </div>
                                <h1 className="text-4xl font-bold text-white uppercase font-display tracking-tight mb-2">
                                    Denúncia <span className="text-zinc-500 mx-2">/</span> {currentReport.accusedId}
                                </h1>
                                <p className="text-zinc-400 font-medium">Motivo: <span className="text-primary">{currentReport.reason}</span></p>
                            </div>

                            <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 backdrop-blur-sm">
                                {currentReport.reporter.avatar ? (
                                    <img src={currentReport.reporter.avatar} className="w-12 h-12 rounded bg-zinc-800 filter grayscale hover:grayscale-0 transition-all" />
                                ) : (
                                    <div className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center">
                                        <User className="w-6 h-6 text-zinc-500" />
                                    </div>
                                )}
                                <div>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Autor</p>
                                    <p className="font-bold text-white text-lg leading-none">{currentReport.reporter.username}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                <ExternalLink className="w-4 h-4" />
                                Evidências Anexadas
                            </h3>
                            <span className="text-xs text-zinc-600 uppercase">Clique para abrir</span>
                        </div>

                        <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 aspect-video flex items-center justify-center group relative shadow-inner shadow-black/50">
                            {currentReport.evidence.includes('youtube') || currentReport.evidence.includes('youtu.be') ? (
                                <div className="text-center p-8">
                                    <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/20 group-hover:scale-110 transition-transform">
                                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[16px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                                    </div>
                                    <p className="text-zinc-400 mb-2 font-medium">Conteúdo do YouTube</p>
                                    <a href={currentReport.evidence} target="_blank" className="text-primary hover:text-white transition-colors break-all text-sm font-mono underline underline-offset-4">
                                        {currentReport.evidence}
                                    </a>
                                </div>
                            ) : (currentReport.evidence.match(/\.(jpeg|jpg|gif|png)$/) != null) ? (
                                <div className="relative w-full h-full group cursor-pointer" onClick={() => window.open(currentReport.evidence, '_blank')}>
                                    <img src={currentReport.evidence} alt="Evidência" className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0 bg-black/50 group-hover:opacity-0 transition-opacity flex items-center justify-center">
                                        <span className="px-4 py-2 bg-black/80 rounded text-xs font-bold uppercase tracking-wider text-white">Visualizar Imagem</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-8">
                                    <p className="text-zinc-400 mb-2 font-medium">Link Externo</p>
                                    <a href={currentReport.evidence} target="_blank" className="text-primary hover:text-white transition-colors break-all text-sm font-mono underline underline-offset-4">
                                        {currentReport.evidence}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-6 bg-zinc-900/30 rounded-xl border border-zinc-800">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <FileText className="w-3 h-3" /> Relato do Autor
                        </h3>
                        <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-light">
                            {currentReport.description || "Nenhuma descrição fornecida pelo autor."}
                        </div>
                    </div>

                    <div className="gta-card p-6 border-zinc-800 bg-zinc-900/80">
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-zinc-800 pb-4">
                            <Shield className="w-4 h-4 text-primary" /> Central de Decisão
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-zinc-500 mb-2 block">Notas da Administração</label>
                                <textarea
                                    className="w-full bg-black/40 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none h-32 placeholder-zinc-700"
                                    placeholder="Justifique sua decisão aqui..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    onClick={() => handleUpdateStatus("APPROVED")}
                                    disabled={actionLoading}
                                    className="col-span-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Check className="w-4 h-4" /> Aprovar
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus("REJECTED")}
                                    disabled={actionLoading}
                                    className="col-span-1 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" /> Rejeitar
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus("INVESTIGATING")}
                                    disabled={actionLoading}
                                    className="col-span-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500 hover:text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <HelpCircle className="w-4 h-4" /> Marcar como Em Análise
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-600 uppercase tracking-widest font-bold">Data do Registro</span>
                            <span className="text-zinc-400 font-mono">{new Date(currentReport.createdAt).toLocaleDateString("pt-BR")} ás {new Date(currentReport.createdAt).toLocaleTimeString("pt-BR")}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
