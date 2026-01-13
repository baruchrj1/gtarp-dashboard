export const dynamic = "force-dynamic";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendReportNotification, sendPlayerReportStatusNotification, sendDiscordWebhook, DISCORD_COLORS } from "@/lib/discord";

// GET: Fetch single report details
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession();

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
    const session = await getServerSession();

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

        // NEW: Send Webhook Log (White Label Staff Logs)
        const embedColor = status === "APPROVED" ? DISCORD_COLORS.GREEN :
            status === "REJECTED" ? DISCORD_COLORS.RED : DISCORD_COLORS.BLUE;

        const actionText = status === "APPROVED" ? "Aprovou" :
            status === "REJECTED" ? "Rejeitou" : "Atualizou";

        const tenantId = session.user.tenantId;

        // Only send log if status actually changed (simplification: assume typical flow)
        if ((status === "APPROVED" || status === "REJECTED") && tenantId) {
            sendDiscordWebhook("discord_webhook_logs", {
                title: `📝 Denúncia #${updatedReport.id} ${status === "APPROVED" ? "APROVADA" : "REJEITADA"}`,
                description: `O avaliador **${session.user.name}** finalizou a análise desta denúncia.`,
                color: embedColor,
                fields: [
                    { name: "Acusado", value: updatedReport.accusedName || updatedReport.accusedId, inline: true },
                    { name: "Motivo Original", value: updatedReport.reason, inline: true },
                    { name: "Veredito", value: adminNotes || "Sem observações", inline: false },
                    { name: "Link", value: `[Ver Detalhes](${process.env.NEXTAUTH_URL}/admin/reports/${updatedReport.id})`, inline: false }
                ]
            }, tenantId).catch(err => console.error("Webhook Log Error:", err));
        }

        return NextResponse.json({ report: updatedReport });
    } catch (error) {
        console.error("Error updating report:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
