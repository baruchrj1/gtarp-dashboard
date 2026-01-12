const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const tenant = await prisma.tenant.findUnique({
        where: { slug: 'painel-client-1' },
    });

    if (tenant && tenant.discordClientId && tenant.discordClientId.endsWith(')')) {
        const newId = tenant.discordClientId.slice(0, -1);
        console.log(`Fixing Discord Client ID: ${tenant.discordClientId} -> ${newId}`);

        await prisma.tenant.update({
            where: { slug: 'painel-client-1' },
            data: { discordClientId: newId }
        });
        console.log('Fixed successfully.');
    } else {
        console.log('No fix needed or tenant not found.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
