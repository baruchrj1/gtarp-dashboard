import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    // Authorization Check
    // @ts-ignore
    if (!session || !session.user || !session.user.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const reports = await prisma.report.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                reporter: {
                    select: { username: true, avatar: true },
                },
            },
        });

        return NextResponse.json({ reports });
    } catch (error) {
        console.error("Error fetching reports:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
