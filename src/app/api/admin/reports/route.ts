import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { isStaff, AuthErrors } from "@/lib/permissions";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    // Allow both ADMIN and EVALUATOR to access reports
    if (!session?.user) {
        return NextResponse.json(AuthErrors.UNAUTHENTICATED, { status: 401 });
    }

    if (!isStaff(session)) {
        return NextResponse.json(AuthErrors.STAFF_REQUIRED, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const status = searchParams.get("status") || undefined;
        const search = searchParams.get("search") || undefined;

        const skip = (page - 1) * limit;

        const where = {
            ...(status && status !== "ALL" && { status }),
            ...(search && {
                OR: [
                    { accusedId: { contains: search, mode: "insensitive" as const } },
                    { reporter: { username: { contains: search, mode: "insensitive" as const } } },
                    { id: { equals: parseInt(search) } },
                ],
            }),
        };

        const [reports, total] = await Promise.all([
            prisma.report.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    reporter: {
                        select: { username: true, avatar: true },
                    },
                },
            }),
            prisma.report.count({ where }),
        ]);

        return NextResponse.json({
            reports,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching reports:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
