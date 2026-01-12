import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic'; // Ensure we get fresh settings

export async function GET() {
    try {
        const settings = await prisma.systemSetting.findMany();

        // Convert array to object for easier access
        const settingsMap = settings.reduce((acc, current) => {
            acc[current.key] = current.value;
            return acc;
        }, {} as Record<string, string>);

        // Default values if not set
        const defaults = {
            server_name: "SYSTEM REPORTS",
            server_logo: "",
            theme_color: "#8b5cf6", // Default violet
        };

        return NextResponse.json({
            settings: { ...defaults, ...settingsMap }
        });
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json({ error: "Erro ao buscar configurações" }, { status: 500 });
    }
}
