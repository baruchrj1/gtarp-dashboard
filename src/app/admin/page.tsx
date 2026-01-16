"use client";

import { useSession } from "next-auth/react";
import useSWR from "swr";
import AdminSidebar from "@/components/admin/AdminSidebar";
import StatsCard from "@/components/admin/StatsCard";
import ReportsTable from "@/components/admin/ReportsTable";
import { ShieldAlert, CheckCircle, Clock, FileText, BarChart3, PieChart, Users, TrendingUp, Calendar, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart as RePieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
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
        isAuthenticated && isAdmin
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
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-24 h-24 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center justify-center mb-6 animate-pulse">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold mb-2 font-display uppercase tracking-wide text-zinc-900 dark:text-white">Acesso Negado</h2>
                <div className="text-zinc-500 max-w-md text-center">
                    <p className="mb-2">Protocolo de segurança: Nível 4 exigido.</p>
                    <p className="mb-2">Protocolo de segurança: Nível 4 exigido.</p>
                    <p className="text-sm">Seus cargos no Discord não correspondem aos configurados para este servidor.</p>
                    <p className="text-xs mt-4 text-zinc-600">ID: {session?.user?.id}</p>
                    <p className="text-xs text-zinc-600">Tenant: {tenant.name}</p>
                </div>
            </div>
        );
    }

    const overview = statsData?.overview || { total: 0, pending: 0, investigating: 0, resolved: 0, approved: 0, rejected: 0 };
    const dailyStats = statsData?.dailyStats || [];
    const topReasons = statsData?.topReasons || [];
    const topStaff = statsData?.topStaff || [];

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1800px] mx-auto pb-12">
            <aside className="w-full lg:w-64 flex-shrink-0">
                <AdminSidebar />
            </aside>

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

                {/* Only Admin sees full stats */}
                {
                    isAdmin ? (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {/* Stats Cards */}
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

                            {/* Charts Row 1 */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Daily Activity Chart */}
                                <div className="lg:col-span-2 gta-card p-6">
                                    <h3 className="text-lg font-bold text-foreground dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-primary" />
                                        Atividade {timeRange === "7d" && " (7 Dias)"}{timeRange === "30d" && " (30 Dias)"}{timeRange === "month" && " Mensal"}
                                    </h3>
                                    <div className="h-[300px] w-full">
                                        {isLoadingStats ? (
                                            <div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={dailyStats}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                                    <XAxis dataKey="date" stroke={axisColor} fontSize={12} tickLine={false} />
                                                    <YAxis stroke={axisColor} fontSize={12} tickLine={false} allowDecimals={false} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                                        itemStyle={{ color: '#fff' }}
                                                    />
                                                    <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>

                                {/* Top Reasons Pie Chart */}
                                <div className="bg-card dark:bg-black/40 border border-border dark:border-white/5 rounded p-6">
                                    <h3 className="text-lg font-bold text-foreground dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                                        <PieChart className="w-5 h-5 text-primary" />
                                        Principais Motivos
                                    </h3>
                                    <div className="w-full">
                                        {isLoadingStats ? (
                                            <div className="h-[300px] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                                        ) : (
                                            <div className="flex flex-col">
                                                <div className="h-[220px] w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <RePieChart>
                                                            <Pie
                                                                data={topReasons}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={60}
                                                                outerRadius={80}
                                                                paddingAngle={5}
                                                                dataKey="value"
                                                            >
                                                                {topReasons.map((entry: any, index: number) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip
                                                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                                                itemStyle={{ color: '#fff' }}
                                                            />
                                                        </RePieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <div className="mt-6 space-y-3">
                                                    {topReasons.map((reason: any, index: number) => (
                                                        <div key={index} className="flex items-center justify-between text-sm py-1 border-b border-border dark:border-white/5 last:border-0 hover:bg-muted dark:hover:bg-white/5 px-2 rounded transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                                                                    style={{ backgroundColor: COLORS[index % COLORS.length], boxShadow: `0 0 10px ${COLORS[index % COLORS.length]}40` }}
                                                                />
                                                                <span className="text-zinc-700 dark:text-zinc-300 font-medium">{reason.name}</span>
                                                            </div>
                                                            <span className="font-bold text-white dark:text-white font-mono bg-zinc-900/50 dark:bg-white/10 px-2 py-0.5 rounded text-xs text-foreground dark:text-white">{reason.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Row - Groups, Players */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Top Punished Groups */}
                                <div className="gta-card p-6">
                                    <h3 className="text-lg font-bold text-foreground dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-red-500" />
                                        Grupos Mais Punidos
                                    </h3>
                                    <div className="h-[300px] w-full">
                                        {isLoadingStats ? (
                                            <div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                                        ) : (statsData?.topGroups && statsData.topGroups.length > 0) ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart layout="vertical" data={statsData.topGroups} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                                                    <XAxis type="number" stroke={axisColor} fontSize={12} tickLine={false} />
                                                    <YAxis dataKey="name" type="category" stroke={axisColor} fontSize={12} tickLine={false} width={100} />
                                                    <Tooltip
                                                        cursor={{ fill: 'transparent' }}
                                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                                        itemStyle={{ color: '#fff' }}
                                                    />
                                                    <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <p className="text-center text-zinc-500 py-8 h-full flex items-center justify-center">Nenhum dado disponível.</p>
                                        )}
                                    </div>
                                </div>

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
                            </div>
                        </div>
                    ) : (
                        // Logic for Evaluator (Simpler view or just reports list)
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-primary/20 pb-4">
                                <h2 className="text-xl font-bold text-foreground dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary" />
                                    Minhas Avaliações Pendentes
                                </h2>
                            </div>
                            <ReportsTable />
                        </div>
                    )
                }
            </main >
        </div >
    );
}
