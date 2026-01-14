
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const tenants = await prisma.tenant.findMany();
    console.log('Current Tenants:', JSON.stringify(tenants, null, 2));

    // Update logic: Target "Hell de Janeiro" specifically
    const targetTenant = tenants.find(t => t.slug === 'hell-de-janeiro');

    if (targetTenant) {
        console.log(`Updating tenant: ${targetTenant.name} (${targetTenant.id})`);

        await prisma.tenant.update({
            where: { id: targetTenant.id },
            data: {
                discordClientId: '1459429173897597001',
                discordClientSecret: 'Uf7E9DfABEDJT79EjUuUQXMz6PF8K3Of',
                // We might need to update the secret too, but let's see what it is first
            }
        });
        console.log('Update successful!');
    } else {
        console.log('No target tenant found to update.');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
