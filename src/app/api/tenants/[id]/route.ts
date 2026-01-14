
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateTenantSchema } from "@/lib/tenants/schema";

// GET /api/tenants/[id] - Get single tenant
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!(session?.user as any)?.isSuperAdmin) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { id } = await params;

    const tenant = await prisma.tenant.findUnique({
        where: { id },
        include: {
            _count: {
                select: { users: true, reports: true }
            }
        }
    });

    if (!tenant) {
        return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
        ...tenant,
        features: JSON.parse(tenant.features)
    });
}

// PUT /api/tenants/[id] - Update tenant
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!(session?.user as any)?.isSuperAdmin) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const body = await request.json();
        const data = updateTenantSchema.parse(body);

        // Check if slug is being changed and if it's unique
        if (data.slug) {
            const existing = await prisma.tenant.findFirst({
                where: {
                    slug: data.slug,
                    NOT: { id }
                }
            });

            if (existing) {
                return NextResponse.json({ error: "Slug já está em uso" }, { status: 400 });
            }
        }

        // Prepare update data
        const updateData: any = { ...data };
        if (data.features) {
            updateData.features = JSON.stringify(data.features);
        }
        // Ensure subdomain syncs with slug if slug changes (optional, but good for consistency)
        if (data.slug) {
            updateData.subdomain = data.slug;
        }

        const tenant = await prisma.tenant.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({
            ...tenant,
            features: JSON.parse(tenant.features)
        });
    } catch (error: any) {
        if (error.name === "ZodError") {
            return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
        }
        console.error("Update tenant error:", error);
        return NextResponse.json({ error: "Erro ao atualizar tenant" }, { status: 500 });
    }
}

// DELETE /api/tenants/[id] - Delete tenant
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!(session?.user as any)?.isSuperAdmin) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { id } = await params;

    try {
        await prisma.tenant.delete({
            where: { id }
        });

        // Simplified: No Netlify delete logic needed.

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete tenant error:", error);
        return NextResponse.json({ error: "Erro ao deletar tenant" }, { status: 500 });
    }
}
