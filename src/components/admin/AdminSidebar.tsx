"use client";
// Force update

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LayoutDashboard, FileText, Users, Settings, Activity, ShieldCheck, Shield, UserCheck, Gavel } from "lucide-react";

export default function AdminSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const role = session?.user?.role || "PLAYER";

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
            href: "/admin/reviews",
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
        <div className="hidden lg:flex flex-col w-64 bg-card border-r border-border h-[calc(100vh-80px)] sticky top-[80px]">
            <div className="p-6">
                <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6 font-display">
                    Sistema Central
                </h2>
                <nav className="space-y-2">
                    {navigation.map((item) => {
                        // Check if user has permission
                        if (!item.allowedRoles.includes(role)) return null;

                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-3 text-xs font-bold rounded transition-all duration-300 uppercase tracking-wider ${isActive
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                            >
                                <span className={`mr-3 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                                    {item.icon}
                                </span>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-border">
                <div className="bg-secondary rounded border border-border p-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Status da Rede</h3>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">ONLINE</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-[10px] text-muted-foreground font-mono">
                            Cargo: <span className="text-primary font-bold">{role}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
