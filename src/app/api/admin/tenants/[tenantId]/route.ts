
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Fix for Next.js 15+: params is a Promise
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ tenantId: string }> }) {
    const { tenantId } = await params;
    const session = await getServerSession();

    // Confirm Super Admin
    if (!(session?.user as any)?.isSuperAdmin) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const {
            name,
            slug,
            subdomain,
            isActive,
            discordGuildId,
            discordClientId,
            discordClientSecret,
            discordBotToken,
            discordRoleAdmin,
            discordRoleEvaluator,
            discordRolePlayer
        } = body;

        const updatedTenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                name,
                slug,
                subdomain,
                isActive,
                discordGuildId,
                discordClientId,
                discordClientSecret,
                discordBotToken,
                discordRoleAdmin,
                discordRoleEvaluator,
                discordRolePlayer
            }
        });

        return NextResponse.json(updatedTenant);
    } catch (error) {
        console.error("Error updating tenant:", error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}
