import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "./db";

export const authOptions: NextAuthOptions = {
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID || "",
            clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
            authorization: { params: { scope: "identify email guilds.members.read" } },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (!user.email && !user.id) return false;

            // Role Sync Logic
            let role = "PLAYER";
            let isAdmin = false;

            if (account?.provider === "discord" && account.access_token) {
                try {
                    const guildId = process.env.DISCORD_GUILD_ID?.trim();
                    const adminRoleId = process.env.DISCORD_ROLE_ADMIN_ID?.trim();
                    const evaluatorRoleId = process.env.DISCORD_ROLE_EVALUATOR_ID?.trim();

                    console.log(`[AUTH] Configured Guild ID: '${guildId}'`);
                    console.log(`[AUTH] Configured Admin Role ID: '${adminRoleId}'`);

                    if (guildId) {
                        const url = `https://discord.com/api/users/@me/guilds/${guildId}/member`;

                        const res = await fetch(url, {
                            headers: {
                                Authorization: `Bearer ${account.access_token}`,
                            },
                        });

                        if (res.ok) {
                            const member = await res.json();
                            const roles = member.roles as string[];
                            console.log(`[AUTH] User Roles from Discord:`, roles);

                            // Check for Admin Match
                            if (adminRoleId && roles.includes(adminRoleId)) {
                                console.log(`[AUTH] MATCH FOUND: User has Admin Role (${adminRoleId})`);
                                role = "ADMIN";
                                isAdmin = true;
                            }
                            // Check for Evaluator Match
                            else if (evaluatorRoleId && roles.includes(evaluatorRoleId)) {
                                console.log(`[AUTH] MATCH FOUND: User has Evaluator Role (${evaluatorRoleId})`);
                                role = "EVALUATOR";
                            }
                            else {
                                console.log("[AUTH] NO MATCH: User has neither Admin nor Evaluator roles.");
                            }
                        } else {
                            console.error(`[AUTH] Discord API Error: ${res.status} ${res.statusText}`);
                            const errorText = await res.text();
                            console.error(`[AUTH] Response Body: ${errorText}`);
                        }
                    } else {
                        console.error("[AUTH] Missing DISCORD_GUILD_ID in environment variables");
                    }
                } catch (error) {
                    console.error("Error fetching Discord roles:", error);
                }
            }

            // Sync user to database
            try {
                await prisma.user.upsert({
                    where: { id: user.id },
                    update: {
                        username: user.name || "Unknown",
                        avatar: user.image,
                        role: role,
                        isAdmin: isAdmin
                    },
                    create: {
                        id: user.id,
                        username: user.name || "Unknown",
                        avatar: user.image,
                        role: role,
                        isAdmin: isAdmin
                    },
                });
                return true;
            } catch (error) {
                console.error("Error syncing user:", error);
                return false;
            }
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                // Fetch extended user details
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.sub },
                });

                if (dbUser) {
                    session.user = {
                        ...session.user,
                        id: dbUser.id,
                        isAdmin: dbUser.isAdmin,
                        role: dbUser.role
                    };
                }
            }
            return session;
        },
    },
    theme: {
        colorScheme: 'dark',
        brandColor: '#8b5cf6', // Violet
    },
    pages: {
        signIn: '/login',
    }
};
