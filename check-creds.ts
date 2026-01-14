
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const tenants = await prisma.tenant.findMany();

    // Check specifically the one likely being used (First Active)
    const firstActive = await prisma.tenant.findFirst({
        where: { isActive: true }
    });

    console.log('First Active Tenant:', JSON.stringify(firstActive, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
