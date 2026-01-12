import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "./db";

// Validate required environment variables
const requiredEnvVars = {
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID,
};

const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

if (missingVars.length > 0) {
    console.error(`[AUTH] CRITICAL: Missing required environment variables: ${missingVars.join(", ")}`);
}

export const authOptions: NextAuthOptions = {
    debug: process.env.NODE_ENV === "development",
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
            authorization: { params: { scope: "identify email guilds.members.read" } },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
    },
    callbacks: {
        async signIn({ user, account }) {
            // Basic validation
            if (!user.email && !user.id) return false;
            return true;
        },

        async jwt({ token, user, account, trigger, session }) {
            // Initial sign in data
            if (user) {
                token.id = user.id;
                token.email = user.email;
            }

            // Handle Session Updates (client-side triggers)
            if (trigger === "update" && session) {
                return { ...token, ...session };
            }

            // Sync Discord Roles on Sign In (Access Token available)
            if (account?.provider === "discord" && account.access_token) {
                try {
                    // First, get the tenant to know which guild and roles to check
                    const { getTenantFromRequest } = await import("./tenant");
                    const tenant = await getTenantFromRequest();

                    // Use tenant-specific guild ID, fallback to env for backwards compatibility
                    const guildId = tenant?.discordGuildId || process.env.DISCORD_GUILD_ID;

                    if (guildId) {
                        const res = await fetch(`https://discord.com/api/users/@me/guilds/${guildId}/member`, {
                            headers: { Authorization: `Bearer ${account.access_token}` },
                        });

                        if (res.ok) {
                            const member = await res.json();
                            const roles = (member.roles || []) as string[];

                            // Role ID Definitions - Use tenant-specific roles if available
                            const adminRoleIds = tenant?.discordRoleAdmin
                                ? [tenant.discordRoleAdmin]
                                : (process.env.DISCORD_ROLE_ADMIN_ID || "").split(",").map(id => id.trim()).filter(Boolean);

                            const evaluatorRoleIds = tenant?.discordRoleEvaluator
                                ? [tenant.discordRoleEvaluator]
                                : (process.env.DISCORD_ROLE_EVALUATOR_ID || "").split(",").map(id => id.trim()).filter(Boolean);

                            // Determine Role
                            let determinedRole = "PLAYER";
                            let isAdmin = false;

                            // Check Discord roles for permissions
                            if (adminRoleIds.some(id => roles.includes(id))) {
                                determinedRole = "ADMIN";
                                isAdmin = true;
                            } else if (evaluatorRoleIds.some(id => roles.includes(id))) {
                                determinedRole = "EVALUATOR";
                                isAdmin = false;
                            }

                            // Update Token
                            token.role = determinedRole;
                            token.isAdmin = isAdmin;
                            token.discordRoles = roles;

                            // Sync to Database
                            if (tenant && user) {
                                try {
                                    // Upsert User
                                    const dbUser = await prisma.user.upsert({
                                        where: {
                                            discordId_tenantId: {
                                                discordId: user.id,
                                                tenantId: tenant.id
                                            }
                                        },
                                        update: {
                                            username: user.name || "Unknown",
                                            avatar: user.image,
                                            role: token.role as string,
                                            isAdmin: token.isAdmin as boolean,
                                        },
                                        create: {
                                            discordId: user.id,
                                            username: user.name || "Unknown",
                                            avatar: user.image,
                                            role: token.role as string,
                                            isAdmin: token.isAdmin as boolean,
                                            tenantId: tenant.id
                                        }
                                    });

                                    // Attach DB ID and Tenant ID to Token
                                    token.dbId = dbUser.id;
                                    token.tenantId = tenant.id;
                                } catch (err) {
                                    console.error("[AUTH] DB Sync Error:", err);
                                }
                            }
                        } else {
                            console.warn(`[AUTH] Failed to fetch member data from Guild ${guildId}. Status: ${res.status}`);
                        }
                    }
                } catch (error) {
                    console.error("[AUTH] Discord Role Sync Failed:", error);
                }
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = (token.dbId as string) || (token.id as string);
                session.user.discordId = token.id as string;
                session.user.role = (token.role as string) || "PLAYER";
                session.user.isAdmin = (token.isAdmin as boolean) || false;
                session.user.discordRoles = (token.discordRoles as string[]) || [];
                session.user.tenantId = (token.tenantId as string) || undefined;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
        error: "/login" // Redirect errors back to login
    },
};
