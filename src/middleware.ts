import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const isLoggedIn = !!token;

    // --- 1. Root and Login Redirection (If Logged In) ---
    // If user is logged in and visits login or home, send them to their dashboard
    if (isLoggedIn && (pathname === "/" || pathname === "/login")) {
      const role = token.role as string;
      const isAdmin = token.isAdmin === true || role === "ADMIN";
      const isEvaluator = role === "EVALUATOR";

      // Redirect Logic
      if (isAdmin || isEvaluator) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }

      return NextResponse.redirect(new URL("/player", req.url));
    }

    // --- 2. Protected Route Access Control ---

    // Admin Routes
    if (pathname.startsWith("/admin")) {
      const allowed = token?.role === "ADMIN" || token?.role === "EVALUATOR" || token?.isAdmin;
      if (!allowed) {
        // Redirect unauthorized access to player dashboard
        return NextResponse.redirect(new URL("/player", req.url));
      }
    }


    // Player Routes are accessible by everyone logged in (Admins might want to see their own reports)

    // --- 3. Tenant Logic (Preserved) ---
    const host = req.headers.get("host") || "";
    let tenantSlug: string | null = null;
    if (host.includes(".vercel.app") && !host.startsWith("gtarp-dashboard")) {
      tenantSlug = host.split(".")[0];
    } else if (!host.includes("localhost") && !host.includes("127.0.0.1")) {
      tenantSlug = `custom:${host}`;
    }

    const response = NextResponse.next();
    if (tenantSlug) response.headers.set("x-tenant-slug", tenantSlug);
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
