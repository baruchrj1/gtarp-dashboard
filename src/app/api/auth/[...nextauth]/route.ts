import NextAuth from "next-auth";
import { headers } from "next/headers";
import {
    buildAuthOptions,
    fallbackAuthOptions,
} from "@/lib/auth";
import { getTenantFromRequest } from "@/lib/tenant";

/**
 * Build the NextAuth handler for the current tenant.
 * This resolves the tenant from request headers and uses
 * tenant-specific Discord OAuth credentials from the database.
 */
async function getHandler() {
    // Resolve the tenant using the unified, cached function
    const tenant = await getTenantFromRequest();

    if (!tenant) {
        console.error(`[AUTH] No tenant found via getTenantFromRequest`);
        // Use fallback options which will block sign in
        return NextAuth(fallbackAuthOptions);
    }

    console.log(`[AUTH] Using tenant: ${tenant.name} (${tenant.subdomain}) - Client ID: ${tenant.discordClientId.substring(0, 10)}...`);

    // Build dynamic auth options with tenant credentials
    const authOptions = buildAuthOptions(tenant);
    return NextAuth(authOptions);
}

// Export the handler for both GET and POST methods
// NextAuth in App Router expects direct NextAuth() call, not a function
export async function GET(request: Request) {
    const handler = await getHandler();
    return handler(request, { params: { nextauth: request.url.split('/api/auth/')[1]?.split('?')[0]?.split('/') || [] } });
}

export async function POST(request: Request) {
    const handler = await getHandler();
    return handler(request, { params: { nextauth: request.url.split('/api/auth/')[1]?.split('?')[0]?.split('/') || [] } });
}
