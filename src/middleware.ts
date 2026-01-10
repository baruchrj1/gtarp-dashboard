import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = token?.role === "ADMIN" || token?.isAdmin === true;
    const isEvaluator = token?.role === "EVALUATOR";

    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith("/admin") && !isAdmin && !isEvaluator) {
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
  matcher: ["/admin/:path*", "/reports/new"],
};
