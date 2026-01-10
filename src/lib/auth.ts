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

            // Sync user to database
            try {
                await prisma.user.upsert({
                    where: { id: user.id },
                    update: {
                        username: user.name || "Unknown",
                        avatar: user.image,
                    },
                    create: {
                        id: user.id,
                        username: user.name || "Unknown",
                        avatar: user.image,
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
                // Fetch extended user details (like isAdmin)
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.sub },
                });

                if (dbUser) {
                    session.user = {
                        ...session.user,
                        // @ts-ignore
                        id: dbUser.id,
                        // @ts-ignore
                        isAdmin: dbUser.isAdmin
                    };
                }
            }
            return session;
        },
    },
    theme: {
        colorScheme: 'dark',
        brandColor: '#8b5cf6', // Violet
        logo: '' // We can add a logo later
    }
};
