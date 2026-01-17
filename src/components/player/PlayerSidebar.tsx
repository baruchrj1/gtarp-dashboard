"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, FileText, PlusCircle, ShieldAlert, LogOut } from "lucide-react";

export default function PlayerSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    // Default to PLAYER role logic for display if needed
    const role = session?.user?.role || "PLAYER";

    const navigation = [
        {
            name: "DASHBOARD",
            href: "/player",
            icon: <LayoutDashboard className="w-5 h-5" />
        },
        {
            name: "NOVA DENÚNCIA",
            href: "/player/new",
            icon: <PlusCircle className="w-5 h-5" />
        },
        {
            name: "DENÚNCIAS",
            href: "/player/reports",
            icon: <FileText className="w-5 h-5" />
        }
    ];

    return (
        <aside className="hidden lg:flex w-64 fixed h-screen z-40 p-4 pt-24 transition-all duration-300">
            <div className="gta-card h-full w-full flex flex-col p-4 relative group/sidebar bg-white dark:bg-zinc-950/80 backdrop-blur-xl border-zinc-200 dark:border-white/10 shadow-2xl">
                {/* Background Decoration */}
                <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover/sidebar:bg-primary/20 transition-all duration-700"></div>
                </div>

                {/* Logo Section */}
                <div className="flex items-center gap-3 px-2 mb-8 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/25 shrink-0">
                        <ShieldAlert className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <h1 className="font-bold text-lg tracking-tight leading-none truncate text-foreground">SISTEMA</h1>
                        <p className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase truncate">Cidadão</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 relative z-10 overflow-y-auto pr-1 scrollbar-hide">
                    {navigation.map((item) => {
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

                {/* Footer Actions */}
                <div className="mt-4 pt-4 border-t border-border/50 relative z-10 space-y-4">
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 hover:ml-1 transition-all text-sm font-medium group"
                    >
                        <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                        Sair
                    </button>
                </div>
            </div>
        </aside>
    );
}
