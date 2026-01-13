import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

let currentDatabaseUrl: string | null = null;

/**
 * Switch Prisma connection to tenant-specific database
 * Used when tenant has custom databaseUrl from Supabase
 */
export async function switchToTenantDatabase(databaseUrl: string, directUrl?: string): Promise<void> {
    if (currentDatabaseUrl === databaseUrl) {
        return;
    }

    console.log(`[DB] Switching to tenant database: ${databaseUrl.substring(0, 20)}...`);
    
    if (globalForPrisma.prisma) {
        await globalForPrisma.prisma.$disconnect();
    }

    globalForPrisma.prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        datasources: {
            db: {
                url: databaseUrl,
                directUrl: directUrl,
            },
        },
    });

    currentDatabaseUrl = databaseUrl;
    console.log('[DB] Switched to new database connection');
}

/**
 * Get current database URL
 */
export function getCurrentDatabaseUrl(): string | null {
    return currentDatabaseUrl;
}

/**
 * Ensure tenant-specific database is active
 */
export async function ensureTenantDatabase(tenant: any): Promise<void> {
    if (tenant.databaseUrl && tenant.databaseUrl !== process.env.DATABASE_URL) {
        await switchToTenantDatabase(tenant.databaseUrl, tenant.directUrl);
    }
}
