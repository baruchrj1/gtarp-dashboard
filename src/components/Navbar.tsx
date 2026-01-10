"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="glass sticky top-0 z-50 w-full mb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            GTA RP REPORTS
                        </Link>
                        <div className="hidden md:block ml-10">
                            <div className="flex items-baseline space-x-4">
                                <Link href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                    Início
                                </Link>
                                {session && (
                                    <Link href="/reports/new" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                        Nova Denúncia
                                    </Link>
                                )}
                                {/* @ts-ignore - isAdmin added in type declaration or session callback logic */}
                                {session?.user?.isAdmin && (
                                    <Link href="/admin" className="text-primary hover:text-primary-glow px-3 py-2 rounded-md text-sm font-medium">
                                        Admin Dashboard
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                    <div>
                        {session ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    {session.user?.image && (
                                        <img src={session.user.image} alt="Avatar" className="w-8 h-8 rounded-full border border-border" />
                                    )}
                                    <span className="hidden md:block text-sm text-gray-200">{session.user?.name}</span>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="btn text-sm bg-surface hover:bg-surface-highlight border border-border"
                                >
                                    Sair
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => signIn("discord")}
                                className="btn btn-primary text-sm"
                            >
                                Login com Discord
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
