"use client";

import { useSession } from "next-auth/react";
import { ShieldAlert, CheckCircle2, XCircle, Clock, FileText, History } from "lucide-react";
import PlayerSidebar from "@/components/player/PlayerSidebar";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Report = {
    id: number;
    accusedId: string;
    accusedName?: string;
    reason: string;
    status: string;
    createdAt: string;
};

export default function PlayerResolutionsPage() {
    const { data: session, status } = useSession();

    const isAuthenticated = status === "authenticated";
    const isLoadingAuth = status === "loading";

    const { data: reportsData, isLoading: isLoadingReports } = useSWR(
        isAuthenticated ? "/api/reports" : null,
        fetcher
    );

    const allReports = reportsData?.reports || [];
    const myReports = allReports.filter((r: any) => r.reporterId === session?.user?.id);
    const resolvedReports = myReports.filter((r: any) => r.status === "APPROVED" || r.status === "REJECTED");
    const approvedReports = resolvedReports.filter((r: any) => r.status === "APPROVED");
    const rejectedReports = resolvedReports.filter((r: any) => r.status === "REJECTED");
    const pendingReports = myReports.filter((r: any) => r.status === "PENDING" || r.status === "INVESTIGATING");

    if (isLoadingAuth) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-24 h-24 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center justify-center mb-6 animate-pulse">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold mb-2 font-display uppercase tracking-wide text-white">
                    Acesso Negado
                </h2>
                <p className="text-zinc-500">Você precisa estar autenticado para acessar esta área.</p>
            </div>
        );
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "APPROVED": return { borderColor: "border-l-emerald-500" };
            case "REJECTED": return { borderColor: "border-l-red-500" };
            default: return { borderColor: "border-l-zinc-500" };
        }
    };

    const ReportCard = ({ report }: { report: Report }) => {
        const style = getStatusStyle(report.status);
        return (
            <div className={`bg-black/40 border border-white/5 ${style.borderColor} border-l-[3px] rounded-r p-2 transition-all`}>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-zinc-500">#{String(report.id).padStart(4, '0')}</span>
                    <span className="text-[10px] text-zinc-500">{new Date(report.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
                <h3 className="text-white font-bold text-xs truncate">
                    {report.accusedName || report.accusedId}
                </h3>
                <p className="text-zinc-500 text-[10px] truncate">{report.reason}</p>
            </div>
        );
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1800px] mx-auto pb-12">
            <aside className="w-full lg:w-64 flex-shrink-0">
                <PlayerSidebar />
            </aside>

            <main className="flex-1 space-y-8 min-w-0">
                {/* Header */}
                <div className="bg-black/40 p-6 rounded border border-white/5">
                    <h1 className="text-3xl font-bold text-white tracking-widest uppercase font-display flex items-center gap-3">
                        <History className="w-8 h-8 text-primary" />
                        Histórico de <span className="text-primary">Denúncias</span>
                    </h1>
                    <p className="text-zinc-400 mt-1 text-sm font-mono uppercase tracking-wider">
                        Todas as suas denúncias e seus status
                    </p>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-zinc-500/10 border border-zinc-500/20 rounded-lg p-4 flex items-center gap-4">
                        <div className="p-3 bg-zinc-500/20 rounded-lg">
                            <FileText className="w-6 h-6 text-zinc-400" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">{myReports.length}</p>
                            <p className="text-xs text-zinc-400 uppercase tracking-wider">Total de Denúncias</p>
                        </div>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/20 rounded-lg">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
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

                {isLoadingReports ? (
                    <div className="grid place-items-center h-64 border border-zinc-800 rounded bg-black/20">
                        <div className="animate-spin rounded h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : myReports.length === 0 ? (
                    <div className="bg-black/40 border border-white/5 rounded-lg p-12 text-center">
                        <History className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Nenhuma Denúncia</h3>
                        <p className="text-zinc-400">Você ainda não fez nenhuma denúncia.</p>
                    </div>
                ) : (
                    <>
                        {/* Approved Reports Section */}
                        {approvedReports.length > 0 && (
                            <section>
                                <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-emerald-500/20 pb-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    Aprovadas ({approvedReports.length})
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                    {approvedReports.map((report: Report) => (
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
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                    {rejectedReports.map((report: Report) => (
                                        <ReportCard key={report.id} report={report} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Pending Reports Section */}
                        {pendingReports.length > 0 && (
                            <section>
                                <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-yellow-500/20 pb-3">
                                    <Clock className="w-5 h-5 text-yellow-500" />
                                    Pendentes ({pendingReports.length})
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                    {pendingReports.map((report: Report) => (
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
