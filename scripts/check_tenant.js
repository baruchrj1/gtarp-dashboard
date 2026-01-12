
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const slug = 'painel-client-1';
    console.log(`Checking for tenant with slug/subdomain: ${slug}`);

    const tenant = await prisma.tenant.findFirst({
        where: {
            OR: [
                { slug: slug },
                { subdomain: slug }
            ]
        }
    });

    if (tenant) {
        console.log("✅ Tenant FOUND:", tenant.name);
        console.log("   ID:", tenant.id);
        console.log("   Discord Client ID:", tenant.discordClientId ? "Present" : "MISSING");
    } else {
        console.log("❌ Tenant NOT FOUND.");
    }
}

check()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
