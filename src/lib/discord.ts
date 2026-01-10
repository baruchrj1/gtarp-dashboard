import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';

const globalForDiscord = globalThis as unknown as { discord: Client };

export const discordClient =
    globalForDiscord.discord ||
    new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
    });

if (process.env.NODE_ENV !== 'production') globalForDiscord.discord = discordClient;

export async function sendReportNotification(report: any, reporterName: string) {
    const token = process.env.DISCORD_BOT_TOKEN;
    const channelId = process.env.DISCORD_ADMIN_CHANNEL_ID;

    if (!token || token === 'changeme' || !channelId) {
        console.log("Discord credentials missing, skipping notification");
        return;
    }

    try {
        if (!discordClient.isReady()) {
            await discordClient.login(token);
        }

        const channel = await discordClient.channels.fetch(channelId);

        if (channel && channel.isTextBased()) {
            const embed = new EmbedBuilder()
                .setTitle(`🚨 Nova Denúncia #${report.id}`)
                .setColor(0x8b5cf6) // Primary Purple
                .addFields(
                    { name: 'Acusado (ID)', value: report.accusedId, inline: true },
                    { name: 'Motivo', value: report.reason, inline: true },
                    { name: 'Autor', value: reporterName, inline: true },
                    { name: 'Descrição', value: report.description || 'Sem descrição' },
                    { name: 'Provas', value: report.evidence }
                )
                .setTimestamp()
                .setFooter({ text: 'Painel de Denúncias' });

            await (channel as import('discord.js').TextChannel).send({ embeds: [embed] });
            console.log("Notification sent to Discord");
        }
    } catch (error) {
        console.error("Discord Notification Error:", error);
    }
}
