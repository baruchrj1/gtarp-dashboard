export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Get archive period details with reports and punishments
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ periodId: string }> }
) {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        }

        const role = session.user.role || "PLAYER";
        const isAdmin = role === "ADMIN" || session.user.isAdmin === true;
        const isEvaluator = role === "EVALUATOR";

        if (!isAdmin && !isEvaluator) {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        const params = await context.params;
        const { periodId } = params;

        const period = await prisma.archivePeriod.findUnique({
            where: { id: periodId },
            include: {
                archivedReports: {
                    orderBy: { originalCreatedAt: "desc" },
                },
                archivedPunishments: {
                    orderBy: { originalCreatedAt: "desc" },
                },
            },
        });

        if (!period) {
            return NextResponse.json(
                { error: "Período não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({ period });
    } catch (error) {
        console.error("Error fetching archive period:", error);
        return NextResponse.json(
            { error: "Erro ao buscar período" },
            { status: 500 }
        );
    }
}

// DELETE - Delete an archive period
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ periodId: string }> }
) {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        }

        const role = session.user.role || "PLAYER";
        const isAdmin = role === "ADMIN" || session.user.isAdmin === true;

        if (!isAdmin) {
            return NextResponse.json(
                { error: "Apenas administradores podem excluir" },
                { status: 403 }
            );
        }

        const params = await context.params;
        const { periodId } = params;

        // Delete will cascade to archived reports and punishments
        await prisma.archivePeriod.delete({
            where: { id: periodId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting archive period:", error);
        return NextResponse.json(
            { error: "Erro ao excluir período" },
            { status: 500 }
        );
    }
}
