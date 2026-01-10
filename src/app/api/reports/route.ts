import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendReportNotification } from "@/lib/discord";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { accusedId, reason, description, evidence } = body;

        // Basic Validation
        if (!accusedId || !reason || !evidence) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // @ts-ignore
        const reporterId = session.user.id; // added in session callback

        const report = await prisma.report.create({
            data: {
                accusedId,
                reason,
                description,
                evidence,
                reporterId,
            },
        });

        // Send Discord Notification in background (non-blocking)
        // @ts-ignore
        sendReportNotification(report, session.user.name).catch((err) =>
            console.error("Discord notification error:", err)
        );

        return NextResponse.json({ success: true, report });
    } catch (error) {
        console.error("Error saving report:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
