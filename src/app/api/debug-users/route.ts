import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                role: true,
                isAdmin: true
            },
            orderBy: { createdAt: "desc" },
            take: 10
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
