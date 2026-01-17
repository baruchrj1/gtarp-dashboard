"use client";
// Force update - sidebar loading fix v2

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, FileText, Users, Settings, Activity, ShieldCheck, Shield, UserCheck, Gavel, LogOut, ShieldAlert } from "lucide-react";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";

export default function AdminSidebar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const role = session?.user?.role || "PLAYER";
    const isLoading = status === "loading";

    const navigation = [
        {
            name: "VISÃO GERAL",
            href: "/admin",
            icon: <LayoutDashboard className="w-5 h-5" />,
            allowedRoles: ["ADMIN"]
        },
        {
            name: "USUÁRIOS",
            href: "/admin/users",
            icon: <Users className="w-5 h-5" />,
            allowedRoles: ["ADMIN", "EVALUATOR"]
        },
        {
            name: "DENÚNCIAS",
            href: "/admin/reports",
            icon: <FileText className="w-5 h-5" />,
            allowedRoles: ["ADMIN", "EVALUATOR"]
        },
        {
            name: "MINHAS DENÚNCIAS",
            href: "/admin/my-reports",
            icon: <UserCheck className="w-5 h-5" />,
            allowedRoles: ["ADMIN", "EVALUATOR"]
        },
        {
            name: "PUNIÇÃO",
            href: "/admin/punishments",
            icon: <Gavel className="w-5 h-5" />,
            allowedRoles: ["ADMIN", "EVALUATOR"]
        },
        {
            name: "HISTÓRICO",
            href: "/admin/history",
            icon: <ShieldCheck className="w-5 h-5" />,
            allowedRoles: ["ADMIN", "EVALUATOR"]
        },
        {
            name: "GERENCIAMENTO",
            href: "/admin/roles",
            icon: <Shield className="w-5 h-5" />,
            allowedRoles: ["ADMIN"]
        },
        {
            name: "AVALIADORES",
            href: "/admin/evaluators",
            icon: <UserCheck className="w-5 h-5" />,
            allowedRoles: ["ADMIN"]
        },
        {
            name: "CONFIGURAÇÕES",
            href: "/admin/settings",
            icon: <Settings className="w-5 h-5" />,
            allowedRoles: ["ADMIN"]
        },
    ];

    return (
        <aside className="hidden lg:flex w-64 fixed h-screen z-40 p-4 pt-24 transition-all duration-300">
            <div className="gta-card h-full w-full flex flex-col p-4 relative group/sidebar bg-gradient-to-b from-white to-primary/5 dark:from-zinc-900 dark:to-zinc-950/80 backdrop-blur-xl border-primary/10 dark:border-white/5 shadow-2xl">
                {/* Background Decoration */}
                <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover/sidebar:bg-primary/20 transition-all duration-700"></div>
                </div>

                <div className="flex items-center gap-3 px-2 mb-8 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/25 shrink-0">
                        <ShieldAlert className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <h1 className="font-bold text-lg tracking-tight leading-none truncate text-foreground">SISTEMA</h1>
                        <p className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase truncate">Central</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 relative z-10 overflow-y-auto pr-1 scrollbar-hide">
                    {navigation.map((item) => {
                        if (!isLoading && !item.allowedRoles.includes(role)) return null;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                                    ? "bg-primary/10 text-primary font-bold shadow-sm"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:pl-5"
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"></div>
                                )}
                                <span className={`w-5 h-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                                    {item.icon}
                                </span>
                                <span className="text-sm">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-4 pt-4 border-t border-border/50 relative z-10 space-y-4">
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 hover:ml-1 transition-all text-sm font-medium group"
                    >
                        <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                        Sair
                    </button>

                    <div className="bg-white/50 dark:bg-zinc-900/30 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/5 p-4 relative overflow-hidden group card-hover-effect">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <h3 className="text-[10px] font-bold text-foreground/80 uppercase tracking-widest">Status da Rede</h3>
                            <div className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                            </div>
                        </div>

                        <div className="flex items-end justify-between relative z-10">
                            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">ONLINE</span>
                            <div className="text-right">
                                <p className="text-[9px] text-muted-foreground font-mono uppercase">Cargo</p>
                                <p className="text-xs font-bold text-primary">{role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
