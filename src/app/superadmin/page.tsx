import { prisma } from "@/lib/prisma";
import { Users, FileText, Activity, Server, Plus, Settings, List, ExternalLink } from "lucide-react";
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
  const session = await getServerSession(authOptions);
  const userFirstname = session?.user?.name?.split(' ')[0] || 'Admin';

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight font-display mb-2">
            Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">{userFirstname}</span>
          </h1>
          <p className="text-zinc-400 text-lg">
            Visão geral do ecossistema <span className="text-white font-medium">GTA-RP Dashboard</span>.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-lg bg-zinc-900/50 border border-white/5 backdrop-blur-md text-zinc-400 text-sm font-mono self-start md:self-auto">
            v2.5.0-stable
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          label="Total de Painéis"
          value={stats.tenantCount}
          icon={<Server className="w-5 h-5 text-violet-400" />}
          trend="+12% este mês"
          color="violet"
        />
        <StatsCard
          label="Painéis Ativos"
          value={stats.activeCount}
          icon={<Activity className="w-5 h-5 text-emerald-400" />}
          trend="100% uptime"
          color="emerald"
        />
        <StatsCard
          label="Usuários Totais"
          value={stats.totalUsers}
          icon={<Users className="w-5 h-5 text-blue-400" />}
          trend="+24 novos hoje"
          color="blue"
        />
        <StatsCard
          label="Total de Reports"
          value={stats.totalReports}
          icon={<FileText className="w-5 h-5 text-orange-400" />}
          trend="4 pendentes"
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-display uppercase tracking-wide">
          <div className="w-1 h-6 bg-violet-600 rounded-full"></div>
          Ações Rápidas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard
            href="/superadmin/tenants/new"
            icon={<Plus className="w-6 h-6 text-white" />}
            title="Novo Painel"
            description="Criar e configurar um novo tenant para uma cidade."
            gradient="from-violet-600 to-indigo-600"
          />
          <ActionCard
            href="/superadmin/tenants"
            icon={<List className="w-6 h-6 text-indigo-200" />}
            title="Gerenciar Painéis"
            description="Visualizar, editar e auditar tenants existentes."
            gradient="from-zinc-800 to-zinc-900 border-zinc-700"
            isSecondary
          />
          <ActionCard
            href="/superadmin/settings"
            icon={<Settings className="w-6 h-6 text-zinc-300" />}
            title="Configurações Globais"
            description="Ajustes de sistema, webhooks e logs gerais."
            gradient="from-zinc-800 to-zinc-900 border-zinc-700"
            isSecondary
          />
        </div>
      </div>

    </div>
  );
}

// Components
function StatsCard({ label, value, icon, trend, color }: any) {
  const gradients: any = {
    violet: "from-violet-500/20 to-transparent border-violet-500/20",
    emerald: "from-emerald-500/20 to-transparent border-emerald-500/20",
    blue: "from-blue-500/20 to-transparent border-blue-500/20",
    orange: "from-orange-500/20 to-transparent border-orange-500/20",
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-zinc-900/40 backdrop-blur-sm p-6 transition-all hover:-translate-y-1 hover:shadow-lg group ${gradients[color]}`}>
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity scale-150`}>
        {icon}
      </div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`p-2.5 rounded-xl bg-zinc-900/80 border border-white/5 shadow-inner`}>
          {icon}
        </div>
        {/* Sparkline or mini chart area could go here */}
      </div>

      <div className="relative z-10">
        <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-3xl font-bold text-white font-display tracking-tight">{value}</h3>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5">
            {trend}
          </span>
        </div>
      </div>
    </div>
  )
}

function ActionCard({ href, icon, title, description, gradient, isSecondary }: any) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-2xl border p-1 transition-all hover:scale-[1.02] hover:shadow-xl ${isSecondary ? 'border-zinc-800 bg-zinc-900/50' : 'border-transparent bg-transparent'}`}
    >
      {/* Gradient Border Trick */}
      {!isSecondary && (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-100`}></div>
      )}

      <div className={`relative h-full rounded-xl p-6 flex flex-col justify-between ${isSecondary ? 'bg-transparent' : 'bg-zinc-950/90'}`}>
        <div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${isSecondary ? 'bg-zinc-800 text-white' : 'bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-900/20'}`}>
            {icon}
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
        </div>

        <div className="mt-6 flex items-center text-xs font-bold uppercase tracking-wider text-zinc-500 group-hover:text-white transition-colors">
          Acessar <ExternalLink className="w-3 h-3 ml-2" />
        </div>
      </div>
    </Link>
  )
}
