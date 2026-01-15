import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const pathname = req.nextUrl.pathname;

    // --- 1. Public Routes ---
    if (
      pathname === "/" ||
      pathname === "/login" ||
      pathname === "/access-denied" ||
      pathname === "/auth-reset" ||
      pathname === "/debug-auth" || // Debug Page
      pathname.startsWith("/api/auth") || // Key: Auth API must be public
      pathname.startsWith("/_next") ||
      pathname.startsWith("/static") ||
      pathname.includes(".")
    ) {
      // But if on Login/Home and Logged In, redirect to dashboard automatically
      if (token && (pathname === "/" || pathname === "/login")) {
        const role = token.role as string;
        const isSuperAdmin = (token as any).isSuperAdmin === true;

        if (isSuperAdmin) return NextResponse.redirect(new URL("/master", req.url));
        if (role === "ADMIN" || role === "EVALUATOR") return NextResponse.redirect(new URL("/admin", req.url));
        return NextResponse.redirect(new URL("/player", req.url));
      }
      return NextResponse.next();
    }

    // --- 2. Protection Gate ---
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    // --- 3. Role Access Control ---

    // Master Panel (Super Admin ONLY)
    if (pathname.startsWith("/master")) {
      const isSuperAdmin = (token as any).isSuperAdmin === true;
      if (!isSuperAdmin) {
        return NextResponse.redirect(new URL("/access-denied", req.url));
      }
    }

    // Admin Panel (Admin or Evaluator)
    if (pathname.startsWith("/admin")) {
      const role = token.role as string;
      const isSuperAdmin = (token as any).isSuperAdmin === true;
      const hasAccess = isSuperAdmin || role === "ADMIN" || role === "EVALUATOR";

      if (!hasAccess) {
        return NextResponse.redirect(new URL("/access-denied", req.url));
      }
    }

    // --- 4. Tenant Header Injection (for multitenancy) ---
    const response = NextResponse.next();

    // Simple Host extraction for Tenant ID
    const host = req.headers.get("host") || "";
    let tenantSlug = "default"; // Default to default

    if (host.includes(".vercel.app")) {
      if (!host.startsWith("gtarp-dashboard")) {
        tenantSlug = host.split(".")[0];
      }
    } else if (!host.includes("localhost") && !host.includes("127.0.0.1")) {
      tenantSlug = `custom:${host}`;
    }

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
