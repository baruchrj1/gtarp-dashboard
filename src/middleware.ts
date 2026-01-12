import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

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
        // Redireciona para home se nao for super admin OU se nao estiver no dominio permitido
        return NextResponse.redirect(new URL("/", req.url));
      }

      return NextResponse.next();
    }

    // Logica de roles para admin/player
    const isAdmin = token?.role === "ADMIN" || token?.isAdmin === true;
    const isEvaluator = token?.role === "EVALUATOR";
    const isPlayer = token?.role === "PLAYER";

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
