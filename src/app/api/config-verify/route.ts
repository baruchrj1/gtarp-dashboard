import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getTenantFromRequest } from "@/lib/tenant";

export async function GET() {
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const checks = {
        supabase: {
            configured: "DEPRECATED - USING PRISMA",
            url: "N/A",
            hasServiceKey: "N/A",
        },
        database: {
            hasDatabaseUrl: !!process.env.DATABASE_URL,
            databaseUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) : 'none',
        },
        env: {
            hasSuperAdminIds: !!process.env.SUPER_ADMIN_IDS,
            hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        },
        request: {
            host,
            userAgent: headersList.get("user-agent"),
        },
    };

    let tenantCheck = {
        status: 'not_resolved',
        tenant: null as any,
    };

    const tenant = await getTenantFromRequest();
    if (tenant) {
        tenantCheck = {
            status: 'resolved',
            tenant: {
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
                subdomain: tenant.subdomain,
                customDomain: tenant.customDomain,
            },
        };
    }

    const overall = {
        status: tenant ? 'ok' : 'partial',
        checks,
        tenant: tenantCheck,
    };

    return NextResponse.json(overall);
}
