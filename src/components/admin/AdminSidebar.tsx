"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Users, Settings, Activity } from "lucide-react";

const navigation = [
    { name: "VISÃO GERAL", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "DENÚNCIAS", href: "/admin/reports", icon: <FileText className="w-5 h-5" /> },
    { name: "USUÁRIOS", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
    { name: "CONFIGURAÇÕES", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden lg:flex flex-col w-64 bg-black/40 border-r border-white/5 h-[calc(100vh-80px)] sticky top-[80px]">
            <div className="p-6">
                <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6 font-display">
                    Sistema Central
                </h2>
                <nav className="space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-3 text-xs font-bold rounded transition-all duration-300 uppercase tracking-wider ${isActive
                                    ? "bg-primary text-black shadow-lg shadow-primary/20"
                                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <span className={`mr-3 ${isActive ? "text-black" : "text-zinc-600 group-hover:text-white"}`}>
                                    {item.icon}
                                </span>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-white/5">
                <div className="bg-zinc-900/50 rounded border border-zinc-800 p-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">Status da Rede</h3>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-medium text-emerald-400">ONLINE</span>
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-2 font-mono">Ping: 24ms | Uptime: 99.9%</p>
                </div>
            </div>
        </div>
    );
}
