
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_DURATIONS = [
    { label: "10 Minutos", value: "10m" },
    { label: "30 Minutos", value: "30m" },
    { label: "1 Hora", value: "1h" },
    { label: "6 Horas", value: "6h" },
    { label: "12 Horas", value: "12h" },
    { label: "1 Dia", value: "1d" },
    { label: "3 Dias", value: "3d" },
    { label: "7 Dias", value: "7d" },
    { label: "15 Dias", value: "15d" },
    { label: "30 Dias", value: "30d" },
];

async function main() {
    console.log("Starting seed...");

    // Get the first tenant (assuming single tenant for now or just picking the first one)
    const tenant = await prisma.tenant.findFirst();

    if (!tenant) {
        console.error("No tenant found! Please create a tenant first.");
        process.exit(1);
    }

    console.log(`Seeding for tenant: ${tenant.name} (${tenant.id})`);

    for (const duration of DEFAULT_DURATIONS) {
        const exists = await prisma.punishmentDuration.findFirst({
            where: {
                value: duration.value,
                tenantId: tenant.id
            }
        });

        if (!exists) {
            await prisma.punishmentDuration.create({
                data: {
                    label: duration.label,
                    value: duration.value,
                    tenantId: tenant.id
                }
            });
            console.log(`Created: ${duration.label}`);
        } else {
            console.log(`Skipped (already exists): ${duration.label}`);
        }
    }

    console.log("Seed completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
