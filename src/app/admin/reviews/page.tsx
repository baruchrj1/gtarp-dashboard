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
        canAccess ? "/api/admin/reports?limit=500" : null,
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
                <ShieldCheck className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold text-foreground uppercase tracking-widest">Acesso Negado</h2>
                <p className="text-muted-foreground mt-2">Apenas staff pode acessar esta página.</p>
                <Link href="/" className="mt-6 bg-primary text-primary-foreground px-6 py-3 rounded font-bold uppercase tracking-wider">Voltar ao Início</Link>
            </div>
        );
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "APPROVED": return { borderColor: "border-l-emerald-500" };
            case "REJECTED": return { borderColor: "border-l-red-500" };
            default: return { borderColor: "border-l-muted-foreground" };
        }
    };

    const ReportCard = ({ report }: { report: Report }) => {
        const style = getStatusStyle(report.status);
        return (
            <Link
                href={`/admin/reports/${report.id}`}
                className={`block bg-card border border-border ${style.borderColor} border-l-[3px] rounded-r p-2 hover:bg-muted/50 transition-all group`}
            >
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-muted-foreground">#{report.id.toString().padStart(4, '0')}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(report.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
                <h3 className="text-foreground font-bold text-xs group-hover:text-primary transition-colors truncate">
                    {report.accusedName || report.accusedId}
                </h3>
                <p className="text-muted-foreground text-[10px] truncate">{report.reason} • {report.reporter?.username || "Anônimo"}</p>
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
                <div className="bg-card p-6 rounded border border-border">
                    <h1 className="text-3xl font-bold text-foreground tracking-widest uppercase font-display flex items-center gap-3">
                        <History className="w-8 h-8 text-primary" />
                        Histórico de <span className="text-primary">Avaliação</span>
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm font-mono uppercase tracking-wider">
                        Todas as denúncias que já foram resolvidas
                    </p>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-secondary border border-border rounded-lg p-4 flex items-center gap-4">
                        <div className="p-3 bg-muted rounded-lg">
                            <FileText className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-foreground">{resolvedReports.length}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Resolvidas</p>
                        </div>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/20 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-emerald-500">{approvedReports.length}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Aprovadas</p>
                        </div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-4">
                        <div className="p-3 bg-red-500/20 rounded-lg">
                            <XCircle className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-red-500">{rejectedReports.length}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Rejeitadas</p>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid place-items-center h-64 border border-border rounded bg-muted/50">
                        <div className="animate-spin rounded h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : resolvedReports.length === 0 ? (
                    <div className="bg-card border border-border rounded-lg p-12 text-center">
                        <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-foreground mb-2">Nenhuma Denúncia Resolvida</h3>
                        <p className="text-muted-foreground">Quando denúncias forem aprovadas ou rejeitadas, elas aparecerão aqui.</p>
                    </div>
                ) : (
                    <>
                        {/* Approved Reports Section */}
                        {approvedReports.length > 0 && (
                            <section>
                                <h2 className="text-lg font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-emerald-500/20 pb-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                    Aprovadas ({approvedReports.length})
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                    {approvedReports.map((report) => (
                                        <ReportCard key={report.id} report={report} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Rejected Reports Section */}
                        {rejectedReports.length > 0 && (
                            <section>
                                <h2 className="text-lg font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-red-500/20 pb-3">
                                    <XCircle className="w-5 h-5 text-red-500" />
                                    Rejeitadas ({rejectedReports.length})
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
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
