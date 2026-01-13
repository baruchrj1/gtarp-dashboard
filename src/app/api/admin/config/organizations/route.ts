import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createOrgSchema = z.object({
    name: z.string().min(1, "O nome da organização é obrigatório")
});

export async function GET() {
    try {
        const session = await getServerSession();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const organizations = await prisma.organization.findMany({
            orderBy: { name: "asc" }
        });

        return NextResponse.json({ organizations });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar organizações" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession();

        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        const body = await req.json();
        const validation = createOrgSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }

        const { name } = validation.data;

        const tenantId = session.user.tenantId;
        if (!tenantId) {
            return NextResponse.json({ error: "Tenant ID não encontrado" }, { status: 400 });
        }

        const organization = await prisma.organization.create({
            data: {
                name,
                tenantId
            }
        });

        return NextResponse.json({ organization }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao criar organização" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession();

        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID da organização é obrigatório" }, { status: 400 });
        }

        await prisma.organization.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Organização removida com sucesso" });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao remover organização" }, { status: 500 });
    }
}

