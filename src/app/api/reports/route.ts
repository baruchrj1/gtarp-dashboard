
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getTenantFromRequest } from "@/lib/tenant";

// Schema for Creating Report
const createReportSchema = z.object({
    accusedId: z.string().min(2, "ID do acusado obrigatorio"),
    accusedName: z.string().optional(),
    accusedFamily: z.string().optional(),
    reason: z.string().min(3, "Motivo obrigatorio"),
    description: z.string().optional(),
    evidence: z.string().url("Evidence must be a valid URL"),
});

// GET - List Reports
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ message: "Nao autenticado" }, { status: 401 });
        }

        const tenant = await getTenantFromRequest();
        if (!tenant) {
            return NextResponse.json({ message: "Tenant nao encontrado" }, { status: 404 });
        }

        // Filters
        const isAdmin = session.user.role !== "PLAYER";
        const status = req.nextUrl.searchParams.get("status");

        // Query
        const reports = await prisma.report.findMany({
            where: {
                tenantId: tenant.id,
                // Players only see their own reports. Admins/Evaluators see all.
                ...(isAdmin ? {} : { reporterId: session.user.id }),
                ...(status ? { status } : {}),
            },
            include: {
                reporter: {
                    select: { username: true, avatar: true, discordId: true }
                }
            },
            orderBy: { createdAt: "desc" },
            take: 50, // Limit for performance
        });

        return NextResponse.json(reports);
    } catch (error) {
        console.error(`[REPORTS] List Error:`, error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}

// POST - Create Report
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ message: "Nao autenticado" }, { status: 401 });
        }

        const tenant = await getTenantFromRequest();
        if (!tenant) {
            return NextResponse.json({ message: "Tenant nao encontrado" }, { status: 404 });
        }

        const body = await req.json();
        const data = createReportSchema.parse(body);

        // Create Report
        const report = await prisma.report.create({
            data: {
                ...data,
                tenantId: tenant.id,
                reporterId: session.user.id,
                status: "PENDING",
            },
        });

        // TODO: Send Discord Webhook Notification here

        return NextResponse.json(report, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
        }
        console.error(`[REPORTS] Create Error:`, error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
