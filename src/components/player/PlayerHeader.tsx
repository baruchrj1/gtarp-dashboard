"use client";

import { useSession } from "next-auth/react";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { ShieldAlert, Bell } from "lucide-react";

export default function PlayerHeader() {
    const { data: session } = useSession();
    const role = session?.user?.role || "PLAYER";

    return (
        <header className="flex items-center justify-end w-full mb-8 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Theme Switcher & Notifications */}
            <div className="flex items-center gap-2">
                <ThemeSwitcher />
                <button className="w-10 h-10 rounded-xl bg-background/50 border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/20 transition-all">
                    <Bell className="w-5 h-5" />
                </button>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-4 pl-4 border-l border-border/50">
                <div className="text-right hidden sm:block">
                    <h2 className="text-sm font-bold text-foreground leading-none">
                        {session?.user?.name || "Jogador"}
                    </h2>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mt-1">
                        {role === "ADMIN" ? "Administrador" : role === "EVALUATOR" ? "Avaliador" : "Cidadão"}
                    </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/25 shrink-0 overflow-hidden relative ring-2 ring-white/10">
                    {session?.user?.image ? (
                        <img
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <ShieldAlert className="w-6 h-6 text-white" />
                    )}
                </div>
            </div>
        </header>
    );
}
