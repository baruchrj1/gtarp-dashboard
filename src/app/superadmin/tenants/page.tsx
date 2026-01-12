import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, ExternalLink, Settings, Users, FileText } from "lucide-react";

async function getTenants() {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          users: true,
          reports: true,
        },
      },
    },
  });

  return tenants;
}

export default async function TenantsPage() {
  const tenants = await getTenants();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Tenants</h1>
        <Link
          href="/superadmin/tenants/new"
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Tenant
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">
                Tenant
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">
                Dominio
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">
                Usuarios
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">
                Reports
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">
                Status
              </th>
              <th className="text-right px-6 py-4 text-sm font-medium text-zinc-400">
                Acoes
              </th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr
                key={tenant.id}
                className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {tenant.logo ? (
                      <img
                        src={tenant.logo}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: tenant.primaryColor }}
                      >
                        {tenant.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-white">{tenant.name}</p>
                      <p className="text-sm text-zinc-500">{tenant.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <p className="text-sm text-zinc-300">
                      {tenant.subdomain}.suaplataforma.com
                    </p>
                    {tenant.customDomain && (
                      <p className="text-xs text-zinc-500">
                        {tenant.customDomain}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Users className="w-4 h-4" />
                    {tenant._count.users}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <FileText className="w-4 h-4" />
                    {tenant._count.reports}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {tenant.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400">
                      Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-400">
                      Inativo
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={`https://${tenant.subdomain}.suaplataforma.com`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                      title="Abrir dashboard"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <Link
                      href={`/superadmin/tenants/${tenant.id}`}
                      className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                      title="Configuracoes"
                    >
                      <Settings className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  Nenhum tenant cadastrado.{" "}
                  <Link
                    href="/superadmin/tenants/new"
                    className="text-violet-500 hover:underline"
                  >
                    Criar primeiro tenant
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
