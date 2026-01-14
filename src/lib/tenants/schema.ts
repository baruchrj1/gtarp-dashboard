
import { z } from "zod";

// --- Zod Schemas ---

export const tenantFeaturesSchema = z.object({
    archive: z.boolean(),
    punishments: z.boolean(),
    discordNotify: z.boolean(),
});

export const createTenantSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas e hífens"),
    subdomain: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "Subdomain deve conter apenas letras minúsculas e hífens").optional(),
    // Branding
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida").optional().default("#7c3aed"),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida").optional().default("#4f46e5"),
    logo: z.string().url("URL do Logo inválida").optional().nullable(),
    favicon: z.string().url("URL do Favicon inválida").optional().nullable(),
    customDomain: z.string().optional().nullable(),
    // Discord
    discordGuildId: z.string().min(17, "Guild ID inválido"),
    discordClientId: z.string().min(17, "Client ID inválido"),
    discordClientSecret: z.string().min(10, "Client Secret inválido"),
    discordRoleAdmin: z.string().min(17, "Role Admin ID inválido"),
    discordRoleEvaluator: z.string().optional().nullable(),
    discordRolePlayer: z.string().optional().nullable(),
    // Config
    features: tenantFeaturesSchema.optional(),
    isActive: z.boolean().optional().default(true),
});

export const updateTenantSchema = createTenantSchema.partial().extend({
    features: tenantFeaturesSchema.partial().optional(),
});

// --- TypeScript Types ---

export type TenantFeatures = z.infer<typeof tenantFeaturesSchema>;
export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema> & {
    discordClientSecret?: string;
    discordRoleAdmin?: string;
    discordRoleEvaluator?: string;
    discordRolePlayer?: string;
};
