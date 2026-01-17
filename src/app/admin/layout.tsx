import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/auth";
import { getTenantFromRequest, toTenantContextValue } from "@/lib/tenant";
import { hasTenantRole } from "@/lib/permissions";
import { TenantProvider } from "@/contexts/TenantContext";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { AccessDenied } from "@/components/admin/AccessDenied";

import AdminHeader from "@/components/admin/AdminHeader";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession();

    if (!session) {
        redirect("/login");
    }

    const tenant = await getTenantFromRequest();

    // If no tenant, redirect to player dashboard (not "/" to avoid redirect loop with middleware)
    if (!tenant) {
        redirect("/player");
    }

    // Check Permissions
    const userRoles = session.user.discordRoles || [];
    const isAdmin = hasTenantRole(userRoles, tenant.discordRoleAdmin);
    const isEvaluator = hasTenantRole(userRoles, tenant.discordRoleEvaluator);

    // If user has NO access role for this tenant
    if (!isAdmin && !isEvaluator) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
                <AccessDenied
                    message={`Você não tem permissão para acessar o painel administrativo desta cidade.`}
                />
            </div>
        );
    }

    return (
        <TenantProvider tenant={toTenantContextValue(tenant)}>
            <div className="min-h-screen flex bg-background/50">
                <AdminSidebar />
                <main className="flex-1 lg:ml-64 min-h-screen transition-all duration-300">
                    <div className="p-4 md:p-8 pt-24 lg:pt-8 max-w-[1600px] mx-auto">
                        <AdminHeader />
                        {children}
                    </div>
                </main>
            </div>
        </TenantProvider>
    );
}

