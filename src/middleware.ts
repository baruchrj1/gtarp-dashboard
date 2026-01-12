import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // DEBUG LOGGING
    if (pathname.startsWith("/admin") || pathname.startsWith("/player")) {
      console.log(`[MIDDLEWARE] Path: ${pathname}`);
      console.log(`[MIDDLEWARE] Token Role: ${token?.role}`);
      console.log(`[MIDDLEWARE] Is Admin: ${token?.isAdmin}`);
      console.log(`[MIDDLEWARE] Is SuperAdmin: ${token?.isSuperAdmin}`);
      console.log(`[MIDDLEWARE] Email: ${token?.email}`);
    }

    // Super admin routes - verificar se e super admin E se esta no dominio correto
    if (pathname.startsWith("/superadmin")) {
      const isSuperAdmin = token?.isSuperAdmin === true;
      const host = req.headers.get("host") || "";

      // Permitir apenas no dominio principal (gtarp-dashboard.vercel.app) ou localhost
      const allowedHosts = [
        "gtarp-dashboard.vercel.app",
        "localhost:3000",
        "localhost:3001",
        "127.0.0.1:3000",
        "127.0.0.1:3001"
      ];

      const isAllowedDomain = allowedHosts.some(allowedHost => host.includes(allowedHost));

      if (!isSuperAdmin || !isAllowedDomain) {
        console.log("[MIDDLEWARE] Blocking SuperAdmin access. isSuperAdmin:", isSuperAdmin, "isAllowedDomain:", isAllowedDomain);
        // Redireciona para home se nao for super admin OU se nao estiver no dominio permitido
        return NextResponse.redirect(new URL("/", req.url));
      }

      return NextResponse.next();
    }

    // Logica de roles para admin/player
    const isAdmin = token?.role === "ADMIN" || token?.isAdmin === true;
    const isEvaluator = token?.role === "EVALUATOR";
    const isPlayer = token?.role === "PLAYER";
    const isSuperAdmin = token?.isSuperAdmin === true || token?.role === "SUPER_ADMIN";

    // Redirect legacy /reports/new to /player/new
    if (pathname === "/reports/new") {
      return NextResponse.redirect(new URL("/player/new", req.url));
    }

    // Redirect players trying to access admin routes
    if (pathname.startsWith("/admin") && !isAdmin && !isEvaluator && !isSuperAdmin) {
      console.log("[MIDDLEWARE] Redirecting Unauthorized Access to Admin -> Player");
      return NextResponse.redirect(new URL("/player", req.url));
    }

    // Redirect admins/evaluators trying to access player routes
    // EXCEPT for SUPER_ADMIN who should be able to see everything
    // MOVED: Allow Admins/Evaluators to access player dashboard if they want (e.g. to make a report themselves)
    /* if (pathname.startsWith("/player") && (isAdmin || isEvaluator) && !isSuperAdmin) {
      console.log("[MIDDLEWARE] Redirecting Admin on Player path -> Admin");
      return NextResponse.redirect(new URL("/admin", req.url));
    } */

    // Protect player routes - only players can access (and admins/superadmins now implied allowed or handled above)
    // Se não é player, nem admin, nem avaliador, ta fora.
    if (pathname.startsWith("/player") && !token) {
      console.log("[MIDDLEWARE] Redirecting Unauthenticated on Player path -> Home");
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Parse Tenant Slug from Host (Critical for Vercel Multi-tenant)
    const host = req.headers.get("host") || "";
    let tenantSlug: string | null = null;

    // Logic to extract slug/subdomain
    // 1. Localhost -> handled by tenant.ts fallback (tenantSlug remains null)
    // 2. Vercel Domains (e.g. painel-client-1.vercel.app)
    if (host.includes(".vercel.app")) {
      const subdomain = host.split(".")[0];
      // If not the main project domain 'gtarp-dashboard', assume it's a tenant
      if (subdomain !== "gtarp-dashboard") {
        tenantSlug = subdomain;
      }
    }
    // 3. Custom Domains (not localhost, not vercel.app)
    // Assuming anything else is a custom domain
    else if (!host.includes("localhost") && !host.includes("127.0.0.1")) {
      tenantSlug = `custom:${host}`;
    }

    if (tenantSlug) {
      console.log(`[MIDDLEWARE] Detected Tenant Slug: ${tenantSlug}`);
    }

    // Forward the header
    const response = NextResponse.next();
    if (tenantSlug) {
      response.headers.set("x-tenant-slug", tenantSlug);
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Rotas publicas que nao precisam de autenticacao
        if (
          pathname === "/" ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/protocols") ||
          pathname.startsWith("/_next") ||
          pathname.startsWith("/favicon") ||
          pathname.includes(".")
        ) {
          return true;
        }

        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/player/:path*",
    "/superadmin/:path*",
    "/reports/new",
  ],
};
