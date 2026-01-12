"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Shield, LogOut, User } from "lucide-react";
import ThemeSelector from "@/components/ThemeSelector";
import ModeToggle from "@/components/ModeToggle";
import { useSettings } from "@/contexts/SettingsContext";

type TopNavigationProps = {
    tenantLogo?: string | null;
    tenantName?: string | null;
    isTenantContext?: boolean;
};

export default function TopNavigation({ tenantLogo, tenantName, isTenantContext }: TopNavigationProps) {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const { settings } = useSettings();

    // Usa dados do tenant se disponivel, senao usa settings
    const logo = tenantLogo || settings.server_logo;
    const name = tenantName || settings.server_name;

    return (
        <nav className="sticky top-0 z-50 w-full mb-8 border-b border-white/10 bg-black/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20 relative">
                    <div className="flex items-center gap-2">
                        {logo ? (
                            <Link href="/">
                                <img src={logo} alt={name} className="h-12 w-auto object-contain hover:opacity-80 transition-opacity" />
                            </Link>
                        ) : (
                            <>
                                <div className="bg-primary/20 p-2 rounded">
                                    <Shield className="w-6 h-6 text-primary" />
                                </div>
                                <Link href="/" className="text-2xl font-display font-bold text-foreground tracking-wider uppercase">
                                    {name.split(' ').map((word, i, arr) => (
                                        <span key={i} className={i === arr.length - 1 ? "text-primary" : ""}>
                                            {word}{i < arr.length - 1 ? " " : ""}
                                        </span>
                                    ))}
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex flex-1 items-center justify-center px-8">
                        <div className="flex items-center space-x-1">
                            <Link href="/" className="text-zinc-400 hover:text-white hover:bg-white/5 px-4 py-2 rounded font-medium transition-all uppercase text-sm tracking-wide">
                                Início
                            </Link>
                            <Link href="/protocols" className="text-zinc-400 hover:text-white hover:bg-white/5 px-4 py-2 rounded font-medium transition-all uppercase text-sm tracking-wide">
                                Protocolos
                            </Link>
                            {session && (
                                <Link href="/player" className="text-zinc-400 hover:text-white hover:bg-white/5 px-4 py-2 rounded font-medium transition-all uppercase text-sm tracking-wide">
                                    Dashboard Pessoal
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        {session && (session.user?.role === "ADMIN" || session.user?.role === "EVALUATOR" || session.user?.isAdmin) && isTenantContext && (
                            <Link
                                href="/admin"
                                className="hidden md:inline-flex items-center justify-center h-8 px-2 rounded bg-primary text-black font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors"
                            >
                                Painel Avaliador
                            </Link>
                        )}




                        <div>
                            {session ? (
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-3 bg-white/5 py-2 px-4 rounded-lg border border-white/10">
                                        {session.user?.image ? (
                                            <img src={session.user.image} alt="Avatar" className="w-8 h-8 rounded-full bg-zinc-800" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                                <User className="w-4 h-4 text-zinc-400" />
                                            </div>
                                        )}
                                        <div className="hidden md:flex flex-col">
                                            <span className="text-sm font-bold text-white leading-tight">{session.user?.name}</span>
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Online</span>
                                        </div>
                                    </div>

                                    <ThemeSelector />

                                    <div className="w-px h-6 bg-white/10 mx-2" />

                                    <ModeToggle />

                                    <button
                                        onClick={() => signOut()}
                                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                        title="Sair"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
