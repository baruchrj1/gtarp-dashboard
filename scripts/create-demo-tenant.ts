
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Creating Demo Tenant...');

    const discordClientId = process.env.DISCORD_CLIENT_ID || 'dummy_client_id';
    const discordClientSecret = process.env.DISCORD_CLIENT_SECRET || 'dummy_secret';
    const discordGuildId = process.env.DISCORD_GUILD_ID || 'dummy_guild_id';
    // Use existing Role IDs or dummies
    const discordRoleAdmin = process.env.DISCORD_ROLE_ADMIN_ID?.split(',')[0] || 'dummy_admin_role';
    const discordRoleEvaluator = process.env.DISCORD_ROLE_EVALUATOR_ID?.split(',')[0] || 'dummy_eval_role';

    const demoTenant = await prisma.tenant.upsert({
        where: { slug: 'demo' },
        update: {
            // Just update branding if exists
            primaryColor: '#8b5cf6', // Violet 500
            secondaryColor: '#6d28d9', // Violet 700
            logo: 'https://cdn-icons-png.flaticon.com/512/5968/5968269.png', // Generic GTA/Game icon
            isActive: true,
        },
        create: {
            name: 'Cidade Demo',
            slug: 'demo',
            subdomain: 'demo',
            primaryColor: '#8b5cf6',
            secondaryColor: '#6d28d9',
            logo: 'https://cdn-icons-png.flaticon.com/512/5968/5968269.png',
            favicon: 'https://cdn-icons-png.flaticon.com/512/5968/5968269.png',
            discordClientId,
            discordClientSecret,
            discordGuildId,
            discordRoleAdmin,
            discordRoleEvaluator,
            features: JSON.stringify({
                archive: true,
                punishments: true,
                discordNotify: true,
                smartReports: true
            }),
        },
    });

    console.log(`✅ Tenant Created: ${demoTenant.name}`);
    console.log(`🆔 ID: ${demoTenant.id}`);
    console.log(`🌐 Slug: ${demoTenant.slug}`);
    console.log(`🎨 Primary Color: ${demoTenant.primaryColor}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
