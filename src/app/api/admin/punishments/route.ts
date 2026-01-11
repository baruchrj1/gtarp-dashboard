import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const punishmentSchema = z.object({
    userId: z.string().min(1, "ID do usuário é obrigatório"),
    type: z.enum(["WARNING", "KICK", "TEMP_BAN", "PERM_BAN"]),
    duration: z.number().min(1).max(720).optional(),
    reason: z.string().min(10, "Motivo deve ter pelo menos 10 caracteres"),
    reportId: z.number().optional(),
    organization: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check authentication
        if (!session?.user) {
            return NextResponse.json(
                { error: "Não autenticado" },
                { status: 401 }
            );
        }

        // Check if user is admin
        const role = session.user.role || "PLAYER";
        const isAdmin = role === "ADMIN" || session.user.isAdmin === true;

        if (!isAdmin) {
            return NextResponse.json(
                { error: "Acesso negado. Apenas administradores podem aplicar punições." },
                { status: 403 }
            );
        }

        // Parse and validate request body
        const body = await request.json();
        const validatedData = punishmentSchema.parse(body);

        // Validate duration for TEMP_BAN
        if (validatedData.type === "TEMP_BAN" && !validatedData.duration) {
            return NextResponse.json(
                { error: "Duração é obrigatória para ban temporário" },
                { status: 400 }
            );
        }

        // Calculate expiration date for TEMP_BAN
        let expiresAt = null;
        if (validatedData.type === "TEMP_BAN" && validatedData.duration) {
            expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + validatedData.duration);
        }

        // Create punishment record
        const punishment = await prisma.punishment.create({
            data: {
                userId: validatedData.userId,
                type: validatedData.type,
                reason: validatedData.reason,
                duration: validatedData.duration,
                expiresAt,
                reportId: validatedData.reportId,
                adminId: session.user.id,
                isActive: true,
                organization: validatedData.organization,
            },
        });

        // If linked to a report, update report status to APPROVED
        if (validatedData.reportId) {
            await prisma.report.update({
                where: { id: validatedData.reportId },
                data: {
                    status: "APPROVED",
                    adminNotes: `Punição aplicada: ${validatedData.type}`,
                },
            });
        }

        return NextResponse.json({
            success: true,
            punishment: {
                id: punishment.id,
                type: punishment.type,
                userId: punishment.userId,
                expiresAt: punishment.expiresAt,
            },
        });
    } catch (error) {
        console.error("Error creating punishment:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Dados inválidos", details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Erro ao aplicar punição" },
            { status: 500 }
        );
    }
}

// GET endpoint to list punishments
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Não autenticado" },
                { status: 401 }
            );
        }

        const role = session.user.role || "PLAYER";
        const isAdmin = role === "ADMIN" || session.user.isAdmin === true;

        if (!isAdmin) {
            return NextResponse.json(
                { error: "Acesso negado" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const isActive = searchParams.get("isActive");

        const punishments = await prisma.punishment.findMany({
            where: {
                ...(userId && { userId }),
                ...(isActive !== null && { isActive: isActive === "true" }),
            },
            include: {
                admin: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                report: {
                    select: {
                        id: true,
                        reason: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 50,
        });

        return NextResponse.json({ punishments });
    } catch (error) {
        console.error("Error fetching punishments:", error);
        return NextResponse.json(
            { error: "Erro ao buscar punições" },
            { status: 500 }
        );
    }
}
