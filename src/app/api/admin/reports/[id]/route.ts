import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendReportNotification, sendPlayerReportStatusNotification } from "@/lib/discord";

// GET: Fetch single report details
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    const isStaff = session?.user?.role === "ADMIN" || session?.user?.role === "EVALUATOR" || session?.user?.isAdmin;

    if (!isStaff) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const report = await prisma.report.findUnique({
            where: { id: parseInt(id) },
            include: {
                reporter: {
                    select: { username: true, avatar: true, id: true },
                },
            },
        });

        if (!report) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        return NextResponse.json({ report });
    } catch (error) {
        console.error("Error fetching report:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH: Update report status
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    const isStaff = session?.user?.role === "ADMIN" || session?.user?.role === "EVALUATOR" || session?.user?.isAdmin;

    if (!isStaff) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status, adminNotes, accusedFamily } = await req.json();

    try {
        const updatedReport = await prisma.report.update({
            where: { id: parseInt(id) },
            data: {
                status,
                adminNotes,
                accusedFamily,
                handledBy: session.user.id,
            },
            include: {
                reporter: { select: { username: true, id: true } }
            }
        });

        // Notify the player who made the report about the status change
        if (updatedReport && updatedReport.reporter?.id) {
            await sendPlayerReportStatusNotification(updatedReport.reporter.id, {
                id: updatedReport.id,
                accusedId: updatedReport.accusedId,
                accusedName: updatedReport.accusedName || undefined,
                status: updatedReport.status,
                adminNotes: updatedReport.adminNotes,
            });
        }

        return NextResponse.json({ report: updatedReport });
    } catch (error) {
        console.error("Error updating report:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
