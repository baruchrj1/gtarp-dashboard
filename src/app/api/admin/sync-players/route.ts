export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

import { isStaff, AuthErrors } from "@/lib/permissions";

import { getTenantFromRequest } from "@/lib/tenant";

export async function GET() {
    try {
        const session = await getServerSession();
        const tenant = await getTenantFromRequest();

        // Check if user is authenticated and is STAFF
        if (!session?.user) {
            return NextResponse.json(AuthErrors.UNAUTHENTICATED, { status: 401 });
        }

        if (!tenant) {
            return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
        }

        // Verify permissions using tenant-specific roles
        if (!isStaff(session)) {
            return NextResponse.json(AuthErrors.STAFF_REQUIRED, { status: 403 });
        }

        const discordConfig = {
            botToken: tenant.discordBotToken,
            guildId: tenant.discordGuildId,
            rolePlayerId: tenant.discordRolePlayer
        };

        if (!discordConfig.botToken || !discordConfig.guildId) {
            console.error(`[SYNC] Missing Discord config for tenant ${tenant.name}`);
            return NextResponse.json(
                { error: "Configuração do Discord incompleta para esta cidade." },
                { status: 500 }
            );
        }

        // Fetch all members from the Discord server
        const membersResponse = await fetch(
            `https://discord.com/api/v10/guilds/${discordConfig.guildId}/members?limit=1000`,
            {
                headers: {
                    Authorization: `Bot ${discordConfig.botToken}`,
                },
            }
        );

        if (!membersResponse.ok) {
            const errorText = await membersResponse.text();
            console.error(`[SYNC] Discord API error for tenant ${tenant.name}:`, errorText);
            return NextResponse.json(
                { error: "Erro ao buscar membros do Discord" },
                { status: 500 }
            );
        }

        const allMembers = await membersResponse.json();

        // Filter members who have the "jogador" role (if configured)
        const players = discordConfig.rolePlayerId
            ? allMembers.filter((member: any) => member.roles?.includes(discordConfig.rolePlayerId))
            : allMembers.filter((member: any) => !member.user.bot); // Fallback: all non-bot users if no player role configured

        console.log(`[SYNC] Found ${players.length} players for tenant ${tenant.name}`);

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

