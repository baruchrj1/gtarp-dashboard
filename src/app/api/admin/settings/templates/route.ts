import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isStaff } from "@/lib/permissions";
import { z } from "zod"; // Assuming Zod is available

const templateSchema = z.object({
    title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
    content: z.string().min(5, "Conteúdo deve ter no mínimo 5 caracteres"),
    category: z.enum(["APPROVAL", "REJECTION", "INVESTIGATION", "OTHER"]),
});

export async function GET(req: Request) {
    const session = await getServerSession();

    if (!session?.user || !isStaff(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const tenantId = session.user.tenantId;

    try {
        const templates = await prisma.responseTemplate.findMany({
            where: {
                tenantId: tenantId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({ templates });
    } catch (error) {
        console.error("Error fetching templates:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession();

    if (!session?.user || !isStaff(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const validation = templateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Dados inválidos", details: validation.error.format() },
                { status: 400 }
            );
        }

        const { title, content, category } = validation.data;
        const tenantId = session.user.tenantId;

        if (!tenantId) {
            return NextResponse.json({ error: "Tenant not found" }, { status: 400 });
        }

        const template = await prisma.responseTemplate.create({
            data: {
                title,
                content,
                category,
                tenantId,
            },
        });

        return NextResponse.json({ success: true, template });
    } catch (error) {
        console.error("Error creating template:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession();

    if (!session?.user || !isStaff(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        const tenantId = session.user.tenantId;

        // Verify ownership before deleting
        const template = await prisma.responseTemplate.findUnique({
            where: { id },
        });

        if (!template || template.tenantId !== tenantId) {
            return NextResponse.json({ error: "Template not found or unauthorized" }, { status: 404 });
        }

        await prisma.responseTemplate.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting template:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

