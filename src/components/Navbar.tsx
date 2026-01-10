"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 w-full mb-8 border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent hover:to-white transition-all">
                            GTARP<span className="text-primary">REPORTS</span>
                        </Link>
                        <div className="hidden md:block ml-10">
                            <div className="flex items-baseline space-x-1">
                                <Link href="/" className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 px-4 py-2 rounded-lg text-sm font-medium transition-all">
                                    Início
                                </Link>
                                {session && (
                                    <Link href="/reports/new" className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 px-4 py-2 rounded-lg text-sm font-medium transition-all">
                                        Nova Denúncia
                                    </Link>
                                )}
                                {session?.user?.isAdmin && (
                                    <Link href="/admin" className="text-primary hover:text-primary-foreground hover:bg-primary/10 px-4 py-2 rounded-lg text-sm font-medium transition-all">
                                        Admin Dashboard
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                    <div>
                        {session ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 bg-zinc-900/50 py-1.5 px-3 rounded-full border border-zinc-800">
                                    {session.user?.image ? (
                                        <img src={session.user.image} alt="Avatar" className="w-6 h-6 rounded-full ring-2 ring-zinc-800" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-zinc-800" />
                                    )}
                                    <span className="hidden md:block text-sm font-medium text-zinc-200 pr-1">{session.user?.name}</span>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                                >
                                    Sair
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => signIn("discord")}
                                className="group relative inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-white transition-all bg-primary rounded-lg hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 focus:outline-none"
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
