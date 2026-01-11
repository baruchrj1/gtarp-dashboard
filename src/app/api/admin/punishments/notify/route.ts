import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// Message templates for different punishment types
const MESSAGE_TEMPLATES = {
    warning: {
        title: "⚠️ ADVERTÊNCIA OFICIAL - GTA RP",
        color: 0xFFA500, // Orange
        description: "Você recebeu uma **advertência oficial** da equipe de administração do servidor GTA RP.\n\n" +
            "Esta é uma notificação formal sobre uma violação das regras do servidor. " +
            "Recomendamos que revise nossas diretrizes para evitar futuras penalidades.",
        thumbnail: "https://cdn.discordapp.com/emojis/1234567890.png" // Optional: add server logo
    },
    suspension: {
        title: "🚫 SUSPENSÃO TEMPORÁRIA - GTA RP",
        color: 0xFF0000, // Red
        description: "Sua conta foi **temporariamente suspensa** do servidor GTA RP.\n\n" +
            "Durante este período, você não poderá acessar o servidor. " +
            "Esta medida foi tomada devido a violações graves das regras da comunidade.\n\n" +
            "⏰ Verifique abaixo a duração da suspensão e o motivo detalhado.",
    },
    reactivation: {
        title: "✅ CONTA REATIVADA - GTA RP",
        color: 0x00FF00, // Green
        description: "Sua conta foi **reativada com sucesso**! 🎉\n\n" +
            "Você está livre para retornar ao servidor GTA RP. " +
            "Esperamos que você continue contribuindo positivamente para nossa comunidade.\n\n" +
            "Lembre-se de seguir todas as regras do servidor para evitar futuras penalidades.",
    },
    custom: {
        title: "📢 NOTIFICAÇÃO DA ADMINISTRAÇÃO - GTA RP",
        color: 0x9333EA, // Purple
        description: "Você recebeu uma notificação importante da equipe administrativa do servidor GTA RP.\n\n" +
            "Por favor, leia atentamente as informações abaixo.",
    }
};

interface NotifyRequest {
    playerId: string;
    playerName: string;
    punishmentType: "warning" | "suspension" | "reactivation" | "custom";
    reason: string;
    customMessage?: string;
    duration?: string;
}

// Helper function to get punishment-specific icons
function getPunishmentIcon(type: string): string {
    const icons = {
        warning: "https://cdn-icons-png.flaticon.com/512/5219/5219091.png", // Warning triangle
        suspension: "https://cdn-icons-png.flaticon.com/512/6897/6897039.png", // Ban hammer
        reactivation: "https://cdn-icons-png.flaticon.com/512/5610/5610944.png", // Check mark
        custom: "https://cdn-icons-png.flaticon.com/512/2965/2965358.png" // Info
    };
    return icons[type as keyof typeof icons] || icons.custom;
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is authenticated and is an ADMIN or EVALUATOR
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EVALUATOR")) {
            return NextResponse.json(
                { error: "Acesso negado. Apenas administradores e avaliadores podem enviar notificações." },
                { status: 403 }
            );
        }

        const body: NotifyRequest = await request.json();
        const { playerId, playerName, punishmentType, reason, customMessage, duration } = body;

        if (!DISCORD_BOT_TOKEN) {
            return NextResponse.json(
                { error: "Bot token não configurado" },
                { status: 500 }
            );
        }

        // Get the appropriate template
        const template = MESSAGE_TEMPLATES[punishmentType];

        // Build the Discord embed with enhanced formatting and visuals
        const embed: any = {
            author: {
                name: "GTA RP - Sistema de Administração",
                icon_url: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" // Shield icon
            },
            title: template.title,
            description: customMessage || template.description,
            color: template.color,
            thumbnail: {
                url: getPunishmentIcon(punishmentType)
            },
            fields: [],
            footer: {
                text: `GTA RP Dashboard • Equipe de Administração`,
                icon_url: "https://cdn-icons-png.flaticon.com/512/2965/2965358.png" // Server icon
            },
            timestamp: new Date().toISOString()
        };

        // Add a visual separator
        embed.fields.push({
            name: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            value: "\u200b", // Invisible character
            inline: false
        });

        // Add reason field with better formatting
        embed.fields.push({
            name: "📋 Motivo da Punição",
            value: `\`\`\`fix\n${reason || "Não especificado"}\n\`\`\``,
            inline: false
        });

        // Add duration field for suspensions
        if (punishmentType === "suspension" && duration) {
            embed.fields.push({
                name: "⏱️ Duração da Suspensão",
                value: `\`\`\`yaml\n${duration}\n\`\`\``,
                inline: true
            });
        }

        // Add admin info with better formatting
        const adminField = {
            name: "👮 Responsável pela Ação",
            value: `\`\`\`css\n${session.user.name || "Administrador"}\n\`\`\``,
            inline: punishmentType === "suspension" && duration ? true : false
        };
        embed.fields.push(adminField);

        // Add date/time info
        const dateStr = new Date().toLocaleString("pt-BR", {
            dateStyle: "long",
            timeStyle: "short"
        });
        embed.fields.push({
            name: "📅 Data e Hora",
            value: `\`\`\`${dateStr}\`\`\``,
            inline: punishmentType === "suspension" && duration ? false : true
        });

        // Add separator before footer info
        embed.fields.push({
            name: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            value: "\u200b",
            inline: false
        });

        // Add helpful information based on punishment type
        if (punishmentType === "warning") {
            embed.fields.push({
                name: "⚠️ Próximos Passos",
                value: "```diff\n+ Revise as regras do servidor\n+ Evite repetir a infração\n+ Em caso de dúvidas, contate a administração\n```",
                inline: false
            });
        } else if (punishmentType === "suspension") {
            embed.fields.push({
                name: "🚫 Informações Importantes",
                value: "```diff\n- Você não poderá acessar o servidor durante a suspensão\n+ Após o período, sua conta será automaticamente reativada\n+ Recursos podem ser enviados via ticket no Discord\n```",
                inline: false
            });
        } else if (punishmentType === "reactivation") {
            embed.fields.push({
                name: "🎮 Bem-vindo de Volta!",
                value: "```diff\n+ Sua conta está totalmente ativa\n+ Lembre-se de seguir todas as regras\n+ Divirta-se e jogue limpo!\n```",
                inline: false
            });
        }

        // Add image banner for more visual impact (optional)
        if (punishmentType === "suspension") {
            embed.image = {
                url: "https://via.placeholder.com/600x200/FF0000/FFFFFF?text=CONTA+SUSPENSA"
            };
        } else if (punishmentType === "reactivation") {
            embed.image = {
                url: "https://via.placeholder.com/600x200/00FF00/FFFFFF?text=CONTA+REATIVADA"
            };
        }

        try {
            // Step 1: Create a DM channel with the user
            const dmChannelResponse = await fetch("https://discord.com/api/v10/users/@me/channels", {
                method: "POST",
                headers: {
                    "Authorization": `Bot ${DISCORD_BOT_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    recipient_id: playerId
                })
            });

            if (!dmChannelResponse.ok) {
                const errorText = await dmChannelResponse.text();
                console.error("Error creating DM channel:", errorText);

                // Fallback to webhook if DM fails
                console.log("Falling back to webhook notification...");
                await sendWebhookNotification(playerName, embed);

                return NextResponse.json({
                    success: true,
                    messageSent: true,
                    message: "Notificação enviada via webhook (DM não disponível)",
                    usedFallback: true
                });
            }

            const dmChannel = await dmChannelResponse.json();

            // Step 2: Send the message to the DM channel
            const messageResponse = await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
                method: "POST",
                headers: {
                    "Authorization": `Bot ${DISCORD_BOT_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    embeds: [embed]
                })
            });

            if (!messageResponse.ok) {
                const errorText = await messageResponse.text();
                console.error("Error sending DM:", errorText);

                // Fallback to webhook
                console.log("Falling back to webhook notification...");
                await sendWebhookNotification(playerName, embed);

                return NextResponse.json({
                    success: true,
                    messageSent: true,
                    message: "Notificação enviada via webhook (erro ao enviar DM)",
                    usedFallback: true
                });
            }

            return NextResponse.json({
                success: true,
                messageSent: true,
                message: "Notificação enviada com sucesso no privado do jogador!",
                usedFallback: false
            });

        } catch (dmError) {
            console.error("DM error:", dmError);

            // Fallback to webhook
            console.log("Falling back to webhook notification...");
            await sendWebhookNotification(playerName, embed);

            return NextResponse.json({
                success: true,
                messageSent: true,
                message: "Notificação enviada via webhook (erro no sistema de DM)",
                usedFallback: true
            });
        }

    } catch (error) {
        console.error("Error sending Discord notification:", error);
        return NextResponse.json(
            {
                success: false,
                messageSent: false,
                error: "Erro ao processar notificação"
            },
            { status: 500 }
        );
    }
}

// Fallback function to send via webhook
async function sendWebhookNotification(playerName: string, embed: any) {
    if (!DISCORD_WEBHOOK_URL) {
        console.error("DISCORD_WEBHOOK_URL not configured, cannot send webhook notification");
        return;
    }

    // Add player name to embed
    embed.fields.unshift({
        name: "👤 Jogador",
        value: playerName,
        inline: true
    });

    await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: "GTA RP - Sistema de Punições",
            avatar_url: "https://cdn.discordapp.com/embed/avatars/0.png",
            embeds: [embed]
        })
    });
}
