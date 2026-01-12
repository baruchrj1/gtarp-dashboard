import { Client, GatewayIntentBits, EmbedBuilder, TextChannel } from "discord.js";

// Singleton pattern for Discord client with lazy initialization
let discordClientInstance: Client | null = null;
let isConnecting = false;

async function getDiscordClient(): Promise<Client | null> {
    const token = process.env.DISCORD_BOT_TOKEN;

    if (!token || token === "changeme") {
        return null;
    }

    // Return existing client if ready
    if (discordClientInstance?.isReady()) {
        return discordClientInstance;
    }

    // Prevent multiple simultaneous connection attempts
    if (isConnecting) {
        // Wait for the connection to complete
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return discordClientInstance;
    }

    try {
        isConnecting = true;

        // Create new client if doesn't exist
        if (!discordClientInstance) {
            discordClientInstance = new Client({
                intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
            });

            // Handle disconnection
            discordClientInstance.on("error", (error) => {
                console.error("Discord client error:", error);
            });

            discordClientInstance.on("disconnect", () => {
                console.log("Discord client disconnected");
            });
        }

        // Login if not ready
        if (!discordClientInstance.isReady()) {
            await discordClientInstance.login(token);
        }

        return discordClientInstance;
    } catch (error) {
        console.error("Failed to connect to Discord:", error);
        return null;
    } finally {
        isConnecting = false;
    }
}

export async function sendReportNotification(
    report: {
        id: number;
        accusedId: string;
        reason: string;
        description: string | null;
        evidence: string;
    },
    reporterName: string
) {
    const channelId = process.env.DISCORD_ADMIN_CHANNEL_ID;

    if (!channelId) {
        console.log("DISCORD_ADMIN_CHANNEL_ID not configured, skipping notification");
        return;
    }

    try {
        const client = await getDiscordClient();

        if (!client) {
            console.log("Discord client not available, skipping notification");
            return;
        }

        const channel = await client.channels.fetch(channelId);

        if (channel && channel.isTextBased()) {
            const embed = new EmbedBuilder()
                .setTitle(`Nova Denuncia #${report.id}`)
                .setColor(0x8b5cf6) // Primary Purple
                .addFields(
                    { name: "Acusado (ID)", value: report.accusedId, inline: true },
                    { name: "Motivo", value: report.reason, inline: true },
                    { name: "Autor", value: reporterName, inline: true },
                    { name: "Descricao", value: report.description || "Sem descricao" },
                    { name: "Provas", value: report.evidence.substring(0, 1024) } // Limit to Discord's field limit
                )
                .setTimestamp()
                .setFooter({ text: "Painel de Denuncias" });

            await (channel as TextChannel).send({ embeds: [embed] });
            console.log("Notification sent to Discord");
        }
    } catch (error) {
        console.error("Discord Notification Error:", error);
        // Don't throw - notification failure shouldn't break the main flow
    }
}

// Cleanup function for graceful shutdown
export async function disconnectDiscord() {
    if (discordClientInstance) {
        discordClientInstance.destroy();
        discordClientInstance = null;
    }
}

// Send DM notification to a player about their report status
export async function sendPlayerReportStatusNotification(
    playerId: string,
    report: {
        id: number;
        accusedId: string;
        accusedName?: string;
        status: string;
        adminNotes?: string | null;
    }
) {
    try {
        const client = await getDiscordClient();

        if (!client) {
            console.log("Discord client not available, skipping player notification");
            return;
        }

        // Fetch the user
        const user = await client.users.fetch(playerId);
        if (!user) {
            console.log(`Could not find Discord user ${playerId}`);
            return;
        }

        // Build the status message
        let statusColor: number;
        let statusTitle: string;
        let statusMessage: string;

        switch (report.status) {
            case "INVESTIGATING":
                statusColor = 0x3b82f6; // Blue
                statusTitle = "🔍 Denúncia em Análise";
                statusMessage = "Sua denúncia está sendo analisada pela equipe de avaliação.";
                break;
            case "APPROVED":
                statusColor = 0x22c55e; // Green
                statusTitle = "✅ Denúncia Aprovada";
                statusMessage = "Sua denúncia foi aprovada! O jogador reportado será punido conforme as regras do servidor.";
                break;
            case "REJECTED":
                statusColor = 0xef4444; // Red
                statusTitle = "❌ Denúncia Rejeitada";
                statusMessage = "Sua denúncia foi analisada mas não foi aprovada.";
                break;
            default:
                return; // Don't notify for other statuses
        }

        const embed = new EmbedBuilder()
            .setTitle(statusTitle)
            .setColor(statusColor)
            .setDescription(statusMessage)
            .addFields(
                { name: "Denúncia #", value: `${report.id}`, inline: true },
                { name: "Acusado", value: report.accusedName || report.accusedId, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: "Painel de Denúncias - GTA RP" });

        // Add admin notes if available and if approved/rejected
        if (report.adminNotes && (report.status === "APPROVED" || report.status === "REJECTED")) {
            embed.addFields({ name: "Observação", value: report.adminNotes });
        }

        // Send the DM
        await user.send({ embeds: [embed] });
        console.log(`Notification sent to player ${playerId} about report #${report.id}`);

    } catch (error) {
        // Don't throw - notification failure shouldn't break the main flow
        // User might have DMs disabled
        console.error("Failed to send player notification:", error);
    }
}


// ==========================================
// NEW WEBHOOK SYSTEM (White Label Compatible)
// ==========================================

import { prisma } from "@/lib/db";

interface WebhookEmbed {
    title: string;
    description?: string;
    color?: number; // Decimal color
    fields?: { name: string; value: string; inline?: boolean }[];
    thumbnail?: { url: string };
    image?: { url: string };
    url?: string;
}

export const DISCORD_COLORS = {
    BLUE: 3447003,
    GREEN: 5763719,
    RED: 15548997,
    YELLOW: 16776960,
    ORANGE: 15105570,
    PURPLE: 10181046,
    GREY: 9807270,
};

/**
 * Sends a rich embed via Discord Webhook using dynamic settings from DB.
 * This does NOT require a Bot Token.
 */
export async function sendDiscordWebhook(
    webhookKey: "discord_webhook_reports" | "discord_webhook_logs",
    embed: WebhookEmbed
) {
    try {
        // Fetch webhook URL and Server settings in parallel to be fast
        const [webhookSetting, serverNameSetting, serverLogoSetting] = await Promise.all([
            prisma.systemSetting.findUnique({ where: { key: webhookKey } }),
            prisma.systemSetting.findUnique({ where: { key: "server_name" } }),
            prisma.systemSetting.findUnique({ where: { key: "server_logo" } })
        ]);

        if (!webhookSetting?.value) return; // Webhook not configured

        const serverName = serverNameSetting?.value || "System Reports";
        const serverLogo = serverLogoSetting?.value || "";

        const payload = {
            username: serverName,
            avatar_url: serverLogo || undefined,
            embeds: [{
                ...embed,
                footer: {
                    text: `${serverName} • Sistema de Denúncias`,
                    icon_url: serverLogo || undefined
                },
                timestamp: new Date().toISOString()
            }]
        };

        const response = await fetch(webhookSetting.value, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error(`Webhook failed with status ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        // Silently fail to not break app flow, but log
        console.error("Failed to send Discord webhook:", error);
    }
}
