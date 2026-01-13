export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - List all archive periods
export async function GET() {
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

        const periods = await prisma.archivePeriod.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true,
                totalReports: true,
                approvedReports: true,
                rejectedReports: true,
                pendingReports: true,
                totalPunishments: true,
                createdAt: true,
                _count: {
                    select: {
                        archivedReports: true,
                        archivedPunishments: true,
                    },
                },
            },
        });

        return NextResponse.json({ periods });
    } catch (error) {
        console.error("Error fetching archive periods:", error);
        return NextResponse.json(
            { error: "Erro ao buscar períodos" },
            { status: 500 }
        );
    }
}

