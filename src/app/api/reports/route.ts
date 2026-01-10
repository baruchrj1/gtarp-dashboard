import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendReportNotification } from "@/lib/discord";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Filter: Staff filter sees all, Players see only their own
        const isStaff = session.user.role === "ADMIN" || session.user.role === "EVALUATOR" || session.user.isAdmin;
        const whereClause = isStaff ? {} : { reporterId: session.user.id };

        const reports = await prisma.report.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            include: {
                reporter: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    }
                }
            }
        });

        // Add reporter name to each report
        const formattedReports = reports.map((report) => ({
            ...report,
            reporter: {
                ...report.reporter,
                name: report.reporter?.username || "Anônimo"
            }
        }));

        return NextResponse.json({ success: true, reports: formattedReports });
    } catch (error) {
        console.error("Error fetching reports:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { accusedId, accusedName, reason, description, evidence } = body;

        // Helper to process evidence (string or array)
        let processedEvidence = "";
        if (Array.isArray(evidence)) {
            processedEvidence = JSON.stringify(evidence);
        } else {
            processedEvidence = String(evidence);
        }

        // Basic Validation
        if (!accusedId || !reason || !processedEvidence) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const reporterId = session.user.id;

        const report = await prisma.report.create({
            data: {
                accusedId,
                accusedName: accusedName || accusedId,
                reason,
                description,
                evidence: processedEvidence,
                reporterId,
            },
        });

        // Send Discord Notification in background (non-blocking)
        sendReportNotification(report, session.user.name || "Unknown").catch((err) =>
            console.error("Discord notification error:", err)
        );

        return NextResponse.json({ success: true, report });
    } catch (error) {
        console.error("Error saving report:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
