import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check authentication
        if (!session?.user) {
            return NextResponse.json(
                { error: "Não autenticado" },
                { status: 401 }
            );
        }

        // Check if user is admin
        const role = session.user.role || "PLAYER";
        const isAdmin = role === "ADMIN" || session.user.isAdmin === true;

        if (!isAdmin) {
            return NextResponse.json(
                { error: "Acesso negado" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");

        if (!query || query.length < 2) {
            return NextResponse.json({ users: [] });
        }

        // Search users by ID or username
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    {
                        id: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                    {
                        username: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                    {
                        name: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                ],
            },
            select: {
                id: true,
                username: true,
                name: true,
                avatar: true,
            },
            take: 10,
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Error searching users:", error);
        return NextResponse.json(
            { error: "Erro ao buscar usuários" },
            { status: 500 }
        );
    }
}
