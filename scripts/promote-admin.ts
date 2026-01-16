import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Discord ID provided by user in previous context
    const TARGET_DISCORD_ID = "405844020967899137";

    console.log(`Promoting User ${TARGET_DISCORD_ID} to ADMIN in Default Tenant...`);

    const defaultTenant = await prisma.tenant.findUnique({
        where: { slug: "default" }
    });

    if (!defaultTenant) {
        console.error("❌ 'Default' tenant not found. Run update-default-tenant.ts first.");
        return;
    }

    // Upsert the user to ensure they exist and are ADMIN
    const user = await prisma.user.upsert({
        where: {
            discordId_tenantId: {
                discordId: TARGET_DISCORD_ID,
                tenantId: defaultTenant.id
            }
        },
        update: {
            role: "ADMIN",
            isAdmin: true
        },
        create: {
            discordId: TARGET_DISCORD_ID,
            tenantId: defaultTenant.id,
            username: "System Admin (Bootstrap)",
            role: "ADMIN",
            isAdmin: true
        }
    });

    console.log("✅ User Promoted Successfully!");
    console.log(`User: ${user.username} (${user.id})`);
    console.log(`Role: ${user.role}`);
    console.log(`Tenant: ${defaultTenant.name}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
