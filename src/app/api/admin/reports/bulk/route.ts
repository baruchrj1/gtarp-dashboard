export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/db"; // Adjust import path if needed
import { isStaff } from "@/lib/permissions";
import { z } from "zod";

const bulkActionSchema = z.object({
    ids: z.array(z.number()),
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "INVESTIGATING"]),
    adminNotes: z.string().optional(),
});

export async function POST(req: Request) {
    const session = await getServerSession();

    if (!session?.user || !isStaff(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const validation = bulkActionSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: "Invalid data", details: validation.error }, { status: 400 });
        }

        const { ids, status, adminNotes } = validation.data;
        const tenantId = session.user.tenantId;

        // Verify all reports belong to tenant to prevent cross-tenant updates
        const count = await prisma.report.count({
            where: {
                id: { in: ids },
                tenantId: tenantId
            }
        });

        if (count !== ids.length) {
            return NextResponse.json({ error: "One or more reports not found or unauthorized" }, { status: 403 });
        }

        // Perform Bulk Update
        const result = await prisma.report.updateMany({
            where: {
                id: { in: ids },
                tenantId: tenantId, // Double check
            },
            data: {
                status: status,
                adminNotes: adminNotes ? adminNotes : undefined, // Only update if provided
                handledBy: session.user.id,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            count: result.count,
            message: `${result.count} reports updated to ${status}`
        });

    } catch (error) {
        console.error("Bulk action error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

