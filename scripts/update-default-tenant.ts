
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Updating default tenant credentials...");

    const tenantSlug = "default"; // The slug for localhost

    // Credentials provided by user
    const updates = {
        discordClientId: "1459429173897597001",
        discordClientSecret: "zO1RvmA3oA_-_ct12yV4AtdDhgRyIdE-",
        discordGuildId: "1459392828281979024",
        discordRoleAdmin: "1459408512806555864",
        discordRoleEvaluator: "1459408514282684539",
        discordRolePlayer: "1459408515738374195"
    };

    try {
        const tenant = await prisma.tenant.upsert({
            where: { slug: tenantSlug },
            update: updates,
            create: {
                slug: tenantSlug,
                name: "Default Tenant",
                subdomain: "default",
                ...updates
            }
        });
        console.log("✅ Successfully updated tenant:", tenant.name);
        console.log("New Client ID:", tenant.discordClientId);
    } catch (error) {
        console.error("❌ Error updating tenant:", error);

        // Fallback: try finding by subdomain logic if slug isn't strictly 'default' in DB?
        // But usually dev env uses 'default' slug logic.
        // Let's try upsert if update fails? No, better safe.
    } finally {
        await prisma.$disconnect();
    }
}

main();
