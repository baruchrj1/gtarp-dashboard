import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { validateSuperAdminAccess } from "@/lib/superadmin-auth";

// Schema de validacao
const createTenantSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minusculas, numeros e hifens"),
  discordGuildId: z.string().min(17, "Guild ID invalido"),
  discordClientId: z.string().min(17, "Client ID invalido"),
  discordClientSecret: z.string().min(10, "Client Secret invalido"),
  discordRoleAdmin: z.string().min(17, "Role ID invalido"),
  discordRoleEvaluator: z.string().optional(),
  discordRolePlayer: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

// GET - Lista todos os tenants
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Validar super admin E domínio permitido
    if (!validateSuperAdminAccess(session, req)) {
      return NextResponse.json({ message: "Nao autorizado" }, { status: 403 });
    }

    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            users: true,
            reports: true,
          },
        },
      },
    });

    return NextResponse.json(tenants);
  } catch (error) {
    console.error("Erro ao listar tenants:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Cria um novo tenant
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Validar super admin E domínio permitido
    if (!validateSuperAdminAccess(session, req)) {
      return NextResponse.json({ message: "Nao autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = createTenantSchema.parse(body);

    // Verifica se slug ja existe
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingTenant) {
      return NextResponse.json(
        { message: "Ja existe um tenant com esse slug" },
        { status: 400 }
      );
    }

    // Cria o tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        subdomain: validatedData.slug,
        discordGuildId: validatedData.discordGuildId,
        discordClientId: validatedData.discordClientId,
        discordClientSecret: validatedData.discordClientSecret,
        discordRoleAdmin: validatedData.discordRoleAdmin,
        discordRoleEvaluator: validatedData.discordRoleEvaluator,
        discordRolePlayer: validatedData.discordRolePlayer,
        primaryColor: validatedData.primaryColor || "#6366f1",
        secondaryColor: validatedData.secondaryColor || "#4f46e5",
      },
    });

    return NextResponse.json(tenant, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
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
