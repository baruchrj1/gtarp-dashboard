"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import useSWR, { mutate } from "swr";
import Link from "next/link";
import Image from "next/image";
import { Shield, ClipboardList, Eye, UserMinus, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { StatusBadge } from "@/components/ui/StatusBadge";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Report = {
    id: number;
    accusedId: string;
    accusedName?: string;
    accusedFamily?: string | null;
    reason: string;
    status: string;
    createdAt: string;
    handledBy?: string;
    reporter: {
        username: string;
        avatar?: string;
    };
};

export default function MyReportsPage() {
    const { data: session, status: authStatus } = useSession();
    const role = session?.user?.role || "PLAYER";
    const isEvaluator = role === "EVALUATOR";
    const isAdmin = role === "ADMIN" || session?.user?.isAdmin === true;
    const canAccess = isAdmin || isEvaluator;
    const currentUserId = session?.user?.id;

    const { data, isLoading } = useSWR<{ reports: Report[] }>(
        canAccess ? "/api/admin/reports?limit=500" : null,
        fetcher
    );

    const allReports = data?.reports || [];

    // Filter only reports assigned to the current user
    const myClaimedReports = allReports.filter((r) => r.handledBy === currentUserId);
    const activeReports = myClaimedReports.filter((r) => r.status === "INVESTIGATING");
    const resolvedReports = myClaimedReports.filter((r) => r.status === "APPROVED" || r.status === "REJECTED");

    const [releasingId, setReleasingId] = useState<number | null>(null);

    const handleRelease = async (reportId: number) => {
        setReleasingId(reportId);
        try {
            const res = await fetch(`/api/admin/reports/${reportId}/claim`, {
                method: "DELETE",
            });
            if (res.ok) {
                mutate("/api/admin/reports?limit=500");
            } else {
                const data = await res.json();
                alert(data.error || "Erro ao liberar denúncia");
            }
        } catch (error) {
            console.error("Error releasing report:", error);
            alert("Erro ao liberar denúncia");
        } finally {
            setReleasingId(null);
        }
    };

    if (authStatus === "loading") {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!canAccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-24 h-24 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center justify-center mb-6 animate-pulse">
                    <Shield className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold mb-2 font-display uppercase tracking-wide text-white">
                    Acesso Negado
                </h2>
                <p className="text-zinc-500">Apenas staff pode acessar esta área.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1800px] mx-auto pb-12">
            <aside className="w-full lg:w-64 flex-shrink-0">
                <AdminSidebar />
            </aside>

            <main className="flex-1 space-y-8 min-w-0">
                {/* Header */}
                <div className="bg-card p-6 rounded border border-border">
                    <h1 className="text-3xl font-bold text-foreground tracking-widest uppercase font-display flex items-center gap-3">
                        <ClipboardList className="w-8 h-8 text-primary" />
                        Minhas <span className="text-primary">Denúncias</span>
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm font-mono uppercase tracking-wider">
                        Denúncias que você está avaliando
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                            <Clock className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-blue-500">{activeReports.length}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Em Análise</p>
                        </div>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/20 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-emerald-500">
                                {resolvedReports.filter((r) => r.status === "APPROVED").length}
                            </p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Aprovadas por mim</p>
                        </div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-4">
                        <div className="p-3 bg-red-500/20 rounded-lg">
                            <XCircle className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-red-500">
                                {resolvedReports.filter((r) => r.status === "REJECTED").length}
                            </p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Rejeitadas por mim</p>
                        </div>
                    </div>
                </div>

                {/* Reports Table */}
                <div className="bg-card border border-border rounded overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                        <h3 className="text-lg font-bold text-foreground uppercase tracking-wider">
                            Em Análise ({activeReports.length})
                        </h3>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : activeReports.length === 0 ? (
                        <div className="p-12 text-center">
                            <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-2">Você não tem denúncias atribuídas</p>
                            <p className="text-muted-foreground text-sm">
                                Vá em <Link href="/admin/reports" className="text-primary hover:underline">Denúncias</Link> e clique no botão azul para puxar uma denúncia para você.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-muted/50 border-b border-border">
                                        <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">ID</th>
                                        <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Denunciante</th>
                                        <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Motivo</th>
                                        <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Acusado</th>
                                        <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                                        <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {activeReports.map((report) => (
                                        <tr key={report.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="p-4 text-sm font-mono text-muted-foreground">
                                                #{report.id.toString().padStart(4, "0")}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {report.reporter?.avatar ? (
                                                        <Image
                                                            src={report.reporter.avatar}
                                                            alt={report.reporter.username}
                                                            width={24}
                                                            height={24}
                                                            className="rounded"
                                                        />
                                                    ) : (
                                                        <div className="w-6 h-6 rounded bg-secondary" />
                                                    )}
                                                    <span className="text-sm text-foreground">
                                                        {report.reporter?.username || "Anônimo"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-secondary text-secondary-foreground border border-border">
                                                    {report.reason}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm font-bold text-foreground">
                                                    {report.accusedName || report.accusedId}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-muted-foreground font-mono">
                                                        ID: {report.accusedId}
                                                    </span>
                                                    {report.accusedFamily && (
                                                        <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                                                            {report.accusedFamily}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <StatusBadge status={report.status} size="sm" />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleRelease(report.id)}
                                                        disabled={releasingId === report.id}
                                                        title="Liberar denúncia"
                                                        className="inline-flex items-center justify-center w-8 h-8 text-red-500 hover:text-white hover:bg-red-500 rounded transition-all border border-red-500/20 hover:border-red-500 active:scale-95 disabled:opacity-50"
                                                    >
                                                        {releasingId === report.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <UserMinus className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                    <Link
                                                        href={`/admin/reports/${report.id}`}
                                                        className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-foreground hover:bg-primary px-3 py-1.5 rounded transition-all uppercase tracking-wide border border-primary/20 hover:border-primary active:scale-95"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                        Avaliar
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
