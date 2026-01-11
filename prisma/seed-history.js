const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Configuration
const REPORT_COUNT = 150; // Total reports to generate
const DAYS_BACK = 90; // How far back to go

// Data pools
const reasons = ["RDM", "VDM", "Combat Logging", "Meta Gaming", "Power Gaming", "Bugs", "Insulto", "Outros"];
const organizations = ["LSPD", "EMS", "Ballas", "Vagos", "Families", "Mecânica", "Judiciário", null];
const statuses = ["APPROVED", "REJECTED", "INVESTIGATING", "PENDING"];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
    console.log(`Seeding ${REPORT_COUNT} historical reports...`);

    // Get a valid reporter (admin) to associate reports with
    const reporter = await prisma.user.findFirst();
    if (!reporter) {
        console.error("No users found. Please log in once to create a user first.");
        return;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - DAYS_BACK);
    const endDate = new Date();

    const reports = [];

    for (let i = 0; i < REPORT_COUNT; i++) {
        const status = getRandomItem(statuses);
        const createdAt = getRandomDate(startDate, endDate);

        // Logic for handledBy: if not pending, someone handled it
        let handledBy = null;
        if (status !== "PENDING") {
            handledBy = reporter.id;
        }

        reports.push({
            accusedId: Math.floor(Math.random() * 10000).toString(),
            accusedName: `Player ${Math.floor(Math.random() * 100)}`,
            accusedFamily: getRandomItem(organizations),
            reason: getRandomItem(reasons),
            description: "Relatório gerado automaticamente para testes de histórico.",
            evidence: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Placeholder
            status: status,
            reporterId: reporter.id,
            handledBy: handledBy,
            createdAt: createdAt,
            updatedAt: createdAt // Same as created for simplicity
        });
    }

    // Prisma createMany is faster
    await prisma.report.createMany({
        data: reports
    });

    console.log("Historical seeding complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
