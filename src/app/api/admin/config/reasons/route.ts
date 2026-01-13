import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createReasonSchema = z.object({
    label: z.string().min(1, "O nome do motivo é obrigatório"),
    value: z.string().min(1, "O valor interno do motivo é obrigatório")
});

export async function GET() {
    try {
        const session = await getServerSession();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const reasons = await prisma.reportReason.findMany({
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ reasons });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar motivos" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession();

        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        const body = await req.json();
        const validation = createReasonSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }

        const { label, value } = validation.data;

        const tenantId = session.user.tenantId;
        if (!tenantId) {
            return NextResponse.json({ error: "Tenant ID não encontrado" }, { status: 400 });
        }

        const reason = await prisma.reportReason.create({
            data: {
                label,
                value,
                tenantId
            }
        });

        return NextResponse.json({ reason }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao criar motivo" }, { status: 500 });
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
            return NextResponse.json({ error: "ID do motivo é obrigatório" }, { status: 400 });
        }

        await prisma.reportReason.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Motivo removido com sucesso" });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao remover motivo" }, { status: 500 });
    }
}

