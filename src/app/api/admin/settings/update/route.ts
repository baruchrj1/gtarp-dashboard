import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
        const session = await getServerSession(authOptions);

        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        const body = await req.json();
        const validation = updateSettingsSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }

        const updates = [];

        if (validation.data.server_name !== undefined) {
            updates.push(prisma.systemSetting.upsert({
                where: { key: "server_name" },
                update: { value: validation.data.server_name },
                create: { key: "server_name", value: validation.data.server_name, description: "Nome do Servidor" }
            }));
        }

        if (validation.data.server_logo !== undefined) {
            updates.push(prisma.systemSetting.upsert({
                where: { key: "server_logo" },
                update: { value: validation.data.server_logo },
                create: { key: "server_logo", value: validation.data.server_logo, description: "URL da Logo" }
            }));
        }

        if (validation.data.theme_color !== undefined) {
            updates.push(prisma.systemSetting.upsert({
                where: { key: "theme_color" },
                update: { value: validation.data.theme_color },
                create: { key: "theme_color", value: validation.data.theme_color, description: "Cor do Tema (Hex)" }
            }));
        }

        if (validation.data.discord_webhook_reports !== undefined) {
            updates.push(prisma.systemSetting.upsert({
                where: { key: "discord_webhook_reports" },
                update: { value: validation.data.discord_webhook_reports },
                create: { key: "discord_webhook_reports", value: validation.data.discord_webhook_reports, description: "Webhook para Novas Denúncias" }
            }));
        }

        if (validation.data.discord_webhook_logs !== undefined) {
            updates.push(prisma.systemSetting.upsert({
                where: { key: "discord_webhook_logs" },
                update: { value: validation.data.discord_webhook_logs },
                create: { key: "discord_webhook_logs", value: validation.data.discord_webhook_logs, description: "Webhook para Logs Administrativos" }
            }));
        }

        await prisma.$transaction(updates);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json({ error: "Erro ao atualizar configurações" }, { status: 500 });
    }
}
