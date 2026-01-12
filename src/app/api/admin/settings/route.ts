import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        const settings = await prisma.systemSetting.findMany();

        const settingsMap = settings.reduce((acc, current) => {
            acc[current.key] = current.value;
            return acc;
        }, {} as Record<string, string>);

        // Ensure defaults exist for UI
        const defaults = {
            server_name: "SYSTEM REPORTS",
            server_logo: "",
            theme_color: "#8b5cf6",
            discord_webhook_reports: "",
            discord_webhook_logs: "",
        };

        return NextResponse.json({
            settings: { ...defaults, ...settingsMap }
        });
    } catch (error) {
        console.error("Error fetching admin settings:", error);
        return NextResponse.json({ error: "Erro ao buscar configurações" }, { status: 500 });
    }
}
