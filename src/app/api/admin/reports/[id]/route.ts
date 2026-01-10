import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendReportNotification } from "@/lib/discord";

// GET: Fetch single report details
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
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

    if (!session?.user?.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status, adminNotes } = await req.json();

    try {
        const updatedReport = await prisma.report.update({
            where: { id: parseInt(id) },
            data: {
                status,
                adminNotes,
                handledBy: session.user.id,
            },
            include: {
                reporter: { select: { username: true } }
            }
        });

        // Notify Discord about the update
        if (updatedReport) {
            // We could add a specific notification for updates here
            // For now, we rely on the initial one, but sending an update log would be good
        }

        return NextResponse.json({ report: updatedReport });
    } catch (error) {
        console.error("Error updating report:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
