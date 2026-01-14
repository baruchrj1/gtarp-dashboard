
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { TenantSettingsForm } from "../../../../components/master/TenantSettingsForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
    params: Promise<{
        tenantId: string;
    }>;
}

export default async function TenantSettingsPage({ params }: PageProps) {
    const { tenantId } = await params;

    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
    });

    if (!tenant) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/master/tenants"
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-white uppercase tracking-tight">Configurações do Cliente</h1>
                    <p className="text-zinc-500 text-xs mt-0.5">Editando: <span className="text-zinc-300">{tenant.name}</span></p>
                </div>
            </div>

            <div className="bg-[#0A0A0A] border border-zinc-800 rounded-lg p-6 max-w-3xl">
                <TenantSettingsForm tenant={tenant} />
            </div>
        </div>
    );
}
