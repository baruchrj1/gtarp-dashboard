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
                { error: "Acesso negado. Apenas administradores podem acessar esta funcionalidade." },
                { status: 403 }
            );
        }

        // Fetch all evaluators
        const evaluators = await prisma.user.findMany({
            where: {
                role: "EVALUATOR"
            },
            select: {
                id: true,
                username: true,
                avatar: true,
                createdAt: true,
            }
        });

        // For each evaluator, calculate their statistics
        const evaluatorsWithStats = await Promise.all(
            evaluators.map(async (evaluator) => {
                // Get all reports handled by this evaluator
                const handledReports = await prisma.report.findMany({
                    where: {
                        handledBy: evaluator.id
                    },
                    select: {
                        status: true,
                        updatedAt: true
                    }
                });

                // Calculate statistics
                const totalHandled = handledReports.length;
                const approved = handledReports.filter(r => r.status === "APPROVED").length;
                const rejected = handledReports.filter(r => r.status === "REJECTED").length;
                const investigating = handledReports.filter(r => r.status === "INVESTIGATING").length;

                // Get last activity (most recent report update)
                const lastActivity = handledReports.length > 0
                    ? handledReports.reduce((latest, report) =>
                        report.updatedAt > latest ? report.updatedAt : latest,
                        handledReports[0].updatedAt
                    )
                    : null;

                return {
                    id: evaluator.id,
                    username: evaluator.username,
                    avatar: evaluator.avatar,
                    joinedAt: evaluator.createdAt,
                    stats: {
                        totalHandled,
                        approved,
                        rejected,
                        investigating,
                        lastActivity
                    }
                };
            })
        );

        // Sort by total handled (most active first)
        evaluatorsWithStats.sort((a, b) => b.stats.totalHandled - a.stats.totalHandled);

        // Calculate overall statistics
        const totalEvaluators = evaluatorsWithStats.length;
        const activeEvaluators = evaluatorsWithStats.filter(e => {
            if (!e.stats.lastActivity) return false;
            const daysSinceActivity = (Date.now() - new Date(e.stats.lastActivity).getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceActivity <= 7; // Active if evaluated in last 7 days
        }).length;
        const totalReportsHandled = evaluatorsWithStats.reduce((sum, e) => sum + e.stats.totalHandled, 0);
        const mostActiveEvaluator = evaluatorsWithStats[0] || null;

        return NextResponse.json({
            evaluators: evaluatorsWithStats,
            summary: {
                totalEvaluators,
                activeEvaluators,
                totalReportsHandled,
                mostActiveEvaluator: mostActiveEvaluator ? {
                    username: mostActiveEvaluator.username,
                    totalHandled: mostActiveEvaluator.stats.totalHandled
                } : null
            }
        });

    } catch (error) {
        console.error("Error fetching evaluators:", error);
        return NextResponse.json(
            { error: "Erro ao buscar avaliadores" },
            { status: 500 }
        );
    }
}
