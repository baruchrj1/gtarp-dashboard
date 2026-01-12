import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTenantFromRequest } from "@/lib/tenant";
import { hasTenantRole } from "@/lib/permissions";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const tenant = await getTenantFromRequest();

    // If no tenant (globally accessing admin?), allow only Super Admin
    if (!tenant) {
        if (session.user.isSuperAdmin) {
            redirect("/superadmin");
        }
        redirect("/");
    }

    // Super Admin Bypass
    if (session.user.isSuperAdmin) {
        return <>{children}</>;
    }

    // Check Permissions
    const userRoles = session.user.discordRoles || [];
    const isAdmin = hasTenantRole(userRoles, tenant.discordRoleAdmin);
    const isEvaluator = hasTenantRole(userRoles, tenant.discordRoleEvaluator);

    // If user has NO access role for this tenant
    if (!isAdmin && !isEvaluator) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
                <div className="w-24 h-24 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center justify-center mb-6 animate-pulse">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold mb-2 font-display uppercase tracking-wide text-zinc-900 dark:text-white">Acesso Negado</h2>
                <div className="text-zinc-500 max-w-md text-center mb-8">
                    <p className="mb-2">Você não tem permissão para acessar o painel administrativo desta cidade.</p>
                    <p className="text-sm text-zinc-600">Tenant: {tenant.name}</p>
                </div>
                <Link
                    href="/"
                    className="px-6 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-zinc-900 dark:text-white transition-colors"
                >
                    Voltar ao Início
                </Link>
            </div>
        );
    }

    return <>{children}</>;
}
