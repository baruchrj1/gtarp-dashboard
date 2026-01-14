import TopNavigation from "@/components/TopNavigation";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { GlobalSearch } from "@/components/GlobalSearch";
import { getTenantFromRequest, toTenantContextValue } from "@/lib/tenant";
import { TenantProvider } from "@/contexts/TenantContext";
import { SuperAdminControls } from "@/components/admin/SuperAdminControls";
import { getServerSession } from "@/lib/auth";

export default async function TenantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const tenant = await getTenantFromRequest();
    const session = await getServerSession();
    const isSuperAdmin = (session?.user as any)?.isSuperAdmin === true;

    // CSS variables for dynamic colors - apply to a wrapper or use style tag in head via a client component if needed?
    // In RootLayout it was on HTML. Here we can't put it on HTML. 
    // We'll put it on a div wrapper that acts as the theme scope.
    const cssVariables = tenant
        ? {
            "--color-primary": tenant.primaryColor,
            "--color-secondary": tenant.secondaryColor,
        } as React.CSSProperties
        : {};

    const content = (
        <div style={cssVariables} className="min-h-screen flex flex-col">
            {/* Custom CSS Injection - Needs to be handled carefully. 
              Since we are inside <body>, <style> is valid but usually better in head.
              For now, we can leave it here or move it to a client component.
          */}
            {tenant?.customCss && (
                <style dangerouslySetInnerHTML={{ __html: tenant.customCss }} />
            )}

            <ServiceWorkerRegistration />
            <GlobalSearch />
            {/* Note: TopNavigation import needs to be adjusted if path changes, but @/ alias handles it */}
            <TopNavigation tenantLogo={tenant?.logo} tenantName={tenant?.name} isTenantContext={!!tenant} />

            <main className="flex-1 p-6 relative">
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('/noise.svg')] mix-blend-overlay"></div>
                {children}
            </main>
        </div>
    );

    if (tenant) {
        return (
            <TenantProvider tenant={toTenantContextValue(tenant)}>
                {content}
                {isSuperAdmin && <SuperAdminControls currentTenant={{ name: tenant.name, slug: tenant.slug }} />}
            </TenantProvider>
        );
    }

    return (
        <>
            {content}
            {isSuperAdmin && <SuperAdminControls currentTenant={null} />}
        </>
    );
}
