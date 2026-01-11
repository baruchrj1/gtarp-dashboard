import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { isStaff, AuthErrors } from "@/lib/permissions";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json(AuthErrors.UNAUTHENTICATED, { status: 401 });
    }

    if (!isStaff(session)) {
        return NextResponse.json(AuthErrors.STAFF_REQUIRED, { status: 403 });
    }

    const { id } = await params;

    try {
        const reportId = parseInt(id);

        // Check if report exists
        const report = await prisma.report.findUnique({
            where: { id: reportId }
        });

        if (!report) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        // Check if already claimed by someone else
        if (report.handledBy && report.handledBy !== session.user.id) {
            return NextResponse.json({
                error: "Esta denúncia já foi atribuída a outro avaliador"
            }, { status: 409 });
        }

        // Claim the report for this evaluator and set status to INVESTIGATING
        const updatedReport = await prisma.report.update({
            where: { id: reportId },
            data: {
                handledBy: session.user.id,
                status: "INVESTIGATING"
            },
            include: {
                reporter: {
                    select: { username: true, avatar: true }
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: "Denúncia atribuída a você com sucesso!",
            report: updatedReport
        });
    } catch (error) {
        console.error("Error claiming report:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Unclaim a report (release back to pool)
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json(AuthErrors.UNAUTHENTICATED, { status: 401 });
    }

    if (!isStaff(session)) {
        return NextResponse.json(AuthErrors.STAFF_REQUIRED, { status: 403 });
    }

    const { id } = await params;

    try {
        const reportId = parseInt(id);
        const isAdmin = session.user.role === "ADMIN" || session.user.isAdmin;

        const report = await prisma.report.findUnique({
            where: { id: reportId }
        });

        if (!report) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        // Only the assigned evaluator or an admin can unclaim
        if (!isAdmin && report.handledBy !== session.user.id) {
            return NextResponse.json({
                error: "Você não pode liberar uma denúncia que não está atribuída a você"
            }, { status: 403 });
        }

        // Unclaim the report
        const updatedReport = await prisma.report.update({
            where: { id: reportId },
            data: {
                handledBy: null,
                status: "PENDING"
            }
        });

        return NextResponse.json({
            success: true,
            message: "Denúncia liberada com sucesso!",
            report: updatedReport
        });
    } catch (error) {
        console.error("Error unclaiming report:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
