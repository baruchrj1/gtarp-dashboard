export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth";
import { isAdmin, AuthErrors } from "@/lib/permissions";

/**
 * GET: Returns the current Discord configuration
 * Note: These values are read from environment variables and cannot be modified at runtime.
 * To change these values, update your environment variables in your deployment platform.
 */
export async function GET() {
    const session = await getServerSession();

    if (!session?.user) {
        return NextResponse.json(AuthErrors.UNAUTHENTICATED, { status: 401 });
    }

    if (!isAdmin(session)) {
        return NextResponse.json(AuthErrors.ADMIN_REQUIRED, { status: 403 });
    }

    const config = {
        guildId: process.env.DISCORD_GUILD_ID || "",
        adminRoleId: process.env.DISCORD_ROLE_ADMIN_ID || "",
        evaluatorRoleId: process.env.DISCORD_ROLE_EVALUATOR_ID || "",
        // Indicate that these are read-only
        readOnly: true,
        message: "Para alterar estas configurações, atualize as variáveis de ambiente no seu servidor de deploy (Vercel, etc.)",
    };

    return NextResponse.json({ config });
}

/**
 * PATCH: Removed - Environment variables should not be modified at runtime.
 * This was a security risk and didn't persist changes anyway.
 *
 * To update Discord configuration:
 * 1. Go to your deployment platform (Vercel, etc.)
 * 2. Update the environment variables
 * 3. Redeploy the application
 */
export async function PATCH() {
    return NextResponse.json(
        {
            error: "Esta funcionalidade foi desabilitada por segurança.",
            message: "Para alterar configurações do Discord, atualize as variáveis de ambiente diretamente no seu servidor de deploy (Vercel, etc.) e faça um novo deploy.",
        },
        { status: 405 }
    );
}

