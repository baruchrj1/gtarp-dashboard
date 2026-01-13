import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSettingsSchema = z.object({
    server_name: z.string().min(1).optional(),
    server_logo: z.string().optional(),
    theme_color: z.string().optional(),
    discord_webhook_reports: z.string().optional(),
    discord_webhook_logs: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession();

        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        const body = await req.json();
        const validation = updateSettingsSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }

        const tenantId = session.user.tenantId;
        if (!tenantId) {
            return NextResponse.json({ error: "Tenant ID não encontrado" }, { status: 400 });
        }

        const updates = [];

        if (validation.data.server_name !== undefined) {
            updates.push(prisma.systemSetting.upsert({
                where: { key_tenantId: { key: "server_name", tenantId } },
                update: { value: validation.data.server_name },
                create: { key: "server_name", value: validation.data.server_name, description: "Nome do Servidor", tenantId }
            }));
        }

        if (validation.data.server_logo !== undefined) {
            updates.push(prisma.systemSetting.upsert({
                where: { key_tenantId: { key: "server_logo", tenantId } },
                update: { value: validation.data.server_logo },
                create: { key: "server_logo", value: validation.data.server_logo, description: "URL da Logo", tenantId }
            }));
        }

        if (validation.data.theme_color !== undefined) {
            updates.push(prisma.systemSetting.upsert({
                where: { key_tenantId: { key: "theme_color", tenantId } },
                update: { value: validation.data.theme_color },
                create: { key: "theme_color", value: validation.data.theme_color, description: "Cor do Tema (Hex)", tenantId }
            }));
        }

        if (validation.data.discord_webhook_reports !== undefined) {
            updates.push(prisma.systemSetting.upsert({
                where: { key_tenantId: { key: "discord_webhook_reports", tenantId } },
                update: { value: validation.data.discord_webhook_reports },
                create: { key: "discord_webhook_reports", value: validation.data.discord_webhook_reports, description: "Webhook para Novas Denúncias", tenantId }
            }));
        }

        if (validation.data.discord_webhook_logs !== undefined) {
            updates.push(prisma.systemSetting.upsert({
                where: { key_tenantId: { key: "discord_webhook_logs", tenantId } },
                update: { value: validation.data.discord_webhook_logs },
                create: { key: "discord_webhook_logs", value: validation.data.discord_webhook_logs, description: "Webhook para Logs Administrativos", tenantId }
            }));
        }

        await prisma.$transaction(updates);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json({ error: "Erro ao atualizar configurações" }, { status: 500 });
    }
}

