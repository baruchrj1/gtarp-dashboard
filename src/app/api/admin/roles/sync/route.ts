import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// POST - Sync user roles from Discord
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    // Check admin permissions
    if (!session?.user?.isAdmin && session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        // Fetch user from database
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true, role: true, isAdmin: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get Discord configuration
        const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
        const guildId = process.env.DISCORD_GUILD_ID?.trim();
        const adminRoleId = process.env.DISCORD_ROLE_ADMIN_ID?.trim();
        const evaluatorRoleId = process.env.DISCORD_ROLE_EVALUATOR_ID?.trim();

        if (!botToken) {
            console.error("[SYNC] DISCORD_BOT_TOKEN not configured");
            return NextResponse.json({
                error: "Discord bot token not configured. Please set DISCORD_BOT_TOKEN in environment variables."
            }, { status: 500 });
        }

        if (!guildId) {
            console.error("[SYNC] DISCORD_GUILD_ID not configured");
            return NextResponse.json({
                error: "Discord guild ID not configured. Please set DISCORD_GUILD_ID in environment variables."
            }, { status: 500 });
        }

        console.log(`[SYNC] Syncing roles for user ${user.username} (${userId}) in guild ${guildId}`);

        // Fetch member data from Discord
        const discordUrl = `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`;
        const discordRes = await fetch(discordUrl, {
            headers: {
                Authorization: `Bot ${botToken}`,
            },
        });

        if (!discordRes.ok) {
            const errorText = await discordRes.text();
            console.error(`[SYNC] Discord API error: ${discordRes.status} ${discordRes.statusText}`);
            console.error(`[SYNC] Response: ${errorText}`);

            if (discordRes.status === 404) {
                return NextResponse.json({
                    error: `User ${user.username} is not a member of the Discord server.`
                }, { status: 404 });
            } else if (discordRes.status === 401) {
                return NextResponse.json({
                    error: "Invalid Discord bot token. Please check DISCORD_BOT_TOKEN configuration."
                }, { status: 500 });
            } else if (discordRes.status === 403) {
                return NextResponse.json({
                    error: "Discord bot lacks permissions to read guild members. Please check bot permissions."
                }, { status: 500 });
            }

            return NextResponse.json({
                error: `Discord API error: ${discordRes.status} ${discordRes.statusText}`
            }, { status: 500 });
        }

        const member = await discordRes.json();
        const roles = (member.roles || []) as string[];

        console.log(`[SYNC] User has ${roles.length} roles in Discord`);

        // Determine role based on Discord roles
        let newRole = "PLAYER";
        let newIsAdmin = false;

        if (adminRoleId && roles.includes(adminRoleId)) {
            console.log(`[SYNC] ✅ User has ADMIN role (${adminRoleId})`);
            newRole = "ADMIN";
            newIsAdmin = true;
        } else if (evaluatorRoleId && roles.includes(evaluatorRoleId)) {
            console.log(`[SYNC] ✅ User has EVALUATOR role (${evaluatorRoleId})`);
            newRole = "EVALUATOR";
        } else {
            console.log("[SYNC] User has PLAYER role (no special roles found)");
        }

        // Update user in database
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                role: newRole,
                isAdmin: newIsAdmin,
            },
            select: {
                id: true,
                username: true,
                role: true,
                isAdmin: true
            }
        });

        console.log(`[SYNC] ✅ User ${updatedUser.username} synced successfully: ${updatedUser.role} (isAdmin: ${updatedUser.isAdmin})`);

        return NextResponse.json({
            success: true,
            user: updatedUser,
            message: `Cargo de ${updatedUser.username} sincronizado: ${updatedUser.role}`
        });

    } catch (error) {
        console.error("[SYNC] Error syncing roles:", error);
        return NextResponse.json({
            error: "Internal server error while syncing roles"
        }, { status: 500 });
    }
}
