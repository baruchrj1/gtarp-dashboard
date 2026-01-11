"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useSWR, { mutate } from "swr";
import { ShieldAlert, Archive, Calendar, FileText, Gavel, ChevronRight, Trash2, CheckCircle, XCircle, Clock, Eye, ArchiveIcon } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Modal from "@/components/ui/Modal";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HistoryPage() {
    const { data: session, status } = useSession();
    const [selectedTab, setSelectedTab] = useState<"resolved" | "archived">("resolved");
    const [archiveModalOpen, setArchiveModalOpen] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Month/Year selection for archiving
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

    const isAuthenticated = status === "authenticated";
    const isLoadingAuth = status === "loading";
    const role = session?.user?.role || "PLAYER";
    const isAdmin = role === "ADMIN" || session?.user?.isAdmin === true;
    const isEvaluator = role === "EVALUATOR";
    const hasAccess = isAdmin || isEvaluator;

    // Fetch resolved reports (APPROVED or REJECTED)
    const { data: reportsData, isLoading: isLoadingReports } = useSWR(
        isAuthenticated && hasAccess ? "/api/reports" : null,
        fetcher
    );

    // Fetch archive periods
    const { data: periodsData, isLoading: isLoadingPeriods } = useSWR(
        isAuthenticated && hasAccess ? "/api/admin/archive/periods" : null,
        fetcher
    );

    // Fetch selected period details
    const { data: periodDetail, isLoading: isLoadingDetail } = useSWR(
        selectedPeriod ? `/api/admin/archive/${selectedPeriod}` : null,
        fetcher
    );

    const allReports = reportsData?.reports || [];
    const resolvedReports = allReports.filter((r: any) => r.status === "APPROVED" || r.status === "REJECTED");
    const periods = periodsData?.periods || [];
    const detail = periodDetail?.period;

    // Filter reports by selected month/year
    const reportsForSelectedMonth = resolvedReports.filter((r: any) => {
        const reportDate = new Date(r.createdAt);
        return reportDate.getMonth() === selectedMonth && reportDate.getFullYear() === selectedYear;
    });

    // Statistics
    const approvedCount = resolvedReports.filter((r: any) => r.status === "APPROVED").length;
    const rejectedCount = resolvedReports.filter((r: any) => r.status === "REJECTED").length;

    // Month names in Portuguese
    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // Generate period name automatically
    const periodName = `${monthNames[selectedMonth]} ${selectedYear}`;

    const handleArchive = async () => {
        if (reportsForSelectedMonth.length === 0) {
            alert(`Não há denúncias resolvidas em ${periodName} para arquivar`);
            return;
        }

        setIsArchiving(true);
        try {
            const response = await fetch("/api/admin/archive/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    periodName,
                    month: selectedMonth,
                    year: selectedYear
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Erro ao arquivar");
                return;
            }

            alert(`Arquivado com sucesso! ${data.archivedReports} denúncias de ${periodName} movidas para o arquivo.`);
            setArchiveModalOpen(false);
            mutate("/api/reports");
            mutate("/api/admin/archive/periods");
        } catch (error) {
            console.error(error);
            alert("Erro ao arquivar");
        } finally {
            setIsArchiving(false);
        }
    };


    const handleDelete = async (periodId: string) => {
        try {
            const response = await fetch(`/api/admin/archive/${periodId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                alert("Erro ao excluir período");
                return;
            }

            setDeleteConfirm(null);
            setSelectedPeriod(null);
            mutate("/api/admin/archive/periods");
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir");
        }
    };

    if (isLoadingAuth) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated || !hasAccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-24 h-24 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center justify-center mb-6 animate-pulse">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold mb-2 font-display uppercase tracking-wide text-foreground">
                    Acesso Negado
                </h2>
                <p className="text-muted-foreground">Apenas membros da staff podem acessar esta área.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1800px] mx-auto pb-12">
            <aside className="w-full lg:w-64 flex-shrink-0">
                <AdminSidebar />
            </aside>

            <main className="flex-1 space-y-6 min-w-0">
                {/* Header */}
                <div className="bg-card p-6 rounded border border-border">
                    <h1 className="text-3xl font-bold text-foreground tracking-widest uppercase font-display">
                        <Clock className="w-8 h-8 inline mr-3 text-primary" />
                        Histórico de <span className="text-primary">Denúncias</span>
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm font-mono uppercase tracking-wider">
                        Denúncias resolvidas e arquivos anteriores
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setSelectedTab("resolved")}
                        className={`px-6 py-3 rounded font-bold uppercase tracking-wider text-sm transition-all ${selectedTab === "resolved"
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-border text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <FileText className="w-4 h-4 inline mr-2" />
                        Resolvidas ({resolvedReports.length})
                    </button>
                    <button
                        onClick={() => setSelectedTab("archived")}
                        className={`px-6 py-3 rounded font-bold uppercase tracking-wider text-sm transition-all ${selectedTab === "archived"
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-border text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Archive className="w-4 h-4 inline mr-2" />
                        Arquivadas ({periods.length} períodos)
                    </button>
                </div>

                {/* Resolved Reports Tab */}
                {selectedTab === "resolved" && (
                    <div className="space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-card p-4 rounded border border-border text-center">
                                <p className="text-3xl font-bold text-foreground">{resolvedReports.length}</p>
                                <p className="text-xs text-muted-foreground uppercase">Total Resolvidas</p>
                            </div>
                            <div className="bg-emerald-500/10 p-4 rounded border border-emerald-500/20 text-center">
                                <p className="text-3xl font-bold text-emerald-500">{approvedCount}</p>
                                <p className="text-xs text-muted-foreground uppercase">Aprovadas</p>
                            </div>
                            <div className="bg-red-500/10 p-4 rounded border border-red-500/20 text-center">
                                <p className="text-3xl font-bold text-red-500">{rejectedCount}</p>
                                <p className="text-xs text-muted-foreground uppercase">Rejeitadas</p>
                            </div>
                        </div>

                        {/* Archive Button */}
                        {isAdmin && resolvedReports.length > 0 && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-yellow-600 dark:text-yellow-400 font-bold text-sm">
                                        {resolvedReports.length} denúncias resolvidas prontas para arquivar
                                    </p>
                                    <p className="text-yellow-600/70 dark:text-yellow-400/70 text-xs">
                                        Arquivar move as denúncias para o histórico permanente e limpa a lista atual
                                    </p>
                                </div>
                                <button
                                    onClick={() => setArchiveModalOpen(true)}
                                    className="bg-yellow-500 text-white px-4 py-2 rounded font-bold uppercase tracking-wider text-xs flex items-center gap-2 hover:bg-yellow-600 transition-all"
                                >
                                    <Archive className="w-4 h-4" />
                                    Arquivar
                                </button>
                            </div>
                        )}

                        {/* Reports List */}
                        <div className="bg-card border border-border rounded">
                            {isLoadingReports ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : resolvedReports.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Nenhuma denúncia resolvida no momento</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {resolvedReports.map((report: any) => (
                                        <div key={report.id} className="p-4 hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-mono text-muted-foreground">#{report.id}</span>
                                                        <span className="font-bold text-foreground">{report.accusedName || report.accusedId}</span>
                                                        {report.accusedFamily && (
                                                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                                {report.accusedFamily}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">{report.reason}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {new Date(report.createdAt).toLocaleDateString("pt-BR", { dateStyle: "medium" })}
                                                    </p>
                                                </div>
                                                <span className={`text-xs font-bold px-3 py-1 rounded ${report.status === "APPROVED"
                                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                                                    }`}>
                                                    {report.status === "APPROVED" ? "✓ Aprovada" : "✗ Rejeitada"}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Archived Tab */}
                {selectedTab === "archived" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Periods List */}
                        <div className="bg-card border border-border rounded p-6">
                            <h2 className="text-lg font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                Períodos Arquivados
                            </h2>

                            {isLoadingPeriods ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : periods.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Archive className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Nenhum período arquivado</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {periods.map((period: any) => (
                                        <button
                                            key={period.id}
                                            onClick={() => setSelectedPeriod(period.id)}
                                            className={`w-full text-left p-4 rounded border transition-all ${selectedPeriod === period.id
                                                ? "bg-primary/10 border-primary"
                                                : "bg-secondary border-border hover:border-primary/50"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="font-bold text-foreground">{period.name}</p>
                                                <ChevronRight className={`w-5 h-5 transition-transform ${selectedPeriod === period.id ? "rotate-90 text-primary" : "text-muted-foreground"}`} />
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {period.totalReports} denúncias · {period.totalPunishments} punições
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Period Details */}
                        <div className="lg:col-span-2 bg-card border border-border rounded p-6">
                            {!selectedPeriod ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Archive className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                    <p>Selecione um período para ver os detalhes</p>
                                </div>
                            ) : isLoadingDetail ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                </div>
                            ) : detail ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-border pb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-foreground">{detail.name}</h2>
                                            <p className="text-sm text-muted-foreground">
                                                Arquivado em {new Date(detail.createdAt).toLocaleDateString("pt-BR")}
                                            </p>
                                        </div>
                                        {isAdmin && (
                                            <button
                                                onClick={() => setDeleteConfirm(detail.id)}
                                                className="text-red-500 hover:bg-red-500/10 p-2 rounded transition-colors"
                                                title="Excluir período"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-secondary p-3 rounded border border-border text-center">
                                            <p className="text-xl font-bold text-foreground">{detail.totalReports}</p>
                                            <p className="text-xs text-muted-foreground">Total</p>
                                        </div>
                                        <div className="bg-emerald-500/10 p-3 rounded border border-emerald-500/20 text-center">
                                            <p className="text-xl font-bold text-emerald-500">{detail.approvedReports}</p>
                                            <p className="text-xs text-muted-foreground">Aprovadas</p>
                                        </div>
                                        <div className="bg-red-500/10 p-3 rounded border border-red-500/20 text-center">
                                            <p className="text-xl font-bold text-red-500">{detail.rejectedReports}</p>
                                            <p className="text-xs text-muted-foreground">Rejeitadas</p>
                                        </div>
                                    </div>

                                    {/* Reports */}
                                    <div className="max-h-96 overflow-y-auto space-y-2">
                                        {detail.archivedReports?.map((report: any) => (
                                            <div key={report.id} className="p-3 bg-secondary rounded border border-border">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground">
                                                            #{report.originalId} - {report.accusedName || report.accusedId}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">{report.reason}</p>
                                                    </div>
                                                    <span className={`text-xs font-bold px-2 py-1 rounded ${report.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                                        }`}>
                                                        {report.status === "APPROVED" ? "Aprovada" : "Rejeitada"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}
            </main>

            {/* Archive Modal */}
            <Modal isOpen={archiveModalOpen} onClose={() => setArchiveModalOpen(false)} title="Arquivar Período">
                <div className="space-y-4">
                    {/* Month/Year Selectors */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                Mês
                            </label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="w-full bg-input border border-border rounded px-4 py-3 text-foreground focus:border-primary focus:outline-none"
                            >
                                {monthNames.map((month, index) => (
                                    <option key={index} value={index}>{month}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                Ano
                            </label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="w-full bg-input border border-border rounded px-4 py-3 text-foreground focus:border-primary focus:outline-none"
                            >
                                {[2024, 2025, 2026, 2027].map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className={`p-4 rounded border ${reportsForSelectedMonth.length > 0 ? 'bg-blue-500/10 border-blue-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
                        <p className={`text-sm font-bold ${reportsForSelectedMonth.length > 0 ? 'text-blue-500' : 'text-yellow-500'}`}>
                            {periodName}
                        </p>
                        <p className={`text-sm mt-1 ${reportsForSelectedMonth.length > 0 ? 'text-blue-400' : 'text-yellow-400'}`}>
                            {reportsForSelectedMonth.length > 0
                                ? `${reportsForSelectedMonth.length} denúncia(s) resolvida(s) para arquivar`
                                : 'Nenhuma denúncia resolvida neste período'
                            }
                        </p>
                        {reportsForSelectedMonth.length > 0 && (
                            <div className="flex gap-4 mt-2 text-xs">
                                <span className="text-emerald-500">
                                    ✓ {reportsForSelectedMonth.filter((r: any) => r.status === "APPROVED").length} aprovadas
                                </span>
                                <span className="text-red-500">
                                    ✗ {reportsForSelectedMonth.filter((r: any) => r.status === "REJECTED").length} rejeitadas
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setArchiveModalOpen(false)}
                            className="flex-1 px-4 py-3 rounded border border-border text-muted-foreground hover:text-foreground transition-colors font-bold uppercase tracking-wider text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleArchive}
                            disabled={isArchiving || reportsForSelectedMonth.length === 0}
                            className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded font-bold uppercase tracking-wider text-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isArchiving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                    Arquivando...
                                </>
                            ) : (
                                <>
                                    <Archive className="w-4 h-4" />
                                    Arquivar {periodName}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar Exclusão">
                <div className="space-y-4">
                    <p className="text-muted-foreground">
                        Tem certeza que deseja excluir este período? Todos os dados serão perdidos permanentemente.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setDeleteConfirm(null)}
                            className="flex-1 px-4 py-3 rounded border border-border text-muted-foreground hover:text-foreground transition-colors font-bold uppercase tracking-wider text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                            className="flex-1 bg-red-500 text-white px-4 py-3 rounded font-bold uppercase tracking-wider text-sm hover:bg-red-600 transition-all"
                        >
                            <Trash2 className="w-4 h-4 inline mr-2" />
                            Excluir
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
