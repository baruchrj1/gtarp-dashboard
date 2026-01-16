export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

import { isAdmin } from "@/lib/permissions";
import { getTenantFromRequest } from "@/lib/tenant";

export async function GET() {
    const session = await getServerSession();
    const tenant = await getTenantFromRequest();

    const authorized = isAdmin(session);

    if (!session || !authorized || !tenant) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const durations = await prisma.punishmentDuration.findMany({
            where: { tenantId: tenant.id },
            orderBy: { createdAt: "asc" },
        });
        return NextResponse.json(durations);
    } catch (error) {
        console.error("Error fetching durations:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const session = await getServerSession();
    const tenant = await getTenantFromRequest();

    const authorized = isAdmin(session);

    if (!session || !authorized || !tenant) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { value, label } = await req.json();

        if (!value || !label) {
            return NextResponse.json(
                { error: "Value and label are required" },
                { status: 400 }
            );
        }

        const duration = await prisma.punishmentDuration.create({
            data: { value, label, tenantId: tenant.id },
        });

        return NextResponse.json(duration);
    } catch (error) {
        console.error("Error creating duration:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession();
    const tenant = await getTenantFromRequest();

    const authorized = isAdmin(session);

    if (!session || !authorized || !tenant) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        // Verify ownership
        const duration = await prisma.punishmentDuration.findFirst({
            where: { id, tenantId: tenant.id },
        });

        if (!duration) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        await prisma.punishmentDuration.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting duration:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

