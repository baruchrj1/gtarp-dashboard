import { prisma } from "@/lib/prisma";
import { Users, Activity, Server, Plus, ArrowUpRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getStats() {
    const [tenantCount, activeCount, totalUsers, totalReports] = await Promise.all([
        prisma.tenant.count(),
        prisma.tenant.count({ where: { isActive: true } }),
        prisma.user.count(),
        prisma.report.count(),
    ]);

    return { tenantCount, activeCount, totalUsers, totalReports };
}

export default async function SuperAdminDashboard() {
    const stats = await getStats();
    await getServerSession(authOptions);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">

            {/* Header */}
            <div className="flex items-end justify-between border-b border-white/5 pb-8">
                <div>
                    <h2 className="text-zinc-400 font-medium mb-1 text-sm uppercase tracking-wider">Bem-vindo de volta</h2>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Painel de Controle
                    </h1>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/master/tenants/new"
                        className="h-10 px-6 bg-white hover:bg-zinc-200 text-black text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-white/5"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Cliente
                    </Link>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KpiCard
                    label="Instâncias Ativas"
                    value={stats.activeCount}
                    total={stats.tenantCount}
                    icon={<Server className="w-5 h-5 text-emerald-400" />}
                    trend="+2 nesta semana"
                />
                <KpiCard
                    label="Usuários Totais"
                    value={stats.totalUsers}
                    icon={<Users className="w-5 h-5 text-violet-400" />}
                    trend="Global"
                />
                <KpiCard
                    label="Reports Pendentes"
                    value={stats.totalReports}
                    icon={<Activity className="w-5 h-5 text-orange-400" />}
                    trend="Requer atenção"
                />
                <KpiCard
                    label="Status do Sistema"
                    value="100%"
                    icon={<ShieldCheck className="w-5 h-5 text-blue-400" />}
                    trend="Operando normalmente"
                />
            </div>

            {/* Recent Activity / Quick Access */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Section 1 */}
                <div className="glass-card rounded-xl p-6 h-64 flex flex-col justify-center items-center text-center border border-white/5 bg-zinc-900/40">
                    <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4 text-zinc-500">
                        <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Gerenciar Clientes</h3>
                    <p className="text-zinc-500 text-sm max-w-xs mb-6">Acesse a lista completa de tenants para auditoria e configurações avançadas.</p>
                    <Link href="/master/tenants" className="text-sm font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                        Ver Lista <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Section 2 */}
                <div className="glass-card rounded-xl p-6 h-64 flex flex-col justify-center items-center text-center border border-white/5 bg-zinc-900/40">
                    <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4 text-zinc-500">
                        <Activity className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Métricas de Uso</h3>
                    <p className="text-zinc-500 text-sm max-w-xs mb-6">Analise o desempenho e volume de dados das instâncias conectadas.</p>
                    <button className="text-sm font-medium text-zinc-600 cursor-not-allowed flex items-center gap-1">
                        Em Breve
                    </button>
                </div>

            </div>
        </div>
    );
}

function KpiCard({ label, value, total, icon, trend }: any) {
    return (
        <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors group">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>
                {total && <span className="text-xs font-medium text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full border border-zinc-800">{total} Total</span>}
            </div>
            <div>
                <h3 className="text-3xl font-bold text-white tracking-tight mb-1">{value}</h3>
                <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-500 font-medium">{label}</p>
                    <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-wide">{trend}</span>
                </div>
            </div>
        </div>
    )
}
