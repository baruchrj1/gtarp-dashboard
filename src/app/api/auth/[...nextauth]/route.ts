import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { authOptions } from "@/lib/auth";
import { getTenantBySubdomain, getTenantByCustomDomain } from "@/lib/tenant";
import { NextRequest } from "next/server";

// Função para buscar o provider configurado dinamicamente
async function getAuthOptions(req: NextRequest): Promise<NextAuthOptions> {
    const url = new URL(req.url);
    const host = req.headers.get("host") || "";

    // Identificar tenant pelo domínio/subdomínio
    // OBS: Em localhost/vercel.app genérico, isso talvez não funcione sem subdomínio
    // Mas para produção (painel-client-1.vercel.app), deve funcionar se o domínio estiver cadastrado

    // Tenta achar tenant
    // 1. Custom Domain
    let tenant = await getTenantByCustomDomain(host);

    // 2. Subdomain check (logic simplified for brevity)
    if (!tenant) {
        const subdomain = host.split('.')[0];
        tenant = await getTenantBySubdomain(subdomain);
    }

    // Se achou tenant e ele tem credentials customizadas do Discord
    if (tenant && tenant.discordClientId && tenant.discordClientSecret) {
        // Clone base options logic
        const dynamicOptions: NextAuthOptions = {
            ...authOptions,
            providers: [
                DiscordProvider({
                    clientId: tenant.discordClientId,
                    clientSecret: tenant.discordClientSecret,
                    authorization: {
                        params: {
                            scope: "identify email guilds.members.read",
                        },
                    },
                }),
            ],
            // Precisamos passar dados do tenant para os callbacks, se necessario
            callbacks: {
                ...authOptions.callbacks,
                // Podemos injetar logica extra aqui se precisar
            }
        };
        return dynamicOptions;
    }

    // Fallback para config global (.env) se não achar tenant ou travar
    return authOptions;
}

const handler = async (req: NextRequest, context: any) => {
    const options = await getAuthOptions(req);
    return NextAuth(req, context, options);
};

export { handler as GET, handler as POST };
