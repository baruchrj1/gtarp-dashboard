const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultReasons = [
    { value: "RDM", label: "RDM (Random Death Match)" },
    { value: "VDM", label: "VDM (Vehicle Death Match)" },
    { value: "Dark RP", label: "Dark RP" },
    { value: "Power Gaming", label: "Power Gaming" },
    { value: "Combat Logging", label: "Combat Logging" },
    { value: "Metagaming", label: "Metagaming" },
    { value: "Bugs", label: "Aproveitamento de Bugs" },
    { value: "Insulto", label: "Toxidade / Ofensa" },
    { value: "Outros", label: "Outros" }
];

async function main() {
    console.log('Seeding default reasons...');

    for (const reason of defaultReasons) {
        const exists = await prisma.reportReason.findUnique({
            where: { value: reason.value }
        });

        if (!exists) {
            await prisma.reportReason.create({
                data: reason
            });
            console.log(`Created reason: ${reason.label}`);
        } else {
            console.log(`Reason already exists: ${reason.label}`);
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
