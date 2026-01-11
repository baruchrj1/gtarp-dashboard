
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log("Users in database:");
    users.forEach(u => {
        console.log(`- ${u.username} (${u.id}): Role=${u.role}, IsAdmin=${u.isAdmin}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
