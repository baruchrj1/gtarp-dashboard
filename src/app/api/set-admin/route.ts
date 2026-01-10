import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const { userId, role, isAdmin } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                role: role || "ADMIN",
                isAdmin: isAdmin !== undefined ? isAdmin : true
            },
            select: {
                id: true,
                username: true,
                role: true,
                isAdmin: true
            }
        });

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error("Error setting admin role:", error);
        return NextResponse.json({ error: "Failed to set admin role" }, { status: 500 });
    }
}
