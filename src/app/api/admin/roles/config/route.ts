
import { getServerSession } from "@/lib/auth";
import { NextResponse } from "next/server";

// Simulated config storage (in production, this would be in the database)
let roleConfig = {
    guildId: process.env.DISCORD_GUILD_ID || "",
    adminRoleId: process.env.DISCORD_ADMIN_ROLE_ID || "",
    evaluatorRoleId: process.env.DISCORD_EVALUATOR_ROLE_ID || ""
};

// GET - Get current configuration
export async function GET() {
    const session = await getServerSession();

    if (!session?.user?.isAdmin && session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    return NextResponse.json({ config: roleConfig });
}

// PATCH - Update configuration
export async function PATCH(req: Request) {
    const session = await getServerSession();

    if (!session?.user?.isAdmin && session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    try {
        const { guildId, adminRoleId, evaluatorRoleId } = await req.json();

        roleConfig = {
            guildId: guildId || roleConfig.guildId,
            adminRoleId: adminRoleId || roleConfig.adminRoleId,
            evaluatorRoleId: evaluatorRoleId || roleConfig.evaluatorRoleId
        };

        return NextResponse.json({
            success: true,
            config: roleConfig,
            message: "Configuração atualizada! Nota: Para persistir, atualize seu arquivo .env"
        });
    } catch (error) {
        console.error("Error updating config:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

