"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Archive, Calendar, FileText, Gavel, ChevronRight, CheckCircle, XCircle, AlertTriangle, Clock, Search } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ArchiveViewerPage() {
    const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);

    // Check for period ID in URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
        if (id) setSelectedPeriod(id);
    }, []);

    // Fetch all periods
    const { data: periodsData, isLoading: isLoadingPeriods } = useSWR("/api/archive", fetcher);

    // Fetch selected period details
    const { data: periodDetail, isLoading: isLoadingDetail } = useSWR(
        selectedPeriod ? `/api/archive?id=${selectedPeriod}` : null,
        fetcher
    );

    const periods = periodsData?.periods || [];
    const detail = periodDetail?.period;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card border-b border-border">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Archive className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground tracking-wide">
                                Arquivo de Denúncias
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1">
                                Histórico de denúncias e punições arquivadas
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Periods Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-card border border-border rounded-lg p-6 sticky top-6">
                            <h2 className="font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-primary" />
                                Períodos
                            </h2>

                            {isLoadingPeriods ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : periods.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Archive className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">Nenhum período arquivado</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {periods.map((period: any) => (
                                        <button
                                            key={period.id}
                                            onClick={() => setSelectedPeriod(period.id)}
                                            className={`w-full text-left p-3 rounded-lg border transition-all ${selectedPeriod === period.id
                                                    ? "bg-primary/10 border-primary"
                                                    : "bg-secondary border-border hover:border-primary/50"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="font-bold text-foreground text-sm">{period.name}</p>
                                                <ChevronRight className={`w-4 h-4 transition-transform ${selectedPeriod === period.id ? "rotate-90 text-primary" : "text-muted-foreground"
                                                    }`} />
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {period.totalReports} denúncias
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {!selectedPeriod ? (
                            <div className="bg-card border border-border rounded-lg p-12 text-center">
                                <Archive className="w-20 h-20 mx-auto mb-6 text-muted-foreground/30" />
                                <h3 className="text-xl font-bold text-foreground mb-2">
                                    Selecione um Período
                                </h3>
                                <p className="text-muted-foreground">
                                    Escolha um período na lista para visualizar as denúncias arquivadas
                                </p>
                            </div>
                        ) : isLoadingDetail ? (
                            <div className="bg-card border border-border rounded-lg p-12 flex justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            </div>
                        ) : detail ? (
                            <div className="space-y-6">
                                {/* Period Header */}
                                <div className="bg-card border border-border rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-foreground">{detail.name}</h2>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Período: {new Date(detail.startDate).toLocaleDateString("pt-BR")} - {new Date(detail.endDate).toLocaleDateString("pt-BR")}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Arquivado em</p>
                                            <p className="text-sm font-medium text-foreground">
                                                {new Date(detail.createdAt).toLocaleDateString("pt-BR")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-secondary p-4 rounded-lg text-center">
                                            <p className="text-2xl font-bold text-foreground">{detail.totalReports}</p>
                                            <p className="text-xs text-muted-foreground uppercase">Total</p>
                                        </div>
                                        <div className="bg-emerald-500/10 p-4 rounded-lg text-center border border-emerald-500/20">
                                            <p className="text-2xl font-bold text-emerald-500">{detail.approvedReports}</p>
                                            <p className="text-xs text-muted-foreground uppercase">Aprovadas</p>
                                        </div>
                                        <div className="bg-red-500/10 p-4 rounded-lg text-center border border-red-500/20">
                                            <p className="text-2xl font-bold text-red-500">{detail.rejectedReports}</p>
                                            <p className="text-xs text-muted-foreground uppercase">Rejeitadas</p>
                                        </div>
                                        <div className="bg-orange-500/10 p-4 rounded-lg text-center border border-orange-500/20">
                                            <p className="text-2xl font-bold text-orange-500">{detail.totalPunishments}</p>
                                            <p className="text-xs text-muted-foreground uppercase">Punições</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Reports */}
                                <div className="bg-card border border-border rounded-lg">
                                    <div className="p-4 border-b border-border">
                                        <h3 className="font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-primary" />
                                            Denúncias ({detail.archivedReports?.length || 0})
                                        </h3>
                                    </div>

                                    {detail.archivedReports?.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground">
                                            Nenhuma denúncia neste período
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-border">
                                            {detail.archivedReports?.map((report: any) => (
                                                <div key={report.id} className="p-4 hover:bg-muted/50 transition-colors">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 flex-wrap">
                                                                <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                                                                    #{report.originalId}
                                                                </span>
                                                                <span className="font-bold text-foreground">
                                                                    {report.accusedName || report.accusedId}
                                                                </span>
                                                                {report.accusedFamily && (
                                                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                                        {report.accusedFamily}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mt-2">
                                                                <strong>Motivo:</strong> {report.reason}
                                                            </p>
                                                            {report.description && (
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    {report.description}
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-muted-foreground mt-2">
                                                                <Clock className="w-3 h-3 inline mr-1" />
                                                                {new Date(report.originalCreatedAt).toLocaleDateString("pt-BR", { dateStyle: "long" })}
                                                            </p>
                                                        </div>
                                                        <span className={`text-xs font-bold px-3 py-1 rounded flex items-center gap-1 shrink-0 ${report.status === "APPROVED"
                                                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                                                : "bg-red-500/10 text-red-500 border border-red-500/20"
                                                            }`}>
                                                            {report.status === "APPROVED" ? (
                                                                <><CheckCircle className="w-3 h-3" /> Aprovada</>
                                                            ) : (
                                                                <><XCircle className="w-3 h-3" /> Rejeitada</>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Punishments */}
                                {detail.archivedPunishments?.length > 0 && (
                                    <div className="bg-card border border-border rounded-lg">
                                        <div className="p-4 border-b border-border">
                                            <h3 className="font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                                                <Gavel className="w-4 h-4 text-primary" />
                                                Punições ({detail.archivedPunishments?.length || 0})
                                            </h3>
                                        </div>

                                        <div className="divide-y divide-border">
                                            {detail.archivedPunishments?.map((punishment: any) => (
                                                <div key={punishment.id} className="p-4 hover:bg-muted/50 transition-colors">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <p className="font-bold text-foreground">
                                                                {punishment.userName || punishment.userId}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {punishment.reason}
                                                            </p>
                                                            {punishment.organization && (
                                                                <p className="text-xs text-primary mt-1">
                                                                    Organização: {punishment.organization}
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-muted-foreground mt-2">
                                                                <Clock className="w-3 h-3 inline mr-1" />
                                                                {new Date(punishment.originalCreatedAt).toLocaleDateString("pt-BR")}
                                                            </p>
                                                        </div>
                                                        <span className={`text-xs font-bold px-3 py-1 rounded shrink-0 ${punishment.type === "WARNING" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" :
                                                                punishment.type === "KICK" ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" :
                                                                    "bg-red-500/10 text-red-500 border border-red-500/20"
                                                            }`}>
                                                            {punishment.type === "WARNING" ? "Advertência" :
                                                                punishment.type === "KICK" ? "Kick" :
                                                                    punishment.type === "TEMP_BAN" ? "Ban Temp." : "Ban Perm."}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-card border-t border-border mt-12">
                <div className="max-w-7xl mx-auto px-6 py-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        GTA RP Dashboard - Sistema de Denúncias
                    </p>
                </div>
            </div>
        </div>
    );
}
