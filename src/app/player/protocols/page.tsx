"use client";

import { useSession } from "next-auth/react";
import { ShieldAlert, ClipboardList, Search } from "lucide-react";
import PlayerSidebar from "@/components/player/PlayerSidebar";
import useSWR from "swr";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PlayerProtocolsPage() {
    const { data: session, status } = useSession();
    const [searchQuery, setSearchQuery] = useState("");

    const isAuthenticated = status === "authenticated";
    const isLoadingAuth = status === "loading";

    // Fetch reports (protocols are report IDs)
    const { data: reportsData, isLoading: isLoadingReports } = useSWR(
        isAuthenticated ? "/api/reports" : null,
        fetcher
    );

    const allReports = reportsData?.reports || [];
    const myReports = allReports.filter((r: any) => r.reporterId === session?.user?.id);

    // Filter by search query
    const filteredReports = myReports.filter((report: any) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            String(report.id).includes(query) ||
            (report.accusedName && report.accusedName.toLowerCase().includes(query))
        );
    });

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
                <h2 className="text-3xl font-bold mb-2 font-display uppercase tracking-wide text-foreground">
                    Acesso Negado
                </h2>
                <p className="text-muted-foreground">Você precisa estar autenticado para acessar esta área.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1800px] mx-auto pb-12">
            <aside className="w-full lg:w-64 flex-shrink-0">
                <PlayerSidebar />
            </aside>

            <main className="flex-1 space-y-8 min-w-0">
                <div className="bg-card p-6 rounded border border-border">
                    <h1 className="text-3xl font-bold text-foreground tracking-widest uppercase font-display">
                        <span className="text-primary">Protocolos</span>
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm font-mono uppercase tracking-wider">
                        Acompanhe seus protocolos de denúncia
                    </p>
                </div>

                {/* Search */}
                <div className="bg-card border border-border rounded p-4">
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        <Search className="w-4 h-4 inline mr-2" />
                        Buscar Protocolo
                    </label>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Digite o ID do protocolo ou nome do acusado..."
                        className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
                    />
                </div>

                {/* Protocols List */}
                <div className="space-y-4">
                    {isLoadingReports ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="bg-card border border-border rounded p-12 text-center">
                            <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                {searchQuery ? "Nenhum protocolo encontrado." : "Você ainda não possui protocolos."}
                            </p>
                        </div>
                    ) : (
                        filteredReports.map((report: any) => (
                            <div
                                key={report.id}
                                className="bg-card border border-border rounded p-6 hover:border-primary/20 transition-colors"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div>
                                        <h3 className="text-foreground font-bold text-lg mb-1">
                                            Protocolo #{String(report.id).padStart(4, '0')}
                                        </h3>
                                        <p className="text-muted-foreground text-sm">
                                            Criado em {new Date(report.createdAt).toLocaleDateString("pt-BR", {
                                                day: "2-digit",
                                                month: "long",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        {report.status === "PENDING" && (
                                            <span className="inline-flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 rounded px-4 py-2 text-sm font-bold text-yellow-400">
                                                ⏳ Aguardando Análise
                                            </span>
                                        )}
                                        {report.status === "INVESTIGATING" && (
                                            <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 rounded px-4 py-2 text-sm font-bold text-blue-400">
                                                🔍 Em Investigação
                                            </span>
                                        )}
                                        {report.status === "APPROVED" && (
                                            <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded px-4 py-2 text-sm font-bold text-emerald-400">
                                                ✅ Aprovada
                                            </span>
                                        )}
                                        {report.status === "REJECTED" && (
                                            <span className="inline-flex items-center gap-1 bg-red-500/10 border border-red-500/20 rounded px-4 py-2 text-sm font-bold text-red-400">
                                                ❌ Rejeitada
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="gta-card p-4">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                            Denunciado
                                        </p>
                                        <p className="text-foreground font-medium">{report.accusedName}</p>
                                        <p className="text-muted-foreground text-xs mt-1">ID: {report.accusedId}</p>
                                    </div>

                                    <div className="gta-card p-4">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                            Avaliador
                                        </p>
                                        <p className="text-foreground font-medium">
                                            {report.evaluatorId ? "Atribuído" : "Aguardando atribuição"}
                                        </p>
                                    </div>
                                </div>

                                <div className="gta-card p-4">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                        Descrição da Denúncia
                                    </p>
                                    <p className="text-foreground text-sm">{report.description}</p>
                                </div>

                                {report.evidence && (
                                    <div className="mt-4 gta-card p-4">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                            Evidência
                                        </p>
                                        <a
                                            href={report.evidence}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:text-primary/80 text-sm underline"
                                        >
                                            {report.evidence}
                                        </a>
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
