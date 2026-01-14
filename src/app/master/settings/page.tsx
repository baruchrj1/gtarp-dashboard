
import { User, Shield, Key, Bell, HelpCircle } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Configurações</h1>
                <p className="text-sm text-zinc-500 mt-1">Gerencie suas preferências e visualização da plataforma.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Sidebar Navigation (Mock) */}
                <div className="space-y-2">
                    <NavButton active icon={<User className="w-4 h-4" />} label="Perfil" />
                    <NavButton icon={<Shield className="w-4 h-4" />} label="Segurança" />
                    <NavButton icon={<Bell className="w-4 h-4" />} label="Notificações" />
                    <NavButton icon={<Key className="w-4 h-4" />} label="API Keys" />
                    <NavButton icon={<HelpCircle className="w-4 h-4" />} label="Suporte" />
                </div>

                {/* Content Area */}
                <div className="md:col-span-2 space-y-6">
                    {/* Profile Card */}
                    <div className="glass-card rounded-xl p-6 space-y-6">
                        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                            <div className="w-16 h-16 rounded-full bg-violet-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-violet-500/20">
                                {session?.user?.name?.[0] || "A"}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">{session?.user?.name || "Admin User"}</h3>
                                <p className="text-sm text-zinc-500">Super Administrador</p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Email</label>
                                <input
                                    type="text"
                                    value={session?.user?.email || "admin@nexus.com"}
                                    disabled
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-500 cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Cargo</label>
                                <input
                                    type="text"
                                    value="Super Admin"
                                    disabled
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-emerald-500 font-bold uppercase text-xs tracking-wide cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Version Info */}
                    <div className="p-4 rounded-xl border border-dashed border-zinc-800 text-center">
                        <p className="text-xs text-zinc-600 font-mono">NexusMaster v2.0.0 (Unified Dashboard)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function NavButton({ active, icon, label }: any) {
    return (
        <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${active ? 'bg-white/5 text-white border border-white/5' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
            {icon}
            {label}
        </button>
    )
}
