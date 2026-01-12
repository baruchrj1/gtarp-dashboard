import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Schema validation for incoming FiveM data
const fivemPayloadSchema = z.object({
    token: z.string(),
    type: z.enum(["PLAYERS_UPDATE", "SERVER_LOG", "BAN_EVENT"]),
    data: z.any(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validation = fivemPayloadSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: "Invalid payload", details: validation.error }, { status: 400 });
        }

        const { token, type, data } = validation.data;

        // 1. Authenticate Tenant by Token
        // We assume the token is stored in SystemSettings with key 'fivem_secret_token'
        const setting = await prisma.systemSetting.findFirst({
            where: {
                key: 'fivem_secret_token',
                value: token
            },
            include: {
                tenant: true
            }
        });

        if (!setting || !setting.tenant) {
            return NextResponse.json({ error: "Unauthorized: Invalid Token" }, { status: 401 });
        }

        const tenantId = setting.tenant.id;

        // 2. Process Data based on Type
        switch (type) {
            case "PLAYERS_UPDATE":
                // TODO: Update a "ServerStatus" or "OnlinePlayers" model/cache
                // For now, we can log it or store in a temporary KV if we had one.
                // In Phase 2, we might just return success so the dashboard knows it's connected.
                console.log(`[FiveM] [${setting.tenant.name}] Players Update: ${data.length} players online`);
                break;

            case "SERVER_LOG":
                // Create a log entry (if we have an AuditLog or specific ServerLog model)
                // For now, just log to console
                console.log(`[FiveM] [${setting.tenant.name}] Log:`, data);
                break;

            case "BAN_EVENT":
                // Handle automatic bans from server (e.g. anti-cheat)
                console.log(`[FiveM] [${setting.tenant.name}] Ban Event:`, data);
                break;
        }

        return NextResponse.json({ success: true, tenant: setting.tenant.name });

    } catch (error) {
        console.error("[API] FiveM Ingest Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
