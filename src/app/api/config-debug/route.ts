import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
    const headersList = await headers();
    
    return NextResponse.json({
        status: "debug",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        supabase: {
            configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT_SET',
        },
        database: {
            hasDatabaseUrl: !!process.env.DATABASE_URL,
            databaseUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) : 'none',
        },
        request: {
            host: headersList.get("host"),
            tenantSlug: headersList.get("x-tenant-slug"),
            userAgent: headersList.get("user-agent"),
        },
    });
}
