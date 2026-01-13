import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

import { isStaff, AuthErrors } from "@/lib/permissions";

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
const DISCORD_ROLE_PLAYER_ID = process.env.DISCORD_ROLE_PLAYER_ID;

export async function GET() {
    try {
        const session = await getServerSession();

        // Check if user is authenticated and is STAFF
        if (!session?.user) {
            return NextResponse.json(AuthErrors.UNAUTHENTICATED, { status: 401 });
        }

        if (!isStaff(session)) {
            return NextResponse.json(AuthErrors.STAFF_REQUIRED, { status: 403 });
        }

        if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID || !DISCORD_ROLE_PLAYER_ID) {
            return NextResponse.json(
                { error: "Configuração do Discord incompleta. Verifique as variáveis de ambiente." },
                { status: 500 }
            );
        }

        // Fetch all members from the Discord server
        const membersResponse = await fetch(
            `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members?limit=1000`,
            {
                headers: {
                    Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
                },
            }
        );

        if (!membersResponse.ok) {
            const errorText = await membersResponse.text();
            console.error("Discord API error:", errorText);
            return NextResponse.json(
                { error: "Erro ao buscar membros do Discord" },
                { status: 500 }
            );
        }

        const allMembers = await membersResponse.json();

        // Filter members who have the "jogador" role
        const players = allMembers.filter((member: any) =>
            member.roles?.includes(DISCORD_ROLE_PLAYER_ID)
        );

        console.log(`Found ${players.length} players with "jogador" role`);

        const tenantId = session.user.tenantId;
        if (!tenantId) {
            return NextResponse.json(
                { error: "Tenant ID não encontrado" },
                { status: 400 }
            );
        }

        // Sync players to database
        const syncedPlayers = [];
        for (const member of players) {
            try {
                const player = await prisma.user.upsert({
                    where: {
                        discordId_tenantId: {
                            discordId: member.user.id,
                            tenantId
                        }
                    },
                    update: {
                        username: member.user.username || member.nick || "Unknown",
                        avatar: member.user.avatar
                            ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`
                            : null,
                    },
                    create: {
                        discordId: member.user.id,
                        username: member.user.username || member.nick || "Unknown",
                        avatar: member.user.avatar
                            ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`
                            : null,
                        role: "PLAYER",
                        isAdmin: false,
                        tenantId,
                    },
                });
                syncedPlayers.push(player);
            } catch (error) {
                console.error(`Error syncing player ${member.user.id}:`, error);
            }
        }

        return NextResponse.json({
            success: true,
            message: `${syncedPlayers.length} jogadores sincronizados com sucesso!`,
            count: syncedPlayers.length,
            players: syncedPlayers.map(p => ({
                id: p.id,
                username: p.username,
                avatar: p.avatar
            }))
        });

    } catch (error) {
        console.error("Error syncing players:", error);
        return NextResponse.json(
            { error: "Erro ao sincronizar jogadores" },
            { status: 500 }
        );
    }
}

