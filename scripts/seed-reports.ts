
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // 1. Get default tenant
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
        console.error('❌ No tenant found. Please create a tenant first.');
        return;
    }
    console.log(`Using tenant: ${tenant.name} (${tenant.id})`);

    // 2. Get or create a reporter user
    let reporter = await prisma.user.findFirst({
        where: { tenantId: tenant.id }
    });

    if (!reporter) {
        console.log('Creating dummy reporter...');
        reporter = await prisma.user.create({
            data: {
                username: 'DummyReporter',
                discordId: '123456789',
                tenantId: tenant.id,
                role: 'PLAYER'
            }
        });
    }
    console.log(`Using reporter: ${reporter.username} (${reporter.id})`);

    // 3. Create Reports
    const reportsData = [
        {
            accusedId: '5432',
            accusedName: 'Zezinho da  Silva',
            accusedFamily: 'Ballas',
            reason: 'RDM',
            description: 'Chegou atirando do nada na praça sem motivo algum.',
            evidence: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Dummy link
            status: 'PENDING',
            tenantId: tenant.id,
            reporterId: reporter.id,
        },
        {
            accusedId: '9988',
            accusedName: 'Lucas Matador',
            accusedFamily: 'Vagos',
            reason: 'VDM',
            description: 'Passou por cima de mim com o carro propositalmente.',
            evidence: 'https://imgur.com/gallery/bXpC4',
            status: 'PENDING',
            tenantId: tenant.id,
            reporterId: reporter.id,
        },
        {
            accusedId: '1020',
            accusedName: 'Maria Gasolina',
            accusedFamily: 'Civil',
            reason: 'Combat Logging',
            description: 'Deslogou no meio da abordagem policial.',
            evidence: 'https://youtube.com/watch?v=example',
            status: 'INVESTIGATING',
            adminNotes: 'Verificando logs de conexão.',
            tenantId: tenant.id,
            reporterId: reporter.id,
        },
        {
            accusedId: '4455',
            accusedName: 'Pedro Hacker',
            accusedFamily: 'Turquia',
            reason: 'Bugs',
            description: 'Abusando de bug para atravessar paredes.',
            evidence: 'https://youtube.com/watch?v=example2',
            status: 'APPROVED',
            adminNotes: 'Confirmado por logs. Aplicado banimento de 3 dias.',
            tenantId: tenant.id,
            reporterId: reporter.id,
        },
        {
            accusedId: '777',
            accusedName: 'João Milionário',
            accusedFamily: 'Bahamas',
            reason: 'Metagaming',
            description: 'Usou informações do Discord dentro do jogo.',
            evidence: 'https://print.sc/xyza',
            status: 'REJECTED',
            adminNotes: 'Provas insuficientes. O vídeo não mostra o momento exato.',
            tenantId: tenant.id,
            reporterId: reporter.id,
        },
        {
            accusedId: '12',
            accusedName: 'Admin Abuse',
            accusedFamily: 'Policia',
            reason: 'Power Gaming',
            description: 'Algemou correndo e pulando.',
            evidence: 'https://youtube.com/watch?v=powergaming',
            status: 'PENDING',
            tenantId: tenant.id,
            reporterId: reporter.id,
        },
        {
            accusedId: '666',
            accusedFamily: 'Drift King',
            reason: 'Outros',
            description: 'Ofensas OOC pesadas no chat.',
            evidence: 'https://imgur.com/chat-log',
            status: 'PENDING',
            tenantId: tenant.id,
            reporterId: reporter.id,
        }
    ];

    for (const data of reportsData) {
        await prisma.report.create({ data });
    }

    console.log(`✅ Created ${reportsData.length} dummy reports.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
