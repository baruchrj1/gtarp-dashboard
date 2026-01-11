import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isAdmin, AuthErrors } from "@/lib/permissions";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Check authentication
        if (!session?.user) {
            return NextResponse.json(AuthErrors.UNAUTHENTICATED, { status: 401 });
        }

        // Check admin permission
        if (!isAdmin(session)) {
            return NextResponse.json(AuthErrors.ADMIN_REQUIRED, { status: 403 });
        }

        // Rate limiting: 10 requests per minute
        const rateLimitResult = checkRateLimit(`set-admin:${session.user.id}`, {
            limit: 10,
            window: 60000,
        });

        if (!rateLimitResult.success) {
            return rateLimitResponse(rateLimitResult.resetIn);
        }

        const { userId, role, isAdmin: setAdmin } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Validate role
        const validRoles = ["PLAYER", "EVALUATOR", "ADMIN"];
        if (role && !validRoles.includes(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        // Prevent self-demotion
        if (userId === session.user.id && role !== "ADMIN") {
            return NextResponse.json(
                { error: "Você não pode remover suas próprias permissões de admin" },
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                role: role || "ADMIN",
                isAdmin: setAdmin !== undefined ? setAdmin : true,
            },
            select: {
                id: true,
                username: true,
                role: true,
                isAdmin: true,
            },
        });

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error("Error setting admin role:", error);
        return NextResponse.json({ error: "Failed to set admin role" }, { status: 500 });
    }
}
