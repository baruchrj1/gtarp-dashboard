import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { Shield, Users, LayoutDashboard, Settings, LogOut, ChevronRight } from "lucide-react";

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
  const allowedHosts = [
    "gtarp-dashboard.vercel.app",
    "localhost",
    "127.0.0.1"
  ];

  if (process.env.NODE_ENV === "production") {
    const host = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "";
    const isAllowedDomain = allowedHosts.some(allowedHost => host.includes(allowedHost));

    if (!isAllowedDomain) {
      redirect("/");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-violet-500/30">
      {/* Background Noise/Gradient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] mix-blend-screen"></div>
      </div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-zinc-950/80 backdrop-blur-xl border-r border-white/5 p-6 z-20 flex flex-col">

        {/* Logo Area */}
        <div className="flex items-center gap-4 mb-10 px-2">
          <div className="relative group">
            <div className="absolute inset-0 bg-violet-600 blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-zinc-900 to-black p-2.5 rounded-xl border border-white/10 shadow-xl">
              <Shield className="w-6 h-6 text-violet-500" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white font-display uppercase leading-none">
              Super<span className="text-violet-500">Admin</span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-wider mt-1 uppercase">System Control</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 flex-1">
          <p className="px-4 text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-4">Menu Principal</p>

          <NavLink href="/superadmin" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" />
          <NavLink href="/superadmin/tenants" icon={<Users className="w-5 h-5" />} label="Painéis" />
          <NavLink href="/superadmin/settings" icon={<Settings className="w-5 h-5" />} label="Configurações" />
        </nav>

        {/* User Footer */}
        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="group relative overflow-hidden rounded-xl bg-gradient-to-b from-white/5 to-transparent p-[1px]">
            <div className="relative bg-zinc-900/90 backdrop-blur-sm p-3 rounded-[11px] flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-full blur-[2px] opacity-20 animate-pulse"></div>
                <img
                  src={session.user.image || "/default-avatar.png"}
                  alt=""
                  className="relative w-9 h-9 rounded-full border border-white/10 object-cover"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-zinc-900 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate leading-tight font-display tracking-wide">
                  {session.user.name}
                </p>
                <p className="text-[10px] text-violet-400 font-medium uppercase tracking-wider">
                  Administrador
                </p>
              </div>
              <button className="text-zinc-500 hover:text-white transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 p-8 relative z-10">
        {children}
      </main>
    </div>
  );
}

// Helper Component for Nav Links
function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 relative overflow-hidden"
    >
      <span className="relative z-10 flex items-center gap-3">
        {icon}
        <span className="font-medium tracking-wide text-sm group-hover:translate-x-0.5 transition-transform">{label}</span>
      </span>

      {/* Hover Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-violet-500 rounded-r-full group-hover:h-8 transition-all duration-300 shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
    </Link>
  );
}
