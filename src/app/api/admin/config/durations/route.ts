export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

import { isAdmin } from "@/lib/permissions";
import { getTenantFromRequest } from "@/lib/tenant";

export async function GET() {
    const session = await getServerSession();
    const tenant = await getTenantFromRequest();

    if (!session?.user || !tenant) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        let durations = await prisma.punishmentDuration.findMany({
            where: { tenantId: tenant.id },
            orderBy: { createdAt: "asc" },
        });

        if (durations.length === 0) {
            const defaults = [
                { label: "24 Horas", value: "24" },
                { label: "3 Dias", value: "3d" },
                { label: "7 Dias", value: "7d" },
                { label: "15 Dias", value: "15d" },
                { label: "30 Dias", value: "30d" },
            ];

            // Create defaults
            for (const d of defaults) {
                await prisma.punishmentDuration.create({
                    data: {
                        label: d.label,
                        value: d.value,
                        tenantId: tenant.id,
                    },
                });
            }

            // Fetch again
            durations = await prisma.punishmentDuration.findMany({
                where: { tenantId: tenant.id },
                orderBy: { createdAt: "asc" },
            });
        }

        return NextResponse.json({ durations });
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

