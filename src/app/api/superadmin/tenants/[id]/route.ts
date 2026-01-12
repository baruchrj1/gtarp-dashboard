import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { validateSuperAdminAccess } from "@/lib/superadmin-auth";

// Schema de validacao para atualizacao (partial)
const updateTenantSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
    slug: z
        .string()
        .min(2)
        .max(50)
        .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minusculas, numeros e hifens")
        .optional(),
    discordGuildId: z.string().min(17, "Guild ID invalido").optional(),
    discordClientId: z.string().min(17, "Client ID invalido").optional(),
    discordClientSecret: z.string().min(10, "Client Secret invalido").optional(),
    discordRoleAdmin: z.string().min(17, "Role ID invalido").optional(),
    discordRoleEvaluator: z.string().optional(),
    discordRolePlayer: z.string().optional(),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    isActive: z.boolean().optional(),
});

// GET - Busca do tenant por ID (usa params dinamicamente)
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await context.params;

        if (!validateSuperAdminAccess(session, req)) {
            return NextResponse.json({ message: "Nao autorizado" }, { status: 403 });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        users: true,
                        reports: true,
                    },
                },
            },
        });

        if (!tenant) {
            return NextResponse.json({ message: "Tenant nao encontrado" }, { status: 404 });
        }

        return NextResponse.json(tenant);
    } catch (error) {
        console.error("Erro ao buscar tenant:", error);
        return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
    }
}

// PATCH - Atualiza um tenant
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await context.params;

        if (!validateSuperAdminAccess(session, req)) {
            return NextResponse.json({ message: "Nao autorizado" }, { status: 403 });
        }

        const body = await req.json();
        const validatedData = updateTenantSchema.parse(body);

        // Se estiver atualizando o slug, verificar duplicidade
        if (validatedData.slug) {
            const existingTenant = await prisma.tenant.findUnique({
                where: { slug: validatedData.slug },
            });

            if (existingTenant && existingTenant.id !== id) {
                return NextResponse.json(
                    { message: "Ja existe um tenant com esse slug" },
                    { status: 400 }
                );
            }
        }

        const tenant = await prisma.tenant.update({
            where: { id },
            data: {
                ...validatedData,
                subdomain: validatedData.slug, // Mantem subdomain igual ao slug por padrao
            },
        });

        return NextResponse.json(tenant);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: error.issues[0].message },
                { status: 400 }
            );
        }
        console.error("Erro ao atualizar tenant:", error);
        return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
    }
}

// DELETE - Remove um tenant
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await context.params;

        if (!validateSuperAdminAccess(session, req)) {
            return NextResponse.json({ message: "Nao autorizado" }, { status: 403 });
        }

        await prisma.tenant.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Tenant removido com sucesso" });
    } catch (error) {
        console.error("Erro ao deletar tenant:", error);
        return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
    }
}
