import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { TenantForm } from "@/components/tenants/TenantForm";

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

    const formattedTenant = {
        ...tenant,
        features: JSON.parse(tenant.features),
    };

    return (
        <div className="max-w-6xl mx-auto py-8">
            <TenantForm initialData={formattedTenant} isEditing={true} />
        </div>
    );
}
