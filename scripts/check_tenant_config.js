const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const tenant = await prisma.tenant.findUnique({
        where: { slug: 'painel-client-1' },
    });

    if (tenant) {
        console.log('Tenant Found:');
        console.log(`Name: ${tenant.name}`);
        console.log(`Slug: ${tenant.slug}`);
        console.log(`Discord Client ID: ${tenant.discordClientId}`);
        console.log(`Discord Guild ID: ${tenant.discordGuildId}`);
        console.log(`Role Admin ID: ${tenant.discordRoleAdmin}`);
        console.log(`Role Evaluator ID: ${tenant.discordRoleEvaluator}`);
    } else {
        console.log('Tenant painel-client-1 not found.');
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
