
import Link from "next/link";
import { Plus, Search, Settings, ArrowUpRight, CheckCircle2, AlertCircle, Eye } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { MasqueradeButton } from "@/components/master/MasqueradeButton";

export default async function MasterTenantsPage() {
    const tenants = await prisma.tenant.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight font-display">
                        Clientes SaaS
                    </h1>
                    <p className="text-zinc-500 text-xs mt-1 font-medium">
                        Gerencie o acesso e configurações das instâncias.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                        <input
                            className="bg-zinc-900 border border-zinc-800 rounded h-9 pl-9 pr-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 w-64 uppercase tracking-wide"
                            placeholder="FILTRAR..."
                        />
                    </div>
                    <Link
                        href="/master/tenants/new"
                        className="h-9 px-4 bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider rounded flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Novo
                    </Link>
                </div>
            </div>

            {/* Table */}
            <div className="border border-zinc-800 rounded bg-[#0A0A0A] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-900/30">
                            <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest w-24">ID</th>
                            <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Organização</th>
                            <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Acesso</th>
                            <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Estado</th>
                            <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Opções</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                        {tenants.map((tenant, idx) => (
                            <tr key={tenant.id} className="group hover:bg-white/[0.02] transition-colors">
                                {/* ID */}
                                <td className="py-4 px-6 align-middle">
                                    <span className="font-mono text-xs text-zinc-500 group-hover:text-zinc-300">
                                        {(idx + 1).toString().padStart(2, '0')}
                                    </span>
                                </td>

                                {/* ORG */}
                                <td className="py-4 px-6 align-middle">
                                    <div className="flex items-center gap-4">
                                        <div className="w-9 h-9 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center relative overflow-hidden">
                                            {tenant.logo ?
                                                <img src={tenant.logo} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                : <span className="text-zinc-600 font-bold text-xs">{tenant.name[0]}</span>
                                            }
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-sm uppercase tracking-tight">{tenant.name}</div>
                                            <div className="text-[10px] text-zinc-600 font-mono mt-0.5">GID: {tenant.discordGuildId.slice(0, 4)}...</div>
                                        </div>
                                    </div>
                                </td>

                                {/* ACCESS */}
                                <td className="py-4 px-6 align-middle">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-zinc-300 font-mono">{tenant.subdomain}</span>
                                        {/* Updated to reflect that we might not be using netlify anymore, or just generic subdomain */}
                                        <span className="text-[10px] text-zinc-600 uppercase tracking-wide">.vercel.app</span>
                                    </div>
                                </td>

                                {/* STATUS */}
                                <td className="py-4 px-6 align-middle text-center">
                                    {tenant.isActive ? (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/30 border border-emerald-900/50">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Ativo</span>
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/30 border border-red-900/50">
                                            <AlertCircle className="w-3 h-3 text-red-500" />
                                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Inativo</span>
                                        </div>
                                    )}
                                </td>

                                {/* OPTIONS */}
                                <td className="py-4 px-6 align-middle text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <Link
                                            href={`/master/tenants/${tenant.id}/view`}
                                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                                            title="Ver Detalhes"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                        <Link
                                            href={`/master/tenants/${tenant.id}`}
                                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                                            title="Configurações"
                                        >
                                            <Settings className="w-4 h-4" />
                                        </Link>

                                        {/* Masquerade Button */}
                                        <MasqueradeButton tenantSlug={tenant.slug} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {tenants.length === 0 && (
                    <div className="py-20 text-center border-t border-zinc-900">
                        <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Nenhum cliente encontrado</p>
                    </div>
                )}
            </div>
        </div>
    );
}

