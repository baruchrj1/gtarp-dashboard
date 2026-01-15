import NextAuth from "next-auth/next";
import {
    buildAuthOptions,
    fallbackAuthOptions,
} from "@/lib/auth";
import { getTenantFromRequest } from "@/lib/tenant";

/**
 * Build the NextAuth handler for the current tenant.
 * Note: NextAuth(options) returns { GET, POST } in App Router.
 */
async function getAuthHandlers() {
    // Resolve the tenant using the unified, cached function
    const tenant = await getTenantFromRequest();

    if (!tenant) {
        console.warn(`[AUTH] No tenant found - using fallback options`);
        return NextAuth(fallbackAuthOptions);
    }

    console.log(`[AUTH] Using tenant: ${tenant.name} (${tenant.subdomain})`);

    // Build dynamic auth options with tenant credentials
    const authOptions = buildAuthOptions(tenant);
    return NextAuth(authOptions);
}

// Params type for Next.js 15
type RouteContext = { params: Promise<{ nextauth: string[] }> };

export async function GET(request: Request, context: RouteContext) {
    const handlers = await getAuthHandlers();
    return handlers.GET(request, context as any);
}

export async function POST(request: Request, context: RouteContext) {
    const handlers = await getAuthHandlers();
    return handlers.POST(request, context as any);
}
