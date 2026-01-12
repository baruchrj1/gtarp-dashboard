import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        }

        const role = session.user.role || "PLAYER";
        const isAdmin = role === "ADMIN" || session.user.isAdmin === true;

        if (!isAdmin) {
            return NextResponse.json(
                { error: "Apenas administradores podem arquivar" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { periodName, month, year } = body;

        if (!periodName) {
            return NextResponse.json(
                { error: "Nome do período é obrigatório" },
                { status: 400 }
            );
        }

        if (month === undefined || year === undefined) {
            return NextResponse.json(
                { error: "Mês e ano são obrigatórios" },
                { status: 400 }
            );
        }

        // Calculate date range for the selected month
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

        // Get only resolved reports for the selected month
        const reports = await prisma.report.findMany({
            where: {
                status: { in: ["APPROVED", "REJECTED"] },
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                reporter: { select: { username: true } },
                punishment: true,
            },
        });

        if (reports.length === 0) {
            return NextResponse.json(
                { error: "Não há denúncias resolvidas neste período para arquivar" },
                { status: 400 }
            );
        }

        // Get punishments linked to these reports
        const reportIds = reports.map(r => r.id);
        const punishments = await prisma.punishment.findMany({
            where: {
                reportId: { in: reportIds }
            },
            include: {
                user: { select: { username: true } },
                admin: { select: { username: true } },
            },
        });

        // Calculate statistics
        const stats = {
            totalReports: reports.length,
            approvedReports: reports.filter(r => r.status === "APPROVED").length,
            rejectedReports: reports.filter(r => r.status === "REJECTED").length,
            pendingReports: 0,
            totalPunishments: punishments.length,
        };

        // Get tenantId from the first report (all reports are from the same tenant)
        const tenantId = reports[0].tenantId;

        // Create archive period
        const archivePeriod = await prisma.archivePeriod.create({
            data: {
                name: periodName,
                startDate,
                endDate,
                tenantId,
                ...stats,
            },
        });

        // Archive reports
        await prisma.archivedReport.createMany({
            data: reports.map(report => ({
                originalId: report.id,
                accusedId: report.accusedId,
                accusedName: report.accusedName,
                accusedFamily: report.accusedFamily,
                reason: report.reason,
                description: report.description,
                evidence: report.evidence,
                status: report.status,
                adminNotes: report.adminNotes,
                reporterId: report.reporterId,
                reporterName: report.reporter?.username || null,
                handledBy: report.handledBy,
                handlerName: null,
                originalCreatedAt: report.createdAt,
                originalUpdatedAt: report.updatedAt,
                periodId: archivePeriod.id,
            })),
        });

        // Archive punishments
        if (punishments.length > 0) {
            await prisma.archivedPunishment.createMany({
                data: punishments.map(punishment => ({
                    originalId: punishment.id,
                    type: punishment.type,
                    reason: punishment.reason,
                    duration: punishment.duration,
                    expiresAt: punishment.expiresAt,
                    organization: punishment.organization,
                    userId: punishment.userId ?? "",
                    userName: punishment.user?.username || null,
                    adminId: punishment.adminId,
                    adminName: punishment.admin?.username || null,
                    originalCreatedAt: punishment.createdAt,
                    periodId: archivePeriod.id,
                })),
            });

            // Delete punishments first (due to foreign key)
            await prisma.punishment.deleteMany({
                where: { reportId: { in: reportIds } }
            });
        }

        // Delete only the reports from this period
        await prisma.report.deleteMany({
            where: { id: { in: reportIds } }
        });

        return NextResponse.json({
            success: true,
            archivePeriod: {
                id: archivePeriod.id,
                name: archivePeriod.name,
                startDate: archivePeriod.startDate,
                endDate: archivePeriod.endDate,
                stats,
            },
            archivedReports: reports.length,
            archivedPunishments: punishments.length,
        });
    } catch (error) {
        console.error("Error creating archive:", error);
        return NextResponse.json(
            { error: "Erro ao criar arquivo" },
            { status: 500 }
        );
    }
}
