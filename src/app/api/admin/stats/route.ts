
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getTenantFromRequest } from "@/lib/tenant";

export async function GET(req: Request) {
    const session = await getServerSession();

    if (!session?.user?.isAdmin && session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const tenant = await getTenantFromRequest();
    if (!tenant) return NextResponse.json({ error: "Tenant Not Found" }, { status: 404 });
    const tenantId = tenant.id;

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "7d"; // 7d, 30d, month
    const dateParam = searchParams.get("date"); // YYYY-MM for month

    // Calculate date filter
    let dateFilter: any = {};
    let startDate = new Date();
    let endDate = new Date();

    if (range === "30d") {
        startDate.setDate(startDate.getDate() - 30);
        dateFilter = { gte: startDate };
    } else if (range === "month" && dateParam) {
        // Specific month: YYYY-MM
        const [year, month] = dateParam.split("-").map(Number);
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0, 23, 59, 59); // Last day of month
        dateFilter = { gte: startDate, lte: endDate };
    } else {
        // Default 7d
        startDate.setDate(startDate.getDate() - 7);
        dateFilter = { gte: startDate };
    }

    try {
        // 1. Overview counts - Apply filter + TenantId
        const [total, pending, investigating, approved, rejected] = await Promise.all([
            prisma.report.count({ where: { tenantId, createdAt: dateFilter } }),
            prisma.report.count({ where: { tenantId, status: "PENDING", createdAt: dateFilter } }),
            prisma.report.count({ where: { tenantId, status: "INVESTIGATING", createdAt: dateFilter } }),
            prisma.report.count({ where: { tenantId, status: "APPROVED", createdAt: dateFilter } }),
            prisma.report.count({ where: { tenantId, status: "REJECTED", createdAt: dateFilter } }),
        ]);

        // 2. Reports by Reason (Top 5)
        const reportsByReason = await prisma.report.groupBy({
            by: ["reason"],
            _count: { reason: true },
            where: { tenantId, createdAt: dateFilter },
            orderBy: { _count: { reason: "desc" } },
            take: 5,
        });

        // 3. Activity Chart
        const activityReports = await prisma.report.findMany({
            where: { tenantId, createdAt: dateFilter },
            select: { createdAt: true },
        });

        // Group by day manually
        const dailyActivityMap = new Map<string, number>();

        // Calculate days in range
        // Use realistic loop limit based on range type, max 31 for month/30d, 7 for 7d
        const daysToLoop = range === "month" ? endDate.getDate() : (range === "30d" ? 30 : 7);

        // Initialize map with dates
        if (range === "month") {
            // For month view, fill all days of that month
            for (let i = 1; i <= daysToLoop; i++) {
                const d = new Date(startDate.getFullYear(), startDate.getMonth(), i);
                const dateStr = d.toISOString().split('T')[0];
                dailyActivityMap.set(dateStr, 0);
            }
        } else {
            // For relative ranges (7d, 30d)
            for (let i = 0; i < daysToLoop; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                dailyActivityMap.set(dateStr, 0);
            }
        }

        activityReports.forEach(r => {
            const dateStr = r.createdAt.toISOString().split('T')[0];
            if (dailyActivityMap.has(dateStr)) {
                dailyActivityMap.set(dateStr, dailyActivityMap.get(dateStr)! + 1);
            }
        });

        // Sort by date
        const dailyStats = Array.from(dailyActivityMap.entries())
            .map(([date, count]) => ({
                date: date.split('-').slice(1).reverse().join('/'),
                fullDate: date,
                count
            }))
            .sort((a, b) => a.fullDate.localeCompare(b.fullDate));


        // 4. Staff Performance (Top Evaluators)
        const evaluatorStats = await prisma.report.groupBy({
            by: ["handledBy"],
            _count: { handledBy: true },
            where: {
                tenantId,
                createdAt: dateFilter,
                handledBy: { not: null },
                status: { in: ["APPROVED", "REJECTED"] },
            },
            orderBy: { _count: { handledBy: "desc" } },
            take: 5,
        });

        // Enrich with usernames
        const staffIds = evaluatorStats.map(stat => stat.handledBy).filter(Boolean) as string[];
        const staffUsers = await prisma.user.findMany({
            where: { id: { in: staffIds }, tenantId }, // Also ensure users belong to this tenant
            select: { id: true, username: true, role: true },
        });

        const topStaff = evaluatorStats.map(stat => {
            const user = staffUsers.find(u => u.id === stat.handledBy);
            return {
                name: user ? user.username : "Unknown",
                count: stat._count.handledBy,
                role: user ? user.role : "EVALUATOR",
            };
        });

        // 5. Top Punished Groups (Organizations)
        const topGroupsData = await prisma.report.groupBy({
            by: ["accusedFamily"],
            _count: { accusedFamily: true },
            where: {
                tenantId,
                status: "APPROVED",
                createdAt: dateFilter,
                accusedFamily: { not: null },
            },
            orderBy: { _count: { accusedFamily: "desc" } },
            take: 5,
        });

        const topGroups = topGroupsData.map(g => ({
            name: g.accusedFamily,
            count: g._count.accusedFamily
        }));

        // 6. Top Punished Players
        const topAccusedData = await prisma.report.groupBy({
            by: ["accusedId", "accusedName"],
            _count: { id: true },
            where: {
                tenantId,
                status: "APPROVED",
                createdAt: dateFilter,
            },
            orderBy: { _count: { id: "desc" } },
            take: 5,
        });

        const topAccused = topAccusedData.map(p => ({
            id: p.accusedId,
            name: p.accusedName || "Desconhecido",
            count: p._count.id
        }));

        // Translation map for report reasons
        const reasonTranslations: Record<string, string> = {
            "Bug Abuse": "Abuso de Bugs",
            "Bugs": "Abuso de Bugs",
            "Combat Log": "Saiu em Ação",
            "Combat Logging": "Saiu em Ação",
            "Fail RP": "Anti-RP",
            "RDM": "RDM (Morte Aleatória)",
            "VDM": "VDM (Atropelamento)",
            "Dark RP": "Dark RP (Pesado)",
            "Power Gaming": "Power Gaming",
            "Insulto": "Ofensas/Xingamentos",
            "Toxidade": "Toxicidade",
            "Metagaming": "Metagaming",
            "Outros": "Outros"
        };

        return NextResponse.json({
            overview: {
                total,
                pending,
                investigating,
                resolved: approved + rejected,
                approved,
                rejected
            },
            topReasons: reportsByReason.map(r => ({
                name: reasonTranslations[r.reason] || r.reason,
                value: r._count.reason
            })),
            dailyStats,
            topStaff,
            topGroups,
            topAccused
        });

    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

