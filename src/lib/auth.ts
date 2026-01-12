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

export const authOptions: NextAuthOptions = {
    debug: process.env.NODE_ENV === "development",
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
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
    // Configure session cookie to expire when browser closes
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
                    const guildId = process.env.DISCORD_GUILD_ID?.trim();
                    const adminRoleId = process.env.DISCORD_ROLE_ADMIN_ID?.trim();
                    const evaluatorRoleId = process.env.DISCORD_ROLE_EVALUATOR_ID?.trim();

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
                            console.log(`[AUTH] User has ${roles.length} roles in Discord`);

                            // Check for Admin role
                            if (adminRoleId && roles.includes(adminRoleId)) {
                                console.log(`[AUTH] ✅ User has ADMIN role (${adminRoleId})`);
                                role = "ADMIN";
                                isAdmin = true;
                            }
                            // Check for Evaluator role
                            else if (evaluatorRoleId && roles.includes(evaluatorRoleId)) {
                                console.log(`[AUTH] ✅ User has EVALUATOR role (${evaluatorRoleId})`);
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

            // Sync user to database (with error handling)
            try {
                console.log(`[AUTH] Syncing user to database: ${user.id}`);
                await prisma.user.upsert({
                    where: { id: user.id },
                    update: {
                        username: user.name || "Unknown",
                        avatar: user.image,
                        role: role,
                        isAdmin: isAdmin,
                    },
                    create: {
                        id: user.id,
                        username: user.name || "Unknown",
                        avatar: user.image,
                        role: role,
                        isAdmin: isAdmin,
                    },
                });
                console.log(`[AUTH] ✅ User synced successfully with role: ${role}`);
                return true;
            } catch (error) {
                console.error("[AUTH] ❌ Database sync error:", error);
                // Allow sign-in even if database sync fails
                console.warn("[AUTH] Allowing sign-in despite database error");
                return true;
            }
        },

        async jwt({ token, user, trigger, session }) {
            // On initial sign-in, add user ID to token
            if (user) {
                token.id = user.id;
                console.log(`[AUTH] JWT: Added user ID to token: ${user.id}`);
            }

            // Handle session updates
            if (trigger === "update" && session) {
                console.log("[AUTH] JWT: Session update triggered");
                return { ...token, ...session };
            }

            // Fetch latest user data from database
            if (token.sub) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: token.sub },
                    });

                    if (dbUser) {
                        token.role = dbUser.role;
                        token.isAdmin = dbUser.isAdmin;
                    } else {
                        console.warn(`[AUTH] JWT: User ${token.sub} not found in database`);
                    }
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

                    // Verifica se e super admin pelo email
                    const userEmail = session.user.email?.toLowerCase();
                    session.user.isSuperAdmin = userEmail
                        ? SUPER_ADMIN_EMAILS.includes(userEmail)
                        : false;
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
