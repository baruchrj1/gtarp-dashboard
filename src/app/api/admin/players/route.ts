import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isStaff, AuthErrors } from "@/lib/permissions";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is authenticated and is STAFF (Admin or Evaluator)
        if (!session?.user) {
            return NextResponse.json(AuthErrors.UNAUTHENTICATED, { status: 401 });
        }

        if (!isStaff(session)) {
            return NextResponse.json(AuthErrors.STAFF_REQUIRED, { status: 403 });
        }

        // Fetch all players (users with PLAYER role)
        const players = await prisma.user.findMany({
            where: {
                role: "PLAYER",
            },
            select: {
                id: true,
                username: true,
                avatar: true,
                createdAt: true,
            },
        });

        // Get all report counts in a single query using groupBy
        const reportCounts = await prisma.report.groupBy({
            by: ["accusedId"],
            _count: {
                id: true,
            },
        });

        // Create a map for quick lookup
        const reportCountMap = new Map(
            reportCounts.map((r) => [r.accusedId, r._count.id])
        );

        // Build players with stats efficiently
        const playersWithStats = players.map((player) => {
            const reportsCount = reportCountMap.get(player.id) || 0;

            // Determine status based on report count
            let status = "active";
            if (reportsCount >= 10) {
                status = "suspended";
            } else if (reportsCount >= 5) {
                status = "warned";
            }

            return {
                id: player.id,
                name: player.username,
                avatar: player.avatar,
                reportsCount,
                status,
                joinedAt: player.createdAt,
            };
        });

        // Calculate statistics
        const totalPlayers = playersWithStats.length;
        const totalReports = playersWithStats.reduce((sum, p) => sum + p.reportsCount, 0);
        const suspendedPlayers = playersWithStats.filter((p) => p.status === "suspended").length;
        const warnedPlayers = playersWithStats.filter((p) => p.status === "warned").length;
        const mostReportedPlayer = playersWithStats.reduce(
            (max, player) => (player.reportsCount > max.reportsCount ? player : max),
            playersWithStats[0] || { name: "N/A", reportsCount: 0 }
        );

        return NextResponse.json({
            players: playersWithStats,
            stats: {
                totalPlayers,
                totalReports,
                suspendedPlayers,
                warnedPlayers,
                mostReportedPlayer: {
                    name: mostReportedPlayer.name,
                    reportsCount: mostReportedPlayer.reportsCount,
                },
            },
        });
    } catch (error) {
        console.error("Error fetching players:", error);
        return NextResponse.json(
            { error: "Erro ao buscar jogadores" },
            { status: 500 }
        );
    }
}
