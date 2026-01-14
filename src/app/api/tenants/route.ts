
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma"; // Direct prisma access
import { createTenantSchema } from "@/lib/tenants/schema";
import { z } from "zod";

// GET - List all tenants
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!(session?.user as any)?.isSuperAdmin) {
            return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
        }

        const tenants = await prisma.tenant.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { users: true, reports: true },
                },
            },
        });

        const formattedTenants = tenants.map(t => ({
            ...t,
            features: JSON.parse(t.features), // Parse JSON
        }));

        return NextResponse.json(formattedTenants);
    } catch (error) {
        console.error("Erro ao listar tenants:", error);
        return NextResponse.json(
            { message: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

// POST - Create new tenant
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!(session?.user as any)?.isSuperAdmin) {
            return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
        }

        const body = await req.json();
        const data = createTenantSchema.parse(body);

        const existing = await prisma.tenant.findUnique({
            where: { slug: data.slug },
        });

        if (existing) {
            return NextResponse.json({ message: "Slug já está em uso" }, { status: 400 });
        }

        const tenant = await prisma.tenant.create({
            data: {
                name: data.name,
                slug: data.slug,
                subdomain: data.subdomain || data.slug, // Fallback to slug if subdomain empty
                customDomain: data.customDomain,
                discordGuildId: data.discordGuildId,
                discordClientId: data.discordClientId,
                discordClientSecret: data.discordClientSecret,
                discordRoleAdmin: data.discordRoleAdmin,
                discordRoleEvaluator: data.discordRoleEvaluator,
                discordRolePlayer: data.discordRolePlayer,
                primaryColor: data.primaryColor ?? "#6366f1",
                secondaryColor: data.secondaryColor ?? "#4f46e5",
                logo: data.logo,
                favicon: data.favicon,
                features: JSON.stringify(data.features || {
                    archive: true,
                    punishments: true,
                    discordNotify: true,
                }),
                isActive: data.isActive ?? true,
            },
        });

        // Simplified: No Netlify Deploy logic. Just DB creation.
        // Unification objective: unified dashboard handles all tenants via Middleware.

        return NextResponse.json({
            ...tenant,
            features: JSON.parse(tenant.features)
        }, { status: 201 });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Dados inválidos", errors: error.issues },
                { status: 400 }
            );
        }

        console.error("Erro ao criar tenant:", error);
        return NextResponse.json(
            { message: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
