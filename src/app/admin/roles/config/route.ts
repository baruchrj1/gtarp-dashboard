import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = {
        guildId: process.env.DISCORD_GUILD_ID || "",
        adminRoleId: process.env.DISCORD_ROLE_ADMIN_ID || "",
        evaluatorRoleId: process.env.DISCORD_ROLE_EVALUATOR_ID || ""
    };

    return NextResponse.json({ config });
}

export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { guildId, adminRoleId, evaluatorRoleId } = await request.json();

        if (guildId) process.env.DISCORD_GUILD_ID = guildId;
        if (adminRoleId) process.env.DISCORD_ROLE_ADMIN_ID = adminRoleId;
        if (evaluatorRoleId) process.env.DISCORD_ROLE_EVALUATOR_ID = evaluatorRoleId;

        return NextResponse.json({ 
            message: "Configuration updated. Note: Environment variables need to be persisted in your deployment.",
            config: { guildId, adminRoleId, evaluatorRoleId }
        });
    } catch (error) {
        console.error("Error updating config:", error);
        return NextResponse.json({ error: "Failed to update configuration" }, { status: 500 });
    }
}
