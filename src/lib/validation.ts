import { z } from "zod";

/**
 * Report creation validation schema
 */
export const createReportSchema = z.object({
    accusedId: z
        .string()
        .max(50, "ID do acusado muito longo")
        .optional()
        .or(z.literal("")),
    accusedName: z
        .string()
        .max(100, "Nome do acusado muito longo")
        .optional(),
    accusedFamily: z
        .string()
        .max(100, "Nome da organização muito longo")
        .optional(),
    reason: z
        .string()
        .min(1, "Motivo é obrigatório")
        .max(200, "Motivo muito longo"),
    description: z
        .string()
        .max(5000, "Descrição muito longa")
        .optional(),
    evidence: z.union([
        z.string().url("URL de evidência inválida").max(500, "URL muito longa"),
        z.array(z.string().url("URL de evidência inválida").max(500)).max(10, "Máximo 10 evidências"),
    ]),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;

/**
 * User ID validation
 */
export const userIdSchema = z
    .string()
    .min(1)
    .max(50)
    .regex(/^\d+$/, "ID de usuário inválido");

/**
 * Punishment notification schema
 */
export const punishmentNotifySchema = z.object({
    playerId: z.string().min(1).max(50),
    playerName: z.string().min(1).max(100),
    punishmentType: z.enum(["warning", "suspension", "reactivation", "custom"]),
    reason: z.string().min(1).max(500),
    customMessage: z.string().max(2000).optional(),
    duration: z.string().max(100).optional(),
});

/**
 * Validate and parse request body
 */
export async function validateBody<T>(
    request: Request,
    schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: z.ZodError }> {
    try {
        const body = await request.json();
        const data = schema.parse(body);
        return { success: true, data };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error };
        }
        throw error;
    }
}

/**
 * Format Zod errors for API response
 */
export function formatZodErrors(error: z.ZodError<unknown>): string[] {
    return error.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
}

/**
 * Report update schema (for admin)
 */
export const updateReportSchema = z.object({
    status: z.enum(["PENDING", "INVESTIGATING", "APPROVED", "REJECTED"]).optional(),
    adminNotes: z.string().max(2000).optional(),
    accusedFamily: z.string().max(100).optional(),
});

export type UpdateReportInput = z.infer<typeof updateReportSchema>;

/**
 * User role update schema
 */
export const updateUserRoleSchema = z.object({
    userId: z.string().min(1, "ID do usuário é obrigatório"),
    role: z.enum(["PLAYER", "EVALUATOR", "ADMIN"]).optional(),
    isAdmin: z.boolean().optional(),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

/**
 * Pagination query params schema
 */
export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(500).default(20),
    status: z.string().optional(),
    search: z.string().optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
