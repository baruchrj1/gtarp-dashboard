const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultOrgs = [
    { name: "LSPD" },
    { name: "EMS" },
    { name: "Ballas" },
    { name: "Vagos" },
    { name: "Families" },
    { name: "Marabunta" },
    { name: "Mecânica" },
    { name: "Judiciário" },
    { name: "Prefeitura" }
];

async function main() {
    console.log('Seeding default organizations...');

    for (const org of defaultOrgs) {
        const exists = await prisma.organization.findUnique({
            where: { name: org.name }
        });

        if (!exists) {
            await prisma.organization.create({
                data: org
            });
            console.log(`Created organization: ${org.name}`);
        } else {
            console.log(`Organization already exists: ${org.name}`);
        }
    }

    console.log('Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
