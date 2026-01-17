import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { getTenantFromRequest, toTenantContextValue } from "@/lib/tenant";
import { TenantProvider } from "@/contexts/TenantContext";
import PlayerSidebar from "@/components/player/PlayerSidebar";
import PlayerHeader from "@/components/player/PlayerHeader";

export const dynamic = "force-dynamic";

export default async function PlayerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession();

    if (!session) {
        redirect("/login");
    }

    const tenant = await getTenantFromRequest();

    // If no tenant, redirect to home (or error page, but home is safer)
    if (!tenant) {
        redirect("/");
    }

    return (
        <TenantProvider tenant={toTenantContextValue(tenant)}>
            <div className="min-h-screen flex bg-background/50 overflow-x-hidden">
                <PlayerSidebar />
                <main className="flex-1 lg:ml-64 min-h-screen transition-all duration-300 flex flex-col w-full">
                    <div className="p-4 md:p-8 pt-24 lg:pt-8 max-w-[1600px] mx-auto w-full">
                        <PlayerHeader />
                        {children}
                    </div>
                </main>
            </div>
        </TenantProvider>
    );
}
