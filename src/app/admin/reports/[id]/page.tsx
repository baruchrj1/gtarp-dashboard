"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define Report Type specifically for this page
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

export default function ReportDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { data: session } = useSession();
    const router = useRouter();

    // Unwrap params using React.use()
    const { id } = use(params);

    const [report, setReport] = useState<ReportDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (session) {
            fetchReport();
        }
    }, [session, id]);

    const fetchReport = async () => {
        try {
            const res = await fetch(`/api/admin/reports/${id}`);
            if (res.ok) {
                const data = await res.json();
                setReport(data.report);
                if (data.report.adminNotes) {
                    setNotes(data.report.adminNotes);
                }
            } else {
                router.push("/admin"); // Redirect if not found
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

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
                setReport(data.report);
                // Optional: Show success toast
            }
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setActionLoading(false);
        }
    };

    // @ts-ignore
    if (!session?.user?.isAdmin) {
        return <div className="p-8 text-center text-red-400">Restricted Access</div>;
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!report) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
            case "APPROVED": return "text-green-500 bg-green-500/10 border-green-500/20";
            case "REJECTED": return "text-red-500 bg-red-500/10 border-red-500/20";
            case "INVESTIGATING": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
            default: return "text-zinc-500 bg-zinc-500/10";
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <Link href="/admin" className="text-zinc-400 hover:text-white mb-6 inline-flex items-center gap-2 transition-colors">
                ← Voltar para o Painel
            </Link>

            <div className="glass-card p-6 md:p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-8 border-b border-white/5">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-zinc-500 font-mono text-sm">#{report.id}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(report.status)}`}>
                                {report.status}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Denúncia contra {report.accusedId}</h1>
                        <p className="text-zinc-400">Motivo: <span className="text-zinc-200">{report.reason}</span></p>
                    </div>

                    <div className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-lg border border-white/5">
                        {report.reporter.avatar ? (
                            <img src={report.reporter.avatar} className="w-10 h-10 rounded-full" />
                        ) : (
                            <div className="w-10 h-10 bg-zinc-800 rounded-full" />
                        )}
                        <div className="text-sm">
                            <p className="text-zinc-400 text-xs">Reportado por</p>
                            <p className="font-medium text-white">{report.reporter.username}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Evidence Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">Evidências</h3>
                            <div className="bg-black/40 rounded-xl overflow-hidden border border-white/5 aspect-video flex items-center justify-center group relative">
                                {report.evidence.includes('youtube') || report.evidence.includes('youtu.be') ? (
                                    <div className="text-center p-8">
                                        <p className="text-zinc-400 mb-2">Vídeo do YouTube Detectado</p>
                                        <a href={report.evidence} target="_blank" className="text-primary hover:underline break-all">
                                            {report.evidence}
                                        </a>
                                    </div>
                                ) : (report.evidence.match(/\.(jpeg|jpg|gif|png)$/) != null) ? (
                                    <img src={report.evidence} alt="Evidência" className="w-full h-full object-contain" />
                                ) : (
                                    <div className="text-center p-8">
                                        <p className="text-zinc-400 mb-2">Link Externo</p>
                                        <a href={report.evidence} target="_blank" className="text-primary hover:underline break-all">
                                            {report.evidence}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">Descrição do Ocorrido</h3>
                            <div className="bg-zinc-900/30 p-4 rounded-xl border border-white/5 min-h-[100px] text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                {report.description || "Nenhuma descrição fornecida."}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-6">
                        <div className="bg-zinc-900/50 p-5 rounded-xl border border-white/5">
                            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Ações Administrativas</h3>

                            <div className="space-y-3">
                                <label className="text-xs text-zinc-500">Notas Internas (Opcional)</label>
                                <textarea
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-zinc-200 focus:outline-none focus:border-primary/50 transition-all resize-none h-32"
                                    placeholder="Justificativa da decisão..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <button
                                    onClick={() => handleUpdateStatus("APPROVED")}
                                    disabled={actionLoading}
                                    className="col-span-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                                >
                                    Aprovar
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus("REJECTED")}
                                    disabled={actionLoading}
                                    className="col-span-1 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                                >
                                    Rejeitar
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus("INVESTIGATING")}
                                    disabled={actionLoading}
                                    className="col-span-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                                >
                                    Marcar como Em Análise
                                </button>
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 p-5 rounded-xl border border-white/5">
                            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Metadados</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Criado em:</span>
                                    <span className="text-zinc-300">{new Date(report.createdAt).toLocaleDateString("pt-BR")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">ID do Report:</span>
                                    <span className="text-zinc-300">{report.id}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
