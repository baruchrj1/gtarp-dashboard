import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const pathname = req.nextUrl.pathname;

    // =========================================================
    // 1. PUBLIC ROUTES (No Auth Required)
    // =========================================================
    // These routes are always accessible.
    // If a user IS logged in and tries to access /login or /, we will redirect them.
    const isPublicRoute =
      pathname === "/" ||
      pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/access-denied" ||
      pathname === "/auth-reset" ||
      pathname === "/privacy" ||
      pathname === "/terms" ||
      pathname.startsWith("/api/") || // Allow all API routes to handle their own auth (or be public)
      pathname.startsWith("/_next") ||
      pathname.startsWith("/static") ||
      pathname.includes(".");

    if (isPublicRoute) {
      // EDGE CASE: If user is ALREADY logged in and visits Login page, send them to dashboard
      if (token && (pathname === "/login" || pathname === "/register" || pathname === "/")) {
        const role = token.role as string;
        const isSuperAdmin = (token as any).isSuperAdmin === true;

        if (isSuperAdmin) return NextResponse.redirect(new URL("/master", req.url));
        if (role === "ADMIN" || role === "EVALUATOR") return NextResponse.redirect(new URL("/admin", req.url));
        return NextResponse.redirect(new URL("/player", req.url));
      }
      return NextResponse.next();
    }

    // =========================================================
    // 2. PROTECTED ROUTES (Auth Required)
    // =========================================================

    // 2.1 Check Authentication
    if (!token) {
      // User is not logged in, redirect to login
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", encodeURI(req.url));
      return NextResponse.redirect(url);
    }

    // 2.2 Access Control (RBAC)
    const role = token.role as string;
    const isSuperAdmin = (token as any).isSuperAdmin === true;

    // PROTECT: /master (Super Admin Only)
    if (pathname.startsWith("/master")) {
      if (!isSuperAdmin) {
        return NextResponse.redirect(new URL("/access-denied", req.url));
      }
    }

    // PROTECT: /admin (Admin/Evaluator Only)
    if (pathname.startsWith("/admin")) {
      if (!isSuperAdmin && role !== "ADMIN" && role !== "EVALUATOR") {
        return NextResponse.redirect(new URL("/access-denied", req.url));
      }
    }

    // =========================================================
    // 3. TENANT CONTEXT INJECTION
    // =========================================================
    const response = NextResponse.next();
    const host = req.headers.get("host") || "";
    let tenantSlug = "default";

    // Extract tenant from Host
    if (host.includes(".vercel.app")) {
      // subdomain.vercel.app logic
      if (!host.startsWith("gtarp-dashboard")) {
        tenantSlug = host.split(".")[0];
      }
    } else if (!host.includes("localhost") && !host.includes("127.0.0.1")) {
      // Custom domain logic
      tenantSlug = `custom:${host}`;
    }

    // Inject header for layout/page to use
    response.headers.set("x-tenant-slug", tenantSlug);
    return response;

  } catch (error) {
    console.error("[MIDDLEWARE ERROR]", error);
    return NextResponse.next(); // Fail open or redirect to error page
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
