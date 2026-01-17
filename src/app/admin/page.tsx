"use client";

import { useSession } from "next-auth/react";
import useSWR from "swr";

import StatsCard from "@/components/admin/StatsCard";
import { AdminCharts } from "@/components/admin/AdminCharts";
import ReportsTable from "@/components/admin/ReportsTable";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { ShieldAlert, CheckCircle, Clock, FileText, BarChart3, PieChart, Users, TrendingUp, Calendar, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useTenant } from "@/contexts/TenantContext";
import { hasTenantRole } from "@/lib/permissions";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { themeMode } = useTheme();
    const tenant = useTenant(); // Get current tenant config

    const axisColor = themeMode === "dark" ? "#fff" : "#666";
    const gridColor = themeMode === "dark" ? "#333" : "#e5e5e5";

    // Enable keyboard shortcuts
    useKeyboardShortcuts();

    const isAuthenticated = status === "authenticated";
    const isLoadingAuth = status === "loading";

    // Strict Permission Check
    const userRoles = session?.user?.discordRoles || [];

    // Check against tenant configuration
    const isTenantAdmin = hasTenantRole(userRoles, tenant.discordRoleAdmin);
    const isTenantEvaluator = hasTenantRole(userRoles, tenant.discordRoleEvaluator);

    // Final permissions
    const isAdmin = isTenantAdmin || session?.user?.isAdmin === true;
    const isEvaluator = isTenantEvaluator;

    const hasAccess = isAdmin || isEvaluator;

    useEffect(() => {
        if (!isLoadingAuth && !isAuthenticated) {
            router.replace("/");
        }
    }, [isLoadingAuth, isAuthenticated, router]);

    const [timeRange, setTimeRange] = useState<"7d" | "30d" | "month">("7d");
    const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7)); // YYYY-MM

    const { data: statsData, isLoading: isLoadingStats } = useSWR(
        isAuthenticated && hasAccess
            ? `/api/admin/stats?range=${timeRange}${timeRange === "month" ? `&date=${selectedMonth}` : ""}`
            : null,
        fetcher
    );

    // If evaluator, show simplified dashboard or redirect (using existing reports page)
    // But for this "Visão Geral", usually only Admin has the full view. 
    // Evaluator might see just reports.

    // Show loading state while checking session
    if (isLoadingAuth) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Show loading if tenant is still initializing
    if (tenant.id === "loading") {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Redirect or show denied if not authorized
    if (!isAuthenticated || !hasAccess) {
        return (
            <AccessDenied
                message="Protocolo de segurança: Nível 4 exigido. Seus cargos no Discord não correspondem aos configurados para este servidor."
            />
        );
    }

    const overview = statsData?.overview || { total: 0, pending: 0, investigating: 0, resolved: 0, approved: 0, rejected: 0 };
    const dailyStats = statsData?.dailyStats || [];
    const categoryStats = statsData?.categoryStats || [];
    const topReasons = statsData?.topReasons || [];
    const topStaff = statsData?.topStaff || [];

    return (
        <div className="flex flex-col gap-8">
            <main className="flex-1 space-y-8 min-w-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 gta-card p-6">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-widest uppercase font-display">
                            Painel <span className="text-primary">{isAdmin ? "Administrativo" : "de Avaliação"}</span>
                        </h1>
                        <p className="text-muted-foreground dark:text-zinc-400 mt-1 text-sm font-mono uppercase tracking-wider">
                            Operador: <span className="text-zinc-900 dark:text-white">{session?.user?.name}</span> | Sistema de Monitoramento Global
                        </p>
                    </div>

                    {/* Filter Controls */}
                    {isAdmin && (
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-300 dark:border-white/10">
                                <button
                                    onClick={() => setTimeRange("7d")}
                                    className={`px-3 py-1.5 text-xs font-bold uppercase rounded transition-all ${timeRange === "7d" ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-500 hover:text-white"
                                        }`}
                                >
                                    7 Dias
                                </button>
                                <button
                                    onClick={() => setTimeRange("30d")}
                                    className={`px-3 py-1.5 text-xs font-bold uppercase rounded transition-all ${timeRange === "30d" ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-500 hover:text-white"
                                        }`}
                                >
                                    30 Dias
                                </button>
                                <button
                                    onClick={() => setTimeRange("month")}
                                    className={`px-3 py-1.5 text-xs font-bold uppercase rounded transition-all ${timeRange === "month" ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-500 hover:text-white"
                                        }`}
                                >
                                    Mês
                                </button>
                            </div>

                            {timeRange === "month" && (
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar className="h-4 w-4 text-zinc-500" />
                                    </div>
                                    <input
                                        type="month"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 rounded-lg text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Stats Cards - Visible to all Staff (Admin & Evaluators) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatsCard
                            title="Total de Denúncias"
                            value={overview.total}
                            icon={<FileText className="w-6 h-6 text-primary" />}
                            description="Registros totais"
                            loading={isLoadingStats}
                        />
                        <StatsCard
                            title="Pendentes"
                            value={overview.pending}
                            icon={<Clock className="w-6 h-6 text-yellow-500" />}
                            description="Aguardando análise"
                            loading={isLoadingStats}
                        />
                        <StatsCard
                            title="Casos Encerrados"
                            value={overview.resolved}
                            icon={<CheckCircle className="w-6 h-6 text-emerald-500" />}
                            description={`Aprov: ${overview.approved} | Rej: ${overview.rejected}`}
                            loading={isLoadingStats}
                        />
                        <StatsCard
                            title="Em Investigação"
                            value={overview.investigating}
                            icon={<ShieldAlert className="w-6 h-6 text-blue-500" />}
                            description="Sendo analisadas agora"
                            loading={isLoadingStats}
                        />
                    </div>

                    {isAdmin ? (
                        <>
                            <AdminCharts
                                dailyStats={dailyStats}
                                timeRange={timeRange}
                                categoryStats={categoryStats}
                                overview={overview}
                                topReasons={topReasons}
                                topGroups={statsData?.topGroups}
                            />

                            {/* Top Punished Players */}
                            <div className="bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/5 rounded p-6 shadow-sm dark:shadow-none">
                                <h3 className="text-lg font-bold text-foreground dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5 text-red-500" />
                                    Jogadores Mais Punidos
                                </h3>
                                {isLoadingStats ? (
                                    <div className="h-40 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                                ) : (statsData?.topAccused && statsData.topAccused.length > 0) ? (
                                    <div className="space-y-4">
                                        {statsData.topAccused.map((player: any, index: number) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded hover:bg-red-500/10 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded bg-red-500/20 flex items-center justify-center text-red-500 font-bold text-xs font-mono">
                                                        #{index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-foreground dark:text-white text-sm">{player.name}</p>
                                                        <p className="text-xs text-muted-foreground dark:text-zinc-500 font-mono">ID: {player.id}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-lg font-bold text-red-400">{player.count}</span>
                                                    <span className="text-[10px] text-zinc-500 uppercase">Punições</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-zinc-500 py-8">Nenhum dado disponível.</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-primary/20 pb-4">
                                <h2 className="text-xl font-bold text-foreground dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary" />
                                    Minhas Avaliações Pendentes
                                </h2>
                            </div>
                            <ReportsTable />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
