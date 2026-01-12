import { prisma } from "@/lib/prisma";
import { Users, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";

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

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">Total Tenants</p>
              <p className="text-3xl font-bold text-white">{stats.tenantCount}</p>
            </div>
            <div className="bg-violet-600/20 p-3 rounded-lg">
              <Users className="w-6 h-6 text-violet-500" />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">Tenants Ativos</p>
              <p className="text-3xl font-bold text-white">{stats.activeCount}</p>
            </div>
            <div className="bg-green-600/20 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">Total Usuarios</p>
              <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
            </div>
            <div className="bg-blue-600/20 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">Total Reports</p>
              <p className="text-3xl font-bold text-white">{stats.totalReports}</p>
            </div>
            <div className="bg-orange-600/20 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Acoes Rapidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/superadmin/tenants/new"
            className="flex items-center gap-3 p-4 bg-violet-600/10 border border-violet-600/20 rounded-lg hover:bg-violet-600/20 transition-colors"
          >
            <Users className="w-5 h-5 text-violet-500" />
            <span className="text-white font-medium">Novo Tenant</span>
          </Link>
          <Link
            href="/superadmin/tenants"
            className="flex items-center gap-3 p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg hover:bg-blue-600/20 transition-colors"
          >
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-white font-medium">Ver Tenants</span>
          </Link>
          <Link
            href="/superadmin/settings"
            className="flex items-center gap-3 p-4 bg-zinc-700/10 border border-zinc-700/20 rounded-lg hover:bg-zinc-700/20 transition-colors"
          >
            <AlertTriangle className="w-5 h-5 text-zinc-500" />
            <span className="text-white font-medium">Configuracoes</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
