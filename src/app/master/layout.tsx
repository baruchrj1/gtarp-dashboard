import { getServerSession } from "@/lib/auth"; // Custom wrapper
import { redirect } from "next/navigation";
import Link from "next/link";
// import { authOptions } from "@/lib/auth"; // REMOVED
import { Activity, Users, LayoutDashboard, Settings, LogOut, Hexagon } from "lucide-react";

export default async function MasterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Custom getServerSession handles authOptions resolution automatically
    const session = await getServerSession();


    if (!session || !session.user || !(session.user as any).isSuperAdmin) {
        redirect("/login");
    }

    return (
        <div className="flex h-screen bg-[#020202] text-white font-sans overflow-hidden selection:bg-violet-500/20">

            {/* Sidebar */}
            <aside className="w-72 flex-shrink-0 bg-[#020202] border-r border-[#1f1f22] flex flex-col relative z-20">

                {/* Brand */}
                <div className="p-8 pb-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/10">
                        <Hexagon className="w-6 h-6 text-white fill-white/20" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight text-white leading-none">
                            Nexus<span className="text-zinc-500">Master</span>
                        </h1>
                        <p className="text-[11px] text-zinc-500 font-medium mt-1">Painel SaaS</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1">
                    <div className="px-4 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Plataforma</span>
                    </div>
                    <NavLink href="/master" icon={<LayoutDashboard className="w-4 h-4" />} label="Visão Geral" />
                    <NavLink href="/master/tenants" icon={<Users className="w-4 h-4" />} label="Clientes" />

                    <div className="px-4 mb-2 mt-8">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Sistema</span>
                    </div>
                    <NavLink href="/master/audit" icon={<Activity className="w-4 h-4" />} label="Auditoria" />
                    <NavLink href="/master/settings" icon={<Settings className="w-4 h-4" />} label="Configurações" />
                </nav>

                {/* User Footer */}
                <div className="p-4 mt-auto border-t border-[#1f1f22]">
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold border border-zinc-700">
                            {session.user.name?.[0] || "A"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate group-hover:text-violet-400 transition-colors">
                                {session.user.name || "Admin"}
                            </p>
                            <p className="text-xs text-zinc-500 truncate">Super Admin</p>
                        </div>
                        <Link href="/api/auth/signout" className="text-zinc-600 hover:text-red-400 transition-colors">
                            <LogOut className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-[#050505] relative scroll-smooth">
                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 bg-[url('/grid-v2.svg')] bg-[length:50px_50px] opacity-[0.03] pointer-events-none"></div>

                <div className="flex-1 p-10 max-w-7xl mx-auto w-full relative z-10 transition-all duration-500 ease-in-out">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-3 px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-white/[0.03] rounded-lg transition-all duration-200"
        >
            <span className="group-hover:scale-110 transition-transform duration-200 text-zinc-500 group-hover:text-violet-400">
                {icon}
            </span>
            <span className="font-medium text-sm tracking-tight">{label}</span>
        </Link>
    );
}
