import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { authOptions, createAuthOptions } from "@/lib/auth"; // Import factory
import { getTenantBySubdomain, getTenantByCustomDomain } from "@/lib/tenant";
import { NextRequest } from "next/server";

// Função para buscar o provider configurado dinamicamente
async function getAuthOptions(req: NextRequest): Promise<NextAuthOptions> {
    const url = new URL(req.url);
    const host = req.headers.get("host") || "";

    // Tenta achar tenant
    // 1. Custom Domain
    let tenant = await getTenantByCustomDomain(host);

    // 2. Subdomain check
    if (!tenant) {
        const subdomain = host.split('.')[0];
        tenant = await getTenantBySubdomain(subdomain);
    }

    // Retorna opções customizadas com base no tenant (se existir) ou global
    // O factory createAuthOptions agora lida com tudo (providers E role syncing)
    return createAuthOptions(
        tenant ? {
            discordClientId: tenant.discordClientId,
            discordClientSecret: tenant.discordClientSecret,
            discordGuildId: tenant.discordGuildId,
            discordRoleAdmin: tenant.discordRoleAdmin,
            discordRoleEvaluator: tenant.discordRoleEvaluator
        } : null
    );
}

const handler = async (req: NextRequest, context: any) => {
    const options = await getAuthOptions(req);
    return NextAuth(req, context, options);
};

export { handler as GET, handler as POST };
