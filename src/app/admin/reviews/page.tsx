"use client";

import useSWR from "swr";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ShieldCheck, FileText, CheckCircle, XCircle, ChevronRight, History } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Report = {
    id: number;
    accusedId: string;
    accusedName?: string;
    reason: string;
    status: string;
    createdAt: string;
    reporter: {
        username: string;
        avatar: string | null;
    };
};

export default function ReviewsHistoryPage() {
    const { data: session, status: authStatus } = useSession();
    const role = session?.user?.role || "PLAYER";
    const isEvaluator = role === "EVALUATOR";
    const isAdmin = role === "ADMIN" || session?.user?.isAdmin === true;
    const canAccess = isAdmin || isEvaluator;

    const { data, isLoading } = useSWR<{ reports: Report[] }>(
        canAccess ? "/api/admin/reports" : null,
        fetcher
    );

    const allReports = data?.reports || [];

    // Filter only resolved reports (APPROVED or REJECTED)
    const resolvedReports = allReports.filter((r) => r.status === "APPROVED" || r.status === "REJECTED");
    const approvedReports = resolvedReports.filter((r) => r.status === "APPROVED");
    const rejectedReports = resolvedReports.filter((r) => r.status === "REJECTED");

    if (authStatus === "loading") {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!canAccess) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                <ShieldCheck className="w-16 h-16 text-zinc-700 mb-4" />
                <h2 className="text-xl font-bold text-white uppercase tracking-widest">Acesso Negado</h2>
                <p className="text-zinc-500 mt-2">Apenas staff pode acessar esta página.</p>
                <Link href="/" className="mt-6 bg-primary text-black px-6 py-3 rounded font-bold uppercase tracking-wider">Voltar ao Início</Link>
            </div>
        );
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "APPROVED": return { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: <CheckCircle className="w-4 h-4" />, label: "Aprovada" };
            case "REJECTED": return { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", icon: <XCircle className="w-4 h-4" />, label: "Rejeitada" };
            default: return { color: "text-zinc-500", bg: "bg-zinc-500/10", border: "border-zinc-500/20", icon: <FileText className="w-4 h-4" />, label: status };
        }
    };

    const ReportCard = ({ report }: { report: Report }) => {
        const style = getStatusStyle(report.status);
        return (
            <Link
                href={`/admin/reports/${report.id}`}
                className="block bg-black/40 border border-white/5 rounded-lg p-4 hover:bg-white/5 hover:border-primary/30 transition-all group"
            >
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-zinc-500">#{report.id.toString().padStart(4, '0')}</span>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold uppercase ${style.color} ${style.bg} ${style.border} border`}>
                        {style.icon}
                        {style.label}
                    </span>
                </div>
                <h3 className="text-white font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                    {report.accusedName || report.accusedId}
                </h3>
                <p className="text-zinc-400 text-sm mb-3">{report.reason}</p>
                <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Por: {report.reporter?.username || "Anônimo"}</span>
                    <span>{new Date(report.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="mt-3 flex items-center justify-end text-xs text-primary font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver Detalhes <ChevronRight className="w-4 h-4 ml-1" />
                </div>
            </Link>
        );
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1800px] mx-auto pb-12">
            <aside className="w-full lg:w-64 flex-shrink-0">
                <AdminSidebar />
            </aside>

            <main className="flex-1 space-y-8 min-w-0">
                {/* Header */}
                <div className="bg-black/40 p-6 rounded border border-white/5">
                    <h1 className="text-3xl font-bold text-white tracking-widest uppercase font-display flex items-center gap-3">
                        <History className="w-8 h-8 text-primary" />
                        Histórico de <span className="text-primary">Avaliação</span>
                    </h1>
                    <p className="text-zinc-400 mt-1 text-sm font-mono uppercase tracking-wider">
                        Todas as denúncias que já foram resolvidas
                    </p>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-zinc-500/10 border border-zinc-500/20 rounded-lg p-4 flex items-center gap-4">
                        <div className="p-3 bg-zinc-500/20 rounded-lg">
                            <FileText className="w-6 h-6 text-zinc-400" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">{resolvedReports.length}</p>
                            <p className="text-xs text-zinc-400 uppercase tracking-wider">Total Resolvidas</p>
                        </div>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/20 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-emerald-500">{approvedReports.length}</p>
                            <p className="text-xs text-zinc-400 uppercase tracking-wider">Aprovadas</p>
                        </div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-4">
                        <div className="p-3 bg-red-500/20 rounded-lg">
                            <XCircle className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-red-500">{rejectedReports.length}</p>
                            <p className="text-xs text-zinc-400 uppercase tracking-wider">Rejeitadas</p>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid place-items-center h-64 border border-zinc-800 rounded bg-black/20">
                        <div className="animate-spin rounded h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : resolvedReports.length === 0 ? (
                    <div className="bg-black/40 border border-white/5 rounded-lg p-12 text-center">
                        <History className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Nenhuma Denúncia Resolvida</h3>
                        <p className="text-zinc-400">Quando denúncias forem aprovadas ou rejeitadas, elas aparecerão aqui.</p>
                    </div>
                ) : (
                    <>
                        {/* Approved Reports Section */}
                        {approvedReports.length > 0 && (
                            <section>
                                <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-emerald-500/20 pb-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                    Aprovadas ({approvedReports.length})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {approvedReports.map((report) => (
                                        <ReportCard key={report.id} report={report} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Rejected Reports Section */}
                        {rejectedReports.length > 0 && (
                            <section>
                                <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-red-500/20 pb-3">
                                    <XCircle className="w-5 h-5 text-red-500" />
                                    Rejeitadas ({rejectedReports.length})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {rejectedReports.map((report) => (
                                        <ReportCard key={report.id} report={report} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
