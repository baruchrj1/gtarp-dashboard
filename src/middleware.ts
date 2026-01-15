import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const pathname = req.nextUrl.pathname;
    const isLoggedIn = !!token;

    // Debug Logging
    if (process.env.NODE_ENV === "development") {
      // console.log(`[MIDDLEWARE] Path: ${pathname}, LoggedIn: ${isLoggedIn}`);
    }

    // --- 1. Public Routes (Always Allow) ---
    if (
      pathname === "/" ||
      pathname === "/login" ||
      pathname.startsWith("/api/") || // Allow all API, specific protection in API routes
      pathname.startsWith("/_next") ||
      pathname.startsWith("/static") ||
      pathname.includes(".") // Files like robots.txt, etc.
    ) {

      // But if on Login/Home and Logged In, redirect to dashboard
      if (isLoggedIn && (pathname === "/" || pathname === "/login")) {
        // Re-implement redirect logic
        const role = token?.role as string;
        const isAdmin = token?.isAdmin === true || role === "ADMIN";
        const isEvaluator = role === "EVALUATOR";
        const isSuperAdmin = (token as any)?.isSuperAdmin === true;
        const isMasquerading = !!req.cookies.get("x-super-admin-tenant")?.value;

        // 0. BOOTSTRAP MODE CHECK
        if (token?.tenantId === "system-bootstrap") {
          if (isSuperAdmin) {
            return NextResponse.redirect(new URL("/master", req.url));
          }
          // For others, let them see the page (likely login with error)
        }

        if (isSuperAdmin && !isMasquerading) {
          return NextResponse.redirect(new URL("/master", req.url));
        }

        if (isAdmin || isEvaluator || (isSuperAdmin && isMasquerading)) {
          return NextResponse.redirect(new URL("/admin", req.url));
        }

        return NextResponse.redirect(new URL("/player", req.url));
      }
      return NextResponse.next();
    }

    // --- 2. Protected Routes (Require Token) ---
    if (!token) {
      // Redirect to login
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    // --- 3. Role Based Access Control ---

    // Admin Routes
    if (pathname.startsWith("/admin")) {
      const allowed =
        token?.role === "ADMIN" ||
        token?.role === "EVALUATOR" ||
        token?.isAdmin ||
        (token as any)?.isSuperAdmin;

      if (!allowed) {
        return NextResponse.redirect(new URL("/player", req.url));
      }
    }

    // MASTER ROUTES (Super Admin Only)
    if (pathname.startsWith("/master")) {
      const isSuperAdmin = (token as any)?.isSuperAdmin === true;
      if (!isSuperAdmin) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // --- 4. Tenant Logic ---
    const host = req.headers.get("host") || "";
    let tenantSlug: string | null = null;
    const masqueradeCookie = req.cookies.get("x-super-admin-tenant");

    if (masqueradeCookie?.value) {
      tenantSlug = masqueradeCookie.value;
    } else {
      if (host.includes(".vercel.app")) { // or netlify from previous code? Adjusted to catch all
        if (host.startsWith("gtarp-dashboard")) {
          tenantSlug = "default";
        } else {
          tenantSlug = host.split(".")[0];
        }
      } else if (!host.includes("localhost") && !host.includes("127.0.0.1")) {
        tenantSlug = `custom:${host}`;
      }
    }

    const response = NextResponse.next();
    if (tenantSlug) {
      response.headers.set("x-tenant-slug", tenantSlug);
    }

    return response;

  } catch (error) {
    console.error("[MIDDLEWARE CRITICAL] Error:", error);
    // FAIL OPEN for public routes, but redirect to login with error for others?
    // Safest is to allow request to proceed (might 500 later if critical) or show generic error
    // For now, allow to proceed so we can see the actual page error if any, or Login page
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
