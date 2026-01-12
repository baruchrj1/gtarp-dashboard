/**
 * Verifica se a requisição está vindo do domínio permitido para super admin
 * Apenas gtarp-dashboard.vercel.app e localhost podem acessar funcionalidades de super admin
 */
export function isAllowedSuperAdminDomain(request: Request): boolean {
    const host = request.headers.get("host") || "";

    const allowedHosts = [
        "gtarp-dashboard.vercel.app",
        "localhost:3000",
        "localhost:3001",
        "127.0.0.1:3000",
        "127.0.0.1:3001"
    ];

    return allowedHosts.some(allowedHost => host.includes(allowedHost));
}

/**
 * Valida se o usuário é super admin E se está no domínio permitido
 */
export function validateSuperAdminAccess(session: any, request: Request): boolean {
    const isSuperAdmin = session?.user?.isSuperAdmin === true;
    const isAllowedDomain = isAllowedSuperAdminDomain(request);

    return isSuperAdmin && isAllowedDomain;
}
