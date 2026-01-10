import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "./db";

export const authOptions: NextAuthOptions = {
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID || "",
            clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
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
                    const guildId = process.env.DISCORD_GUILD_ID;
                    const adminRoleId = process.env.DISCORD_ROLE_ADMIN_ID;
                    const evaluatorRoleId = process.env.DISCORD_ROLE_EVALUATOR_ID;

                    if (guildId) {
                        const res = await fetch(`https://discord.com/api/users/@me/guilds/${guildId}/member`, {
                            headers: {
                                Authorization: `Bearer ${account.access_token}`,
                            },
                        });

                        if (res.ok) {
                            const member = await res.json();
                            const roles = member.roles as string[];

                            if (adminRoleId && roles.includes(adminRoleId)) {
                                role = "ADMIN";
                                isAdmin = true;
                            } else if (evaluatorRoleId && roles.includes(evaluatorRoleId)) {
                                role = "EVALUATOR";
                            }
                        } else {
                            console.error("Failed to fetch guild member:", await res.text());
                        }
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
