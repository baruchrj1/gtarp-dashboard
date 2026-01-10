"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Shield, LogOut, User } from "lucide-react";

export default function Navbar() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 w-full mb-8 border-b border-white/10 bg-black/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/20 p-2 rounded">
                            <Shield className="w-6 h-6 text-primary" />
                        </div>
                        <Link href="/" className="text-2xl font-display font-bold text-white tracking-wider uppercase">
                            HYPE<span className="text-primary"> REPORTS</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="flex items-center space-x-1">
                            <Link href="/" className="text-zinc-400 hover:text-white hover:bg-white/5 px-4 py-2 rounded font-medium transition-all uppercase text-sm tracking-wide">
                                Início
                            </Link>
                            {session && (
                                <Link href="/reports/new" className="text-zinc-400 hover:text-white hover:bg-white/5 px-4 py-2 rounded font-medium transition-all uppercase text-sm tracking-wide">
                                    Nova Denúncia
                                </Link>
                            )}
                            {session?.user?.isAdmin && (
                                <Link href="/admin" className="text-primary hover:text-primary-foreground hover:bg-primary/10 px-4 py-2 rounded font-medium transition-all uppercase text-sm tracking-wide">
                                    Admin Panel
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* User Menu */}
                    <div>
                        {session ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 bg-white/5 py-1.5 px-3 rounded border border-white/10">
                                    {session.user?.image ? (
                                        <img src={session.user.image} alt="Avatar" className="w-8 h-8 rounded bg-zinc-800" />
                                    ) : (
                                        <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center">
                                            <User className="w-4 h-4 text-zinc-400" />
                                        </div>
                                    )}
                                    <div className="hidden md:flex flex-col">
                                        <span className="text-sm font-bold text-white leading-none">{session.user?.name}</span>
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Online</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                    title="Sair"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => signIn("discord")}
                                className="gta-btn"
                            >
                                <span>Login com Discord</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
