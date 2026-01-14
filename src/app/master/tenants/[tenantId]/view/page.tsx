
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, Shield, Users, Globe, Activity } from "lucide-react";
import Link from "next/link";

interface PageProps {
    params: Promise<{
        tenantId: string;
    }>;
}

export default async function TenantViewPage({ params }: PageProps) {
    const { tenantId } = await params;

    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
    });

    if (!tenant) {
        notFound();
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/master/tenants"
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-white uppercase tracking-tight">Detalhes do Cliente</h1>
                    <p className="text-zinc-500 text-xs mt-0.5">Visualizando: <span className="text-zinc-300">{tenant.name}</span></p>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0A0A0A] border border-zinc-800 rounded-lg p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-zinc-400">
                        <Shield className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Identificação</span>
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white">{tenant.name}</div>
                        <div className="text-xs text-zinc-500 font-mono mt-1">{tenant.id}</div>
                    </div>
                </div>

                <div className="bg-[#0A0A0A] border border-zinc-800 rounded-lg p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-zinc-400">
                        <Globe className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Domínio & Slug</span>
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white">{tenant.subdomain}.vercel.app</div>
                        <div className="text-xs text-zinc-500 mt-1">/{tenant.slug}</div>
                    </div>
                </div>

                <div className="bg-[#0A0A0A] border border-zinc-800 rounded-lg p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-zinc-400">
                        <Activity className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Status</span>
                    </div>
                    <div>
                        {tenant.isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/30 border border-emerald-900/50 text-emerald-500 text-xs font-bold uppercase tracking-wide">
                                Operacional
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/30 border border-red-900/50 text-red-500 text-xs font-bold uppercase tracking-wide">
                                Inativo
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Additional Info / JSON Dump for Debug */}
            <div className="bg-[#0A0A0A] border border-zinc-800 rounded-lg p-6">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Dados Técnicos</h3>
                <pre className="bg-black/50 p-4 rounded border border-zinc-900 overflow-x-auto text-[10px] text-zinc-400 font-mono">
                    {JSON.stringify(tenant, null, 2)}
                </pre>
            </div>
        </div>
    );
}
