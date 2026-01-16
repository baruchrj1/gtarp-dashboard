import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export const dynamic = 'force-dynamic'; // Ensure we get fresh settings

export async function GET() {
    try {
        const session = await getServerSession();
        const settings = await prisma.systemSetting.findMany();

        // Convert array to object for easier access
        // Explicitly whitelist public keys to avoid leaking webhooks
        const publicKeys = ["server_name", "server_logo", "theme_color"];

        const settingsMap = settings
            .filter(s => publicKeys.includes(s.key))
            .reduce((acc, current) => {
                acc[current.key] = current.value;
                return acc;
            }, {} as Record<string, string>);

        // Default values if not set
        const defaults = {
            server_name: "SYSTEM REPORTS",
            server_logo: "",
            theme_color: "#8b5cf6", // Default violet
        };

        const finalSettings = { ...defaults, ...settingsMap };

        // Override with user preferences if logged in
        if (session?.user?.id) {
            try {
                const user = await prisma.user.findUnique({
                    where: { id: session.user.id },
                    select: { preferences: true } as any
                });

                // @ts-ignore
                if ((user as any)?.preferences) {
                    const prefs = JSON.parse((user as any).preferences as string);
                    if (prefs.theme_color) {
                        finalSettings.theme_color = prefs.theme_color;
                    }
                }
            } catch (err) {
                console.error("Error loading user preferences:", err);
            }
        }

        return NextResponse.json({
            settings: finalSettings
        });
    } catch (error) {
        console.error("Error fetching settings:", error);
        // Fallback to defaults instead of 500 to prevent frontend crash
        return NextResponse.json({
            settings: {
                server_name: "SYSTEM REPORTS",
                server_logo: "",
                theme_color: "#8b5cf6",
            }
        });
    }
}
