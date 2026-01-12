import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { Shield, Users, LayoutDashboard, Settings, LogOut } from "lucide-react";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Verifica se é super admin
  if (!session?.user?.isSuperAdmin) {
    redirect("/");
  }

  // Verificar se está no domínio correto (apenas gtarp-dashboard.vercel.app ou localhost)
  // Esta verificação adicional garante que mesmo super admins só possam acessar pelo domínio principal
  const allowedHosts = [
    "gtarp-dashboard.vercel.app",
    "localhost",
    "127.0.0.1"
  ];

  // Em produção, verificar o domínio
  if (process.env.NODE_ENV === "production") {
    const host = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "";
    const isAllowedDomain = allowedHosts.some(allowedHost => host.includes(allowedHost));

    if (!isAllowedDomain) {
      redirect("/");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 p-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-violet-600 p-2 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white">Super Admin</h1>
            <p className="text-xs text-zinc-500">Gerenciamento de Tenants</p>
          </div>
        </div>

        <nav className="space-y-2">
          <Link
            href="/superadmin"
            className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            href="/superadmin/tenants"
            className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Users className="w-5 h-5" />
            Tenants
          </Link>
          <Link
            href="/superadmin/settings"
            className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
            Configuracoes
          </Link>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 px-3 py-2 bg-zinc-800 rounded-lg">
            <img
              src={session.user.image || "/default-avatar.png"}
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session.user.name}
              </p>
              <p className="text-xs text-zinc-500">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
