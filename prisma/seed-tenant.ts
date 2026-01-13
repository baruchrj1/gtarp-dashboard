// Script para criar o tenant "Hell de Janeiro"
// Execute com: npx ts-node prisma/seed-tenant.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Criando tenant Hell de Janeiro...');

    const tenant = await prisma.tenant.upsert({
        where: { subdomain: 'painel-client-1' },
        update: {},
        create: {
            // Identificação
            name: 'Hell de Janeiro',
            slug: 'hell-de-janeiro',
            subdomain: 'painel-client-1', // IMPORTANTE: deve corresponder ao subdomínio do Vercel

            // Branding
            logo: null,
            favicon: null,
            primaryColor: '#8B5CF6', // Roxo
            secondaryColor: '#4f46e5',

            // Features
            features: JSON.stringify({
                archive: true,
                punishments: true,
                discordNotify: true,
            }),

            // Discord OAuth - CREDENCIAIS DO HELL DE JANEIRO
            discordGuildId: '1280308341444182098',           // ID do servidor Discord
            discordClientId: '1460099714048593930',         // ID do app OAuth
            discordClientSecret: 'OBTER_DO_DISCORD_DEVELOPER_PORTAL', // Secret do app OAuth

            // Discord Roles - IDs DOS CARGOS
            discordRoleAdmin: '1280308341519814664, 1280308341587050609', // ID do cargo Admin
            discordRoleEvaluator: null, // ID do cargo Avaliador (opcional)
            discordRolePlayer: null,

            // Webhook/Bot (opcionais)
            discordBotToken: null,
            discordWebhookUrl: null,
            discordAdminChannel: null,

            // Status
            isActive: true,
        },
    });

    console.log('✅ Tenant criado com sucesso!');
    console.log('   ID:', tenant.id);
    console.log('   Nome:', tenant.name);
    console.log('   Subdomain:', tenant.subdomain);
    console.log('   Slug:', tenant.slug);
}

main()
    .catch((e) => {
        console.error('❌ Erro ao criar tenant:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
