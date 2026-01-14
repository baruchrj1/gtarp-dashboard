
import { prisma } from "@/lib/prisma";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT";
export type AuditEntity = "TENANT" | "SETTINGS" | "SESSION" | "NETLIFY_DEPLOY";

interface LogAuditParams {
    action: AuditAction;
    entity: AuditEntity;
    entityId?: string;
    details?: Record<string, any>;
    adminId: string;
    adminEmail: string;
}

export const AuditService = {
    async log(params: LogAuditParams) {
        return prisma.auditLog.create({
            data: {
                action: params.action,
                entity: params.entity,
                entityId: params.entityId,
                details: params.details ? JSON.stringify(params.details) : null,
                adminId: params.adminId,
                adminEmail: params.adminEmail,
            }
        });
    },

    async getRecentLogs(limit = 50) {
        const logs = await prisma.auditLog.findMany({
            orderBy: { createdAt: "desc" },
            take: limit,
            include: {
                admin: {
                    select: { name: true, email: true }
                }
            }
        });
        return logs;
    },

    async getLogsByEntity(entity: AuditEntity, entityId: string) {
        const logs = await prisma.auditLog.findMany({
            where: { entity, entityId },
            orderBy: { createdAt: "desc" },
            include: {
                admin: {
                    select: { name: true, email: true }
                }
            }
        });
        return logs;
    }
};
