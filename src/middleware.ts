import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const isLoggedIn = !!token;

    // Debug Logging (Disabled for performance)
    // if (process.env.NODE_ENV === "development" && isLoggedIn) {
    //   console.log("[MIDDLEWARE DEBUG] Token:", ...);
    // }

    // --- 1. Root and Login Redirection (If Logged In) ---
    // If user is logged in and visits login or home, send them to their dashboard
    if (isLoggedIn && (pathname === "/" || pathname === "/login")) {
      const role = token.role as string;
      const isAdmin = token.isAdmin === true || role === "ADMIN";
      const isEvaluator = role === "EVALUATOR";
      const isSuperAdmin = (token as any)?.isSuperAdmin === true;

      // Check for Masquerade Cookie
      const masqueradeCookie = req.cookies.get("x-super-admin-tenant");
      const isMasquerading = !!masqueradeCookie?.value;

      // Redirect Logic
      // Only force Master if Super Admin is NOT masquerading
      if (isSuperAdmin && !isMasquerading) {
        return NextResponse.redirect(new URL("/master", req.url));
      }

      // If masquerading (or normal admin), go to Admin panel
      if (isAdmin || isEvaluator || (isSuperAdmin && isMasquerading)) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }

      return NextResponse.redirect(new URL("/player", req.url));
    }

    // --- 2. Protected Route Access Control ---

    // Admin Routes
    if (pathname.startsWith("/admin")) {
      const allowed =
        token?.role === "ADMIN" ||
        token?.role === "EVALUATOR" ||
        token?.isAdmin ||
        (token as any)?.isSuperAdmin; // Super Admins always allowed

      if (!allowed) {
        // Redirect unauthorized access to player dashboard
        return NextResponse.redirect(new URL("/player", req.url));
      }
    }

    // MASTER ROUTES (Super Admin Only)
    if (pathname.startsWith("/master")) {
      // Check for Super Admin flag in token
      // Note: token.isSuperAdmin was added in auth.ts jwt callback
      const isSuperAdmin = (token as any)?.isSuperAdmin === true;
      if (!isSuperAdmin) {
        console.log("[MIDDLEWARE] Access to /master denied. Not a Super Admin.");
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }


    // Player Routes are accessible by everyone logged in (Admins might want to see their own reports)

    // --- 3. Tenant Logic (Multi-tenant support) ---
    // Extract subdomain from host to identify tenant
    const host = req.headers.get("host") || "";
    let tenantSlug: string | null = null;

    // MASQUERADE FEATURE (Super Admin)
    const masqueradeCookie = req.cookies.get("x-super-admin-tenant");
    if (masqueradeCookie?.value) {
      tenantSlug = masqueradeCookie.value;
      if (process.env.NODE_ENV === "development") {
        console.log(`[MIDDLEWARE] Masquerade Active: Forcing tenant to ${tenantSlug}`);
      }
    } else {
      // Normal Resolution
      // Netlify subdomain pattern: {subdomain}.netlify.app
      if (host.includes(".netlify.app")) {
        // MAIN DOMAIN - use default tenant
        if (host.startsWith("gtarp-dashboard")) {
          tenantSlug = "default";
        }
        // SUBDOMAIN - extract first part
        else {
          tenantSlug = host.split(".")[0];
        }
      }
      // Custom domain (not localhost)
      else if (!host.includes("localhost") && !host.includes("127.0.0.1")) {
        tenantSlug = `custom:${host}`;
      }
    }

    // Debug logging in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[MIDDLEWARE] Host: ${host}, Tenant Slug: ${tenantSlug || "none (dev fallback)"}`);
    }

    const response = NextResponse.next();

    // Always set the tenant header if we have a slug
    if (tenantSlug) {
      response.headers.set("x-tenant-slug", tenantSlug);
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Always allow public paths regardless of auth status
        if (
          pathname === "/" ||
          pathname === "/login" ||
          pathname.startsWith("/api/") || // Allow all API, specific protection in API routes
          pathname.startsWith("/_next") ||
          pathname.startsWith("/static") ||
          pathname.includes(".") // Files like robots.txt, etc.
        ) {
          return true;
        }

        // For all other routes (matched by config), require token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
