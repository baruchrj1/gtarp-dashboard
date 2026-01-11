import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Public API to view archive periods (no auth required for viewing)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const periodId = searchParams.get("id");

        // If specific period requested
        if (periodId) {
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
        }

        // Return list of all periods
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
            },
        });

        return NextResponse.json({ periods });
    } catch (error) {
        console.error("Error fetching archive:", error);
        return NextResponse.json(
            { error: "Erro ao buscar arquivo" },
            { status: 500 }
        );
    }
}
