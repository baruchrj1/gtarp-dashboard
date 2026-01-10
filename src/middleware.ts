import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = token?.role === "ADMIN" || token?.isAdmin === true;
    const isEvaluator = token?.role === "EVALUATOR";
    const isPlayer = token?.role === "PLAYER";

    const pathname = req.nextUrl.pathname;

    // Redirect legacy /reports/new to /player/new
    if (pathname === "/reports/new") {
      return NextResponse.redirect(new URL("/player/new", req.url));
    }

    // Redirect players trying to access admin routes
    if (pathname.startsWith("/admin") && !isAdmin && !isEvaluator) {
      return NextResponse.redirect(new URL("/player", req.url));
    }

    // Redirect admins/evaluators trying to access player routes
    if (pathname.startsWith("/player") && (isAdmin || isEvaluator)) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // Protect player routes - only players can access
    if (pathname.startsWith("/player") && !isPlayer && !isAdmin && !isEvaluator) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/player/:path*", "/reports/new"],
};
