import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendReportNotification } from "@/lib/discord";
import { isStaff, AuthErrors } from "@/lib/permissions";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { createReportSchema, validateBody, formatZodErrors } from "@/lib/validation";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json(AuthErrors.UNAUTHENTICATED, { status: 401 });
    }

    try {
        // Filter: Staff sees all, Players see only their own
        const whereClause = isStaff(session) ? {} : { reporterId: session.user.id };

        const reports = await prisma.report.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            include: {
                reporter: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
        });

        // Add reporter name to each report
        const formattedReports = reports.map((report) => ({
            ...report,
            reporter: {
                ...report.reporter,
                name: report.reporter?.username || "Anônimo",
            },
        }));

        return NextResponse.json({ success: true, reports: formattedReports });
    } catch (error) {
        console.error("Error fetching reports:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json(AuthErrors.UNAUTHENTICATED, { status: 401 });
    }

    // Rate limiting: 5 reports per minute per user
    const rateLimitResult = checkRateLimit(`report:${session.user.id}`, {
        limit: 5,
        window: 60000,
    });

    if (!rateLimitResult.success) {
        return rateLimitResponse(rateLimitResult.resetIn);
    }

    try {
        // Validate input
        const validation = await validateBody(req, createReportSchema);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Dados inválidos", details: formatZodErrors(validation.error) },
                { status: 400 }
            );
        }

        const { accusedId, accusedName, reason, description, evidence } = validation.data;

        // Process evidence (string or array)
        let processedEvidence = "";
        if (Array.isArray(evidence)) {
            processedEvidence = JSON.stringify(evidence);
        } else {
            processedEvidence = String(evidence);
        }

        const reporterId = session.user.id;

        const report = await prisma.report.create({
            data: {
                accusedId,
                accusedName: accusedName || accusedId,
                reason,
                description: description || null,
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
        const message =
            process.env.NODE_ENV === "production"
                ? "Erro ao criar denúncia"
                : error instanceof Error
                ? error.message
                : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
