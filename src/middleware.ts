import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Dominios que sao do painel super admin (voce)
const SUPER_ADMIN_DOMAINS = [
  "localhost",
  "admin.suaplataforma.com", // Altere para seu dominio
  "suaplataforma.com",
];

// Extrai o slug do tenant a partir do dominio
function getTenantSlug(hostname: string): string | null {
  // Remove porta (para desenvolvimento local)
  const domain = hostname.split(":")[0];

  // Se for dominio de super admin, nao tem tenant
  if (SUPER_ADMIN_DOMAINS.some(d => domain === d || domain.endsWith(`.${d}`))) {
    return null;
  }

  // Subdominio: cliente.suaplataforma.com
  const platformDomain = "suaplataforma.com"; // Altere para seu dominio
  if (domain.endsWith(`.${platformDomain}`)) {
    return domain.replace(`.${platformDomain}`, "");
  }

  // Dominio customizado: busca pelo dominio completo
  // Isso sera resolvido depois via API/banco
  return `custom:${domain}`;
}

export default withAuth(
  async function middleware(req) {
    const hostname = req.headers.get("host") || "localhost";
    const tenantSlug = getTenantSlug(hostname);
    const pathname = req.nextUrl.pathname;

    // Clone response para adicionar headers
    const response = NextResponse.next();

    // Rotas de super admin (seu painel de gerenciamento)
    if (pathname.startsWith("/superadmin")) {
      // Verifica se e super admin
      const token = req.nextauth.token;
      const isSuperAdmin = token?.isSuperAdmin === true;

      if (!isSuperAdmin) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      return response;
    }

    // Se nao tem tenant e nao e super admin, redireciona
    if (!tenantSlug && !pathname.startsWith("/superadmin")) {
      // Se esta no dominio principal, mostra landing page ou redireciona
      if (pathname === "/") {
        return response; // Landing page publica
      }
      // Outras rotas sem tenant = erro
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Adiciona tenant slug no header para uso nas paginas
    if (tenantSlug) {
      response.headers.set("x-tenant-slug", tenantSlug);
    }

    const token = req.nextauth.token;
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

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Rotas publicas (nao precisam de auth)
        if (pathname === "/" || pathname.startsWith("/api/auth")) {
          return true;
        }

        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes que nao precisam de tenant check
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
