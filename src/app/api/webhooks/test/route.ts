export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession();

    if (!session?.user?.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const { event, url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "URL do webhook é obrigatória" }, { status: 400 });
        }

        // Create test payload based on event type
        const testPayloads: Record<string, any> = {
            webhook_new_report: {
                embeds: [
                    {
                        title: "🧪 Teste de Webhook - Nova Denúncia",
                        description: "Este é um teste do webhook de novas denúncias.",
                        color: 0xffa500, // Orange
                        fields: [
                            { name: "ID", value: "#9999", inline: true },
                            { name: "Autor", value: "Sistema de Testes", inline: true },
                            { name: "Acusado", value: "Jogador Teste", inline: true },
                            { name: "Motivo", value: "Teste de Webhook", inline: false },
                        ],
                        timestamp: new Date().toISOString(),
                    },
                ],
            },
            webhook_report_approved: {
                embeds: [
                    {
                        title: "🧪 Teste de Webhook - Denúncia Aprovada",
                        description: "Este é um teste do webhook de denúncias aprovadas.",
                        color: 0x00ff00, // Green
                        fields: [
                            { name: "ID", value: "#9999", inline: true },
                            { name: "Avaliador", value: "Sistema de Testes", inline: true },
                            { name: "Status", value: "Aprovada", inline: true },
                        ],
                        timestamp: new Date().toISOString(),
                    },
                ],
            },
            webhook_punishment_applied: {
                embeds: [
                    {
                        title: "🧪 Teste de Webhook - Punição Aplicada",
                        description: "Este é um teste do webhook de punições aplicadas.",
                        color: 0xff0000, // Red
                        fields: [
                            { name: "Jogador", value: "Jogador Teste", inline: true },
                            { name: "Tipo", value: "Advertência", inline: true },
                            { name: "Motivo", value: "Teste de Webhook", inline: false },
                        ],
                        timestamp: new Date().toISOString(),
                    },
                ],
            },
            webhook_player_banned: {
                embeds: [
                    {
                        title: "🧪 Teste de Webhook - Jogador Banido",
                        description: "Este é um teste do webhook de banimentos.",
                        color: 0x8b0000, // Dark Red
                        fields: [
                            { name: "Jogador", value: "Jogador Teste", inline: true },
                            { name: "Tipo", value: "Banimento Permanente", inline: true },
                            { name: "Motivo", value: "Teste de Webhook", inline: false },
                        ],
                        timestamp: new Date().toISOString(),
                    },
                ],
            },
        };

        const payload = testPayloads[event] || {
            content: "🧪 Teste de Webhook - Sistema GTARP Dashboard",
        };

        // Send test webhook
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                {
                    success: false,
                    message: `Erro ao enviar webhook: ${response.status} ${response.statusText}`,
                    details: errorText,
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Webhook de teste enviado com sucesso! Verifique o canal do Discord.",
        });
    } catch (error) {
        console.error("Error testing webhook:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Erro ao enviar webhook de teste",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

