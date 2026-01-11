import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Public API to check protocol status
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "ID do protocolo é obrigatório" },
                { status: 400 }
            );
        }

        const reportId = parseInt(id);

        if (isNaN(reportId)) {
            return NextResponse.json(
                { error: "ID do protocolo inválido" },
                { status: 400 }
            );
        }

        const report = await prisma.report.findUnique({
            where: { id: reportId },
            select: {
                id: true,
                status: true,
                reason: true,
                accusedName: true,
                accusedId: true,
                accusedFamily: true,
                adminNotes: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!report) {
            return NextResponse.json(
                { error: "Protocolo não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({ report });
    } catch (error) {
        console.error("Error fetching protocol:", error);
        return NextResponse.json(
            { error: "Erro ao buscar protocolo" },
            { status: 500 }
        );
    }
}
