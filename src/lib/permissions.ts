import { Session } from "next-auth";

/**
 * Centralized permission checks for the application
 */

export function isAuthenticated(session: Session | null): boolean {
    return !!session?.user;
}

export function isAdmin(session: Session | null): boolean {
    if (!session?.user) return false;
    return session.user.role === "ADMIN" || session.user.isAdmin === true;
}

export function isEvaluator(session: Session | null): boolean {
    if (!session?.user) return false;
    return session.user.role === "EVALUATOR";
}

export function isEvaluatorOrHigher(session: Session | null): boolean {
    if (!session?.user) return false;
    return (
        session.user.role === "ADMIN" ||
        session.user.role === "EVALUATOR" ||
        session.user.isAdmin === true
    );
}

export function isStaff(session: Session | null): boolean {
    return isEvaluatorOrHigher(session);
}

/**
 * Authorization error responses
 */
export const AuthErrors = {
    UNAUTHENTICATED: { error: "Unauthorized", status: 401 },
    FORBIDDEN: { error: "Acesso negado", status: 403 },
    ADMIN_REQUIRED: { error: "Acesso negado. Apenas administradores.", status: 403 },
    STAFF_REQUIRED: { error: "Acesso negado. Apenas staff.", status: 403 },
} as const;

export function hasTenantRole(userRoles: string[] | undefined, requiredRolesCsv: string | null | undefined): boolean {
    if (!requiredRolesCsv) return false;
    if (!userRoles || userRoles.length === 0) return false;

    // Split CSV and clean whitespaces
    const requiredRoles = requiredRolesCsv.split(',').map(r => r.trim());

    // Check if user has ANY of the required roles
    return requiredRoles.some(required => userRoles.includes(required));
}
