export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
    const session = await getServerSession();
    
    if (!session?.user?.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ 
            message: "Re-authentication required for role sync. Please ask the user to log in again.",
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error("Error syncing roles:", error);
        return NextResponse.json({ error: "Failed to sync roles" }, { status: 500 });
    }
}

