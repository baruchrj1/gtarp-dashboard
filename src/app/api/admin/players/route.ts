import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is authenticated and is an ADMIN
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Acesso negado" },
                { status: 403 }
            );
        }

        // Fetch all players (users with PLAYER role)
        const players = await prisma.user.findMany({
            where: {
                role: "PLAYER"
            },
            select: {
                id: true,
                username: true,
                avatar: true,
                createdAt: true,
            }
        });

        // For each player, count their reports
        const playersWithStats = await Promise.all(
            players.map(async (player) => {
                const reportsCount = await prisma.report.findMany({
                    where: {
                        accusedId: player.id
                    }
                });

                // Determine status based on report count (simple logic)
                let status = "active";
                if (reportsCount.length >= 10) {
                    status = "suspended";
                } else if (reportsCount.length >= 5) {
                    status = "warned";
                }

                return {
                    id: player.id,
                    name: player.username,
                    avatar: player.avatar,
                    reportsCount: reportsCount.length,
                    status: status,
                    joinedAt: player.createdAt
                };
            })
        );

        // Calculate statistics
        const totalPlayers = playersWithStats.length;
        const totalReports = playersWithStats.reduce((sum, p) => sum + p.reportsCount, 0);
        const suspendedPlayers = playersWithStats.filter(p => p.status === "suspended").length;
        const warnedPlayers = playersWithStats.filter(p => p.status === "warned").length;
        const mostReportedPlayer = playersWithStats.reduce((max, player) =>
            player.reportsCount > max.reportsCount ? player : max
            , playersWithStats[0] || { name: "N/A", reportsCount: 0 });

        return NextResponse.json({
            players: playersWithStats,
            stats: {
                totalPlayers,
                totalReports,
                suspendedPlayers,
                warnedPlayers,
                mostReportedPlayer: {
                    name: mostReportedPlayer.name,
                    reportsCount: mostReportedPlayer.reportsCount
                }
            }
        });

    } catch (error) {
        console.error("Error fetching players:", error);
        return NextResponse.json(
            { error: "Erro ao buscar jogadores" },
            { status: 500 }
        );
    }
}
