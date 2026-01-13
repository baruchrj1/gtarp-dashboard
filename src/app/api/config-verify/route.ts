import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getTenantFromSupabase } from "@/lib/tenant";

export async function GET() {
    const headersList = await headers();
    const host = headersList.get("host") || "";
    
    const checks = {
        supabase: {
            configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET',
            hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        },
        database: {
            hasDatabaseUrl: !!process.env.DATABASE_URL,
            databaseUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) : 'none',
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
    
    const supabaseTenant = await getTenantFromSupabase(host);
    if (supabaseTenant) {
        tenantCheck = {
            status: 'resolved_from_supabase',
            tenant: {
                id: supabaseTenant.id,
                name: supabaseTenant.name,
                slug: supabaseTenant.slug,
                subdomain: supabaseTenant.subdomain,
                customDomain: supabaseTenant.customDomain,
                hasDatabaseUrl: !!supabaseTenant.databaseUrl,
                databaseUrlPrefix: supabaseTenant.databaseUrl ? supabaseTenant.databaseUrl.substring(0, 30) : 'none',
            },
        };
    }
    
    const overall = {
        status: supabaseTenant ? 'ok' : 'partial',
        checks,
        tenant: tenantCheck,
    };
    
    return NextResponse.json(overall);
}
