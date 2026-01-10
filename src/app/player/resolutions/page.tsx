"use client";

import { useSession } from "next-auth/react";
import { ShieldAlert, CheckCircle2, XCircle, Clock } from "lucide-react";
import PlayerSidebar from "@/components/player/PlayerSidebar";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PlayerResolutionsPage() {
    const { data: session, status } = useSession();

    const isAuthenticated = status === "authenticated";
    const isLoadingAuth = status === "loading";

    // Fetch reports
    const { data: reportsData, isLoading: isLoadingReports } = useSWR(
        isAuthenticated ? "/api/reports" : null,
        fetcher
    );

    const allReports = reportsData?.reports || [];
    const myReports = allReports.filter((r: any) => r.reporterId === session?.user?.id);
    const resolvedReports = myReports.filter((r: any) => r.status === "APPROVED" || r.status === "REJECTED");

    // Show loading state
    if (isLoadingAuth) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Check authentication
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

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1800px] mx-auto pb-12">
            <aside className="w-full lg:w-64 flex-shrink-0">
                <PlayerSidebar />
            </aside>

            <main className="flex-1 space-y-8 min-w-0">
                <div className="bg-black/40 p-6 rounded border border-white/5">
                    <h1 className="text-3xl font-bold text-white tracking-widest uppercase font-display">
                        <span className="text-primary">Resoluções</span>
                    </h1>
                    <p className="text-zinc-400 mt-1 text-sm font-mono uppercase tracking-wider">
                        Veja as resoluções das suas denúncias
                    </p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-black/40 border border-white/5 rounded p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">
                                    {myReports.filter((r: any) => r.status === "APPROVED").length}
                                </p>
                                <p className="text-xs text-zinc-400 uppercase tracking-wider">Aprovadas</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black/40 border border-white/5 rounded p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">
                                    {myReports.filter((r: any) => r.status === "REJECTED").length}
                                </p>
                                <p className="text-xs text-zinc-400 uppercase tracking-wider">Rejeitadas</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black/40 border border-white/5 rounded p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">
                                    {myReports.filter((r: any) => r.status === "PENDING" || r.status === "INVESTIGATING").length}
                                </p>
                                <p className="text-xs text-zinc-400 uppercase tracking-wider">Pendentes</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resolutions List */}
                <div className="space-y-4">
                    {isLoadingReports ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : resolvedReports.length === 0 ? (
                        <div className="bg-black/40 border border-white/5 rounded p-12 text-center">
                            <CheckCircle2 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                            <p className="text-zinc-400">Nenhuma denúncia foi resolvida ainda.</p>
                        </div>
                    ) : (
                        resolvedReports.map((report: any) => (
                            <div
                                key={report.id}
                                className={`bg-black/40 border rounded p-6 ${report.status === "APPROVED"
                                        ? "border-emerald-500/20 hover:border-emerald-500/40"
                                        : "border-red-500/20 hover:border-red-500/40"
                                    } transition-colors`}
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {report.status === "APPROVED" ? (
                                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                            ) : (
                                                <XCircle className="w-6 h-6 text-red-500" />
                                            )}
                                            <h3 className="text-white font-bold text-lg">
                                                Denúncia {report.status === "APPROVED" ? "Aprovada" : "Rejeitada"}
                                            </h3>
                                        </div>
                                        <p className="text-zinc-500 text-sm">
                                            Protocolo: #{report.id.slice(0, 12).toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-zinc-400 text-sm">
                                            Resolvido em
                                        </p>
                                        <p className="text-white font-medium">
                                            {new Date(report.updatedAt).toLocaleDateString("pt-BR", {
                                                day: "2-digit",
                                                month: "long",
                                                year: "numeric"
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="bg-zinc-900/50 border border-zinc-800 rounded p-4">
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                            Denunciado
                                        </p>
                                        <p className="text-white font-medium">{report.accusedName}</p>
                                        <p className="text-zinc-500 text-xs mt-1">ID: {report.accusedId}</p>
                                    </div>

                                    <div className="bg-zinc-900/50 border border-zinc-800 rounded p-4">
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                            Data da Denúncia
                                        </p>
                                        <p className="text-white font-medium">
                                            {new Date(report.createdAt).toLocaleDateString("pt-BR")}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-zinc-900/50 border border-zinc-800 rounded p-4 mb-4">
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                        Sua Denúncia
                                    </p>
                                    <p className="text-zinc-300 text-sm">{report.description}</p>
                                </div>

                                {report.status === "APPROVED" && (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-4">
                                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                                            ✅ Resultado
                                        </p>
                                        <p className="text-emerald-300 text-sm">
                                            Sua denúncia foi aprovada e as medidas cabíveis foram tomadas pela administração.
                                            Agradecemos por contribuir para manter a comunidade segura.
                                        </p>
                                    </div>
                                )}

                                {report.status === "REJECTED" && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded p-4">
                                        <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
                                            ❌ Resultado
                                        </p>
                                        <p className="text-red-300 text-sm">
                                            Após análise, sua denúncia foi rejeitada. Isso pode ocorrer por falta de evidências
                                            ou por não se enquadrar nas regras do servidor. Se tiver dúvidas, entre em contato
                                            com a administração.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
