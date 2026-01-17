export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getTenantFromRequest } from "@/lib/tenant";

// Schema for Creating Report
const createReportSchema = z.object({
    accusedId: z.string().optional(),
    accusedName: z.string().optional(),
    accusedFamily: z.string().optional(),
    reason: z.string().min(3, "Motivo obrigatorio"),
    description: z.string().optional(),
    evidence: z.union([z.string().url(), z.array(z.string().url())]),
});

// GET - List Reports
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();
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
        // Query
        const query = {
            tenantId: tenant.id,
            // Players only see their own reports. Admins/Evaluators see all.
            ...(isAdmin ? {} : { reporterId: session.user.id }),
            ...(status ? { status } : {}),
        };

        if (!session.user.id) {
            return NextResponse.json({ message: "ID do usuário não encontrado na sessão" }, { status: 401 });
        }

        console.log(`[REPORTS DEBUG] GET /api/reports - User: ${session.user.id} (${session.user.name}) | Role: ${session.user.role} | Admin? ${isAdmin}`);
        console.log(`[REPORTS DEBUG] Query Filter:`, JSON.stringify(query, null, 2));

        const reports = await prisma.report.findMany({
            where: query,
            include: isAdmin ? {
                reporter: {
                    select: { username: true, avatar: true, discordId: true }
                }
            } : undefined,
            orderBy: { createdAt: "desc" },
            take: 50, // Limit for performance
        });

        console.log(`[REPORTS DEBUG] Found ${reports.length} reports.`);

        return NextResponse.json({ reports }); // Wrap in object to match SWR expectation { reports: [] }
    } catch (error: any) {
        console.error(`[REPORTS] List Error:`, error);
        return NextResponse.json({ message: "Erro interno", error: error.message }, { status: 500 });
    }
}

// POST - Create Report
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
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
                accusedId: data.accusedId || "N/A",
                tenantId: tenant.id,
                reporterId: session.user.id,
                status: "PENDING",
                evidence: Array.isArray(data.evidence) ? data.evidence.join("\n") : data.evidence,
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
