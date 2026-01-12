import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "./db";

// Lista de emails de super admins (voce)
const SUPER_ADMIN_EMAILS = (process.env.SUPER_ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());

// Validate required environment variables
const requiredEnvVars = {
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
};

// Check for missing required variables
const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

if (missingVars.length > 0) {
    console.error(`[AUTH] CRITICAL: Missing required environment variables: ${missingVars.join(", ")}`);
    console.error(`[AUTH] Please set these variables in your .env file or Vercel dashboard`);
}

export function createAuthOptions(tenant?: {
    discordClientId?: string | null;
    discordClientSecret?: string | null;
    discordGuildId?: string | null;
    discordRoleAdmin?: string | null;
    discordRoleEvaluator?: string | null;
} | null): NextAuthOptions {
    return {
        debug: process.env.NODE_ENV === "development",
        secret: process.env.NEXTAUTH_SECRET,
        providers: [
            DiscordProvider({
                clientId: tenant?.discordClientId || process.env.DISCORD_CLIENT_ID!,
                clientSecret: tenant?.discordClientSecret || process.env.DISCORD_CLIENT_SECRET!,
                authorization: {
                    params: {
                        scope: "identify email guilds.members.read",
                    },
                },
            }),
        ],
        session: {
            strategy: "jwt",
            maxAge: 24 * 60 * 60, // 24 hours fallback
        },
        cookies: {
            sessionToken: {
                name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
                options: {
                    httpOnly: true,
                    sameSite: "lax",
                    path: "/",
                    secure: process.env.NODE_ENV === "production",
                },
            },
        },
        callbacks: {
            async signIn({ user, account, profile }) {
                console.log(`[AUTH] Sign-in attempt for user: ${user.email || user.id}`);

                if (!user.email && !user.id) {
                    console.error("[AUTH] User has no email or ID, rejecting sign-in");
                    return false;
                }

                // Initialize default role
                let role = "PLAYER";
                let isAdmin = false;

                // Attempt to fetch Discord roles (non-blocking)
                if (account?.provider === "discord" && account.access_token) {
                    try {
                        // Prioritize Tenant Config, then Env
                        const guildId = (tenant?.discordGuildId || process.env.DISCORD_GUILD_ID)?.trim();
                        const adminRoleId = (tenant?.discordRoleAdmin || process.env.DISCORD_ROLE_ADMIN_ID)?.trim();
                        const evaluatorRoleId = (tenant?.discordRoleEvaluator || process.env.DISCORD_ROLE_EVALUATOR_ID)?.trim();

                        if (!guildId) {
                            console.warn("[AUTH] DISCORD_GUILD_ID not configured, skipping role sync");
                        } else {
                            console.log(`[AUTH] Fetching roles for guild: ${guildId}`);

                            const url = `https://discord.com/api/users/@me/guilds/${guildId}/member`;
                            const res = await fetch(url, {
                                headers: {
                                    Authorization: `Bearer ${account.access_token}`,
                                },
                            });

                            if (res.ok) {
                                const member = await res.json();
                                const roles = (member.roles || []) as string[];
                                console.log(`[AUTH] 🔍 DEBUG ROLE CHECK:`);
                                console.log(`[AUTH] Target Guild ID: ${guildId}`);
                                console.log(`[AUTH] User Roles Found: ${JSON.stringify(roles)}`);
                                console.log(`[AUTH] Required Admin IDs: ${JSON.stringify(adminRoleId ? adminRoleId.split(',').map(r => r.trim()) : [])}`);
                                console.log(`[AUTH] Required Evaluator IDs: ${JSON.stringify(evaluatorRoleId ? evaluatorRoleId.split(',').map(r => r.trim()) : [])}`);

                                console.log(`[AUTH] User has ${roles.length} roles in Discord`);

                                // Check for Admin role
                                const adminRoleIds = adminRoleId ? adminRoleId.split(',').map(r => r.trim()) : [];
                                const evaluatorRoleIds = evaluatorRoleId ? evaluatorRoleId.split(',').map(r => r.trim()) : [];

                                if (adminRoleIds.some(id => roles.includes(id))) {
                                    console.log(`[AUTH] ✅ User has ADMIN role (matched one of: ${adminRoleIds.join(', ')})`);
                                    role = "ADMIN";
                                    isAdmin = true;
                                }
                                // Check for Evaluator role
                                else if (evaluatorRoleIds.some(id => roles.includes(id))) {
                                    console.log(`[AUTH] ✅ User has EVALUATOR role (matched one of: ${evaluatorRoleIds.join(', ')})`);
                                    role = "EVALUATOR";
                                } else {
                                    console.log("[AUTH] User has PLAYER role (no special roles found)");
                                }
                            } else {
                                const errorText = await res.text();
                                console.error(`[AUTH] Discord API error: ${res.status} ${res.statusText}`);
                                console.error(`[AUTH] Response: ${errorText}`);
                                console.warn("[AUTH] Continuing with default PLAYER role");
                            }
                        }
                    } catch (error) {
                        console.error("[AUTH] Error fetching Discord roles:", error);
                        console.warn("[AUTH] Continuing with default PLAYER role");
                    }
                }

                // Check if user is super admin - skip database sync for super admins
                const userEmail = user.email?.toLowerCase();
                // HARDCODED BYPASS FOR BARUCHRJ (ID: 405844020967899137)
                const isSuperAdmin = (userEmail ? SUPER_ADMIN_EMAILS.includes(userEmail) : false) || user.id === "405844020967899137";

                if (isSuperAdmin) {
                    console.log(`[AUTH] ✅ User is super admin (ID/Email Match), skipping tenant user sync`);
                    return true;
                }

                // For regular users, we need tenant context to sync
                // In development without tenant, skip database sync
                console.log(`[AUTH] ⚠️ No tenant context available for user sync (development mode)`);
                console.log(`[AUTH] User will be able to login but won't be synced to database`);
                return true;
            },

            async jwt({ token, user, account, profile, trigger, session }) {
                // On initial sign-in, add user ID to token
                if (user) {
                    token.id = user.id;
                    token.email = user.email;
                    console.log(`[AUTH] JWT: Added user ID to token: ${user.id}`);
                }

                // Sync Discord roles on initial sign-in
                if (account?.provider === "discord" && account.access_token) {
                    try {
                        // Prioritize Tenant Config, then Env
                        const guildId = (tenant?.discordGuildId || process.env.DISCORD_GUILD_ID)?.trim();
                        const adminRoleId = (tenant?.discordRoleAdmin || process.env.DISCORD_ROLE_ADMIN_ID)?.trim();
                        const evaluatorRoleId = (tenant?.discordRoleEvaluator || process.env.DISCORD_ROLE_EVALUATOR_ID)?.trim();

                        if (guildId) {
                            console.log(`[AUTH] JWT: Fetching roles for guild: ${guildId}`);
                            const url = `https://discord.com/api/users/@me/guilds/${guildId}/member`;
                            const res = await fetch(url, {
                                headers: { Authorization: `Bearer ${account.access_token}` },
                            });

                            if (res.ok) {
                                const member = await res.json();
                                const roles = (member.roles || []) as string[];
                                console.log(`[AUTH] JWT: User has ${roles.length} roles in Discord`);
                                token.discordRoles = roles; // Store all roles for strict tenant checking

                                let detectedRole = null;
                                const adminRoleIds = adminRoleId ? adminRoleId.split(',').map(r => r.trim()) : [];
                                const evaluatorRoleIds = evaluatorRoleId ? evaluatorRoleId.split(',').map(r => r.trim()) : [];

                                if (adminRoleIds.some(id => roles.includes(id))) {
                                    console.log(`[AUTH] JWT: ✅ User has ADMIN role (matched one of: ${adminRoleIds.join(', ')})`);
                                    token.role = "ADMIN";
                                    token.isAdmin = true;
                                    detectedRole = "ADMIN";
                                } else if (evaluatorRoleIds.some(id => roles.includes(id))) {
                                    console.log(`[AUTH] JWT: ✅ User has EVALUATOR role (matched one of: ${evaluatorRoleIds.join(', ')})`);
                                    token.role = "EVALUATOR";
                                    detectedRole = "EVALUATOR";
                                }

                                // Sync to Database if user exists to prevent overwrite
                                // The subsequent DB lookup will use this updated value
                                if (detectedRole && user?.id) {
                                    try {
                                        const discordId = user.id;
                                        const dbUser = await prisma.user.findFirst({
                                            where: { discordId: discordId },
                                        });

                                        if (dbUser && dbUser.role !== detectedRole) {
                                            console.log(`[AUTH] JWT: Syncing Discord role to DB: ${detectedRole}`);
                                            await prisma.user.update({
                                                where: { id: dbUser.id },
                                                data: {
                                                    role: detectedRole,
                                                    isAdmin: detectedRole === 'ADMIN'
                                                }
                                            });
                                        }
                                    } catch (error) {
                                        console.error("[AUTH] JWT: Error syncing role to DB:", error);
                                    }
                                }
                            }
                        }
                    } catch (error) {
                        console.error("[AUTH] JWT: Error fetching Discord roles:", error);
                    }
                }

                // Handle session updates
                if (trigger === "update" && session) {
                    console.log("[AUTH] JWT: Session update triggered");
                    return { ...token, ...session };
                }

                // Check if user is super admin (skip database lookup for super admins)
                const userEmail = (token.email as string)?.toLowerCase();
                if (userEmail && SUPER_ADMIN_EMAILS.includes(userEmail)) {
                    token.isSuperAdmin = true;
                    token.role = "SUPER_ADMIN";
                    token.isAdmin = true;
                    return token;
                }

                // For regular users, try to fetch from database (but don't fail if not found)
                // In multi-tenant setup, users are per-tenant so lookup may fail without tenant context
                if (token.sub) {
                    try {
                        const dbUser = await prisma.user.findFirst({
                            where: { discordId: token.sub },
                        });

                        if (dbUser) {
                            token.role = dbUser.role;
                            token.isAdmin = dbUser.isAdmin;
                        }
                        // Don't warn if user not found - expected in development without tenant
                    } catch (error) {
                        console.error("[AUTH] JWT callback error:", error);
                    }
                }

                return token;
            },

            async session({ session, token }) {
                try {
                    if (session.user && token.sub) {
                        session.user.id = token.sub;
                        session.user.isAdmin = (token.isAdmin as boolean) || false;
                        session.user.role = (token.role as string) || "PLAYER";
                        session.user.discordRoles = (token.discordRoles as string[]) || [];

                        // Use isSuperAdmin from token (already calculated in JWT callback)
                        session.user.isSuperAdmin = (token.isSuperAdmin as boolean) || false;
                    }
                } catch (error) {
                    console.error("[AUTH] Session callback error:", error);
                }
                return session;
            },
        },
        theme: {
            colorScheme: "dark",
            brandColor: "#8b5cf6", // Violet
        },
        pages: {
            signIn: "/login",
        },
    };
}

export const authOptions: NextAuthOptions = createAuthOptions(null);
