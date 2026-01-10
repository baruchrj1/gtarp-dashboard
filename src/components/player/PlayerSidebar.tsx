"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LayoutDashboard, FileText, ClipboardList, CheckCircle2, LogOut, PlusCircle } from "lucide-react";
import { signOut } from "next-auth/react";

export default function PlayerSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

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
        },
        {
            name: "PROTOCOLOS",
            href: "/player/protocols",
            icon: <ClipboardList className="w-5 h-5" />
        },
        {
            name: "RESOLUÇÕES",
            href: "/player/resolutions",
            icon: <CheckCircle2 className="w-5 h-5" />
        },
    ];

    return (
        <div className="bg-black/40 border border-white/5 rounded p-4 h-fit sticky top-8">
            {/* User Info */}
            <div className="mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    {session?.user?.image ? (
                        <img
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            className="w-12 h-12 rounded-full border-2 border-primary/20"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/20 flex items-center justify-center">
                            <span className="text-primary font-bold text-lg">
                                {session?.user?.name?.charAt(0).toUpperCase() || "?"}
                            </span>
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm truncate">
                            {session?.user?.name || "Jogador"}
                        </p>
                        <p className="text-zinc-500 text-xs uppercase tracking-wider">
                            Jogador
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded transition-all
                                ${isActive
                                    ? "bg-primary text-black font-bold"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                                }
                            `}
                        >
                            {item.icon}
                            <span className="text-sm uppercase tracking-wider">
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="mt-6 pt-4 border-t border-white/5">
                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm uppercase tracking-wider font-bold">
                        Sair
                    </span>
                </button>
            </div>
        </div>
    );
}
