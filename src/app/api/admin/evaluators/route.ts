import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isAdmin, AuthErrors } from "@/lib/permissions";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is authenticated and is an ADMIN
        if (!session?.user) {
            return NextResponse.json(AuthErrors.UNAUTHENTICATED, { status: 401 });
        }

        if (!isAdmin(session)) {
            return NextResponse.json(AuthErrors.ADMIN_REQUIRED, { status: 403 });
        }

        // Fetch all evaluators
        const evaluators = await prisma.user.findMany({
            where: {
                role: "EVALUATOR",
            },
            select: {
                id: true,
                username: true,
                avatar: true,
                createdAt: true,
            },
        });

        // Get all report stats in a single query
        const reportStats = await prisma.report.groupBy({
            by: ["handledBy", "status"],
            _count: {
                id: true,
            },
            _max: {
                updatedAt: true,
            },
            where: {
                handledBy: {
                    not: null,
                },
            },
        });

        // Get last activity per evaluator
        const lastActivityPerEvaluator = await prisma.report.groupBy({
            by: ["handledBy"],
            _max: {
                updatedAt: true,
            },
            where: {
                handledBy: {
                    not: null,
                },
            },
        });

        // Create maps for quick lookup
        type StatsMap = Map<string, { total: number; approved: number; rejected: number; investigating: number }>;
        const statsMap: StatsMap = new Map();

        for (const stat of reportStats) {
            if (!stat.handledBy) continue;

            if (!statsMap.has(stat.handledBy)) {
                statsMap.set(stat.handledBy, { total: 0, approved: 0, rejected: 0, investigating: 0 });
            }

            const entry = statsMap.get(stat.handledBy)!;
            entry.total += stat._count.id;

            if (stat.status === "APPROVED") entry.approved += stat._count.id;
            else if (stat.status === "REJECTED") entry.rejected += stat._count.id;
            else if (stat.status === "INVESTIGATING") entry.investigating += stat._count.id;
        }

        const lastActivityMap = new Map(
            lastActivityPerEvaluator.map((r) => [r.handledBy, r._max.updatedAt])
        );

        // Build evaluators with stats efficiently
        const evaluatorsWithStats = evaluators.map((evaluator) => {
            const stats = statsMap.get(evaluator.id) || {
                total: 0,
                approved: 0,
                rejected: 0,
                investigating: 0,
            };
            const lastActivity = lastActivityMap.get(evaluator.id) || null;

            return {
                id: evaluator.id,
                username: evaluator.username,
                avatar: evaluator.avatar,
                joinedAt: evaluator.createdAt,
                stats: {
                    totalHandled: stats.total,
                    approved: stats.approved,
                    rejected: stats.rejected,
                    investigating: stats.investigating,
                    lastActivity,
                },
            };
        });

        // Sort by total handled (most active first)
        evaluatorsWithStats.sort((a, b) => b.stats.totalHandled - a.stats.totalHandled);

        // Calculate overall statistics
        const totalEvaluators = evaluatorsWithStats.length;
        const activeEvaluators = evaluatorsWithStats.filter((e) => {
            if (!e.stats.lastActivity) return false;
            const daysSinceActivity =
                (Date.now() - new Date(e.stats.lastActivity).getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceActivity <= 7; // Active if evaluated in last 7 days
        }).length;
        const totalReportsHandled = evaluatorsWithStats.reduce(
            (sum, e) => sum + e.stats.totalHandled,
            0
        );
        const mostActiveEvaluator = evaluatorsWithStats[0] || null;

        return NextResponse.json({
            evaluators: evaluatorsWithStats,
            summary: {
                totalEvaluators,
                activeEvaluators,
                totalReportsHandled,
                mostActiveEvaluator: mostActiveEvaluator
                    ? {
                          username: mostActiveEvaluator.username,
                          totalHandled: mostActiveEvaluator.stats.totalHandled,
                      }
                    : null,
            },
        });
    } catch (error) {
        console.error("Error fetching evaluators:", error);
        return NextResponse.json(
            { error: "Erro ao buscar avaliadores" },
            { status: 500 }
        );
    }
}
