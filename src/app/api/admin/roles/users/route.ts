import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// GET - List all users with their roles
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin && session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                username: true,
                avatar: true,
                role: true,
                isAdmin: true,
                createdAt: true
            }
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH - Update user role
export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin && session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    try {
        const { userId, role, isAdmin } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        const validRoles = ["PLAYER", "EVALUATOR", "ADMIN"];
        if (role && !validRoles.includes(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(role !== undefined && { role }),
                ...(isAdmin !== undefined && { isAdmin })
            },
            select: {
                id: true,
                username: true,
                role: true,
                isAdmin: true
            }
        });

        return NextResponse.json({
            success: true,
            user: updatedUser,
            message: `Cargo de ${updatedUser.username} atualizado para ${updatedUser.role}`
        });
    } catch (error) {
        console.error("Error updating user role:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
