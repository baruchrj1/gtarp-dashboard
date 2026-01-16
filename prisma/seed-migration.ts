import { PrismaClient } from "@prisma/client";

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
    { value: "Safezone", label: "Desrespeito à Safezone" }, // Added as commonly requested
    { value: "Outros", label: "Outros" }
];

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
    console.log('Starting migration of default data...');

    // 1. Get all tenants
    const tenants = await prisma.tenant.findMany();

    if (tenants.length === 0) {
        console.warn("No tenants found! Please create a tenant first.");
        return;
    }

    console.log(`Found ${tenants.length} tenants. Seeding data for each...`);

    for (const tenant of tenants) {
        console.log(`\n--- Tenant: ${tenant.name} (${tenant.id}) ---`);

        // 2. Seed Reasons
        console.log('Seeding Reasons...');
        for (const reason of defaultReasons) {
            await prisma.reportReason.upsert({
                where: {
                    value_tenantId: {
                        value: reason.value,
                        tenantId: tenant.id
                    }
                },
                update: {
                    label: reason.label // Update label if exists to match "system" standard
                },
                create: {
                    value: reason.value,
                    label: reason.label,
                    tenantId: tenant.id
                }
            });
        }

        console.log(`- Processed ${defaultReasons.length} reasons.`);

        // 3. Seed Organizations
        console.log('Seeding Organizations...');
        for (const org of defaultOrgs) {
            await prisma.organization.upsert({
                where: {
                    name_tenantId: {
                        name: org.name,
                        tenantId: tenant.id
                    }
                },
                update: {},
                create: {
                    name: org.name,
                    tenantId: tenant.id
                }
            });
        }
        console.log(`- Processed ${defaultOrgs.length} organizations.`);
    }

    console.log('\nMigration complete successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
