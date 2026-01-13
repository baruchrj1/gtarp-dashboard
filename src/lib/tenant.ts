import { headers } from "next/headers";
import { cache } from "react";
import { prisma } from "./prisma";

export type TenantConfig = {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  customDomain: string | null;
  logo: string | null;
  favicon: string | null;
  primaryColor: string;
  secondaryColor: string;
  customCss: string | null;
  features: TenantFeatures;
  discordGuildId: string;
  discordClientId: string;
  discordClientSecret: string;
  discordBotToken: string | null;
  discordWebhookUrl: string | null;
  discordAdminChannel: string | null;
  discordRoleAdmin: string;
  discordRoleEvaluator: string | null;
  discordRolePlayer: string | null;
  isActive: boolean;
};

export type TenantFeatures = {
  archive?: boolean;
  punishments?: boolean;
  discordNotify?: boolean;
};

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Parse features JSON para objeto tipado
 */
function parseFeatures(featuresJson: string): TenantFeatures {
  try {
    return JSON.parse(featuresJson);
  } catch {
    return {
      archive: true,
      punishments: true,
      discordNotify: true,
    };
  }
}

/**
 * Get tenant from request (with backward compatibility for DATABASE_URL)
 */
export async function getTenantFromRequest(): Promise<TenantConfig | null> {
  const headersList = await headers();
  const tenantSlug = headersList.get("x-tenant-slug");
  const host = headersList.get("host") || "";

  if (!host) return null;

  // DEV FALLBACK: Se estiver em desenvolvimento e sem subdomínio (localhost:3000)
  if (process.env.NODE_ENV === 'development' && !host.includes('localhost:3000')) {
    const devTenant = await prisma.tenant.findFirst({
      where: { isActive: true }
    });

    if (devTenant) {
      console.log(`[Tenant] Dev Fallback Active - Using Tenant: ${devTenant.name} (${devTenant.subdomain})`);
      return {
        ...devTenant,
        features: parseFeatures(devTenant.features),
      };
    }
  }

  // DEFAULT TENANT - para domínio principal
  if (host.includes('.vercel.app') && host.startsWith('gtarp-dashboard')) {
    const defaultTenant = await prisma.tenant.findUnique({
      where: { slug: 'default', isActive: true },
    });

    if (defaultTenant) {
      console.log('[Tenant] Using default tenant from database');
      return {
        ...defaultTenant,
        features: parseFeatures(defaultTenant.features),
      };
    }
  }

  // Buscar por subdomínio
  if (host.includes('.vercel.app') && !host.startsWith('gtarp-dashboard')) {
    const subdomain = host.split('.')[0];
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain, isActive: true },
    });

    if (tenant) {
      return {
        ...tenant,
        features: parseFeatures(tenant.features),
      };
    }
  }

  // Domínio customizado
  if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
    const customDomain = host;
    const tenant = await prisma.tenant.findUnique({
      where: { customDomain, isActive: true },
    });

    if (tenant) {
      console.log(`[Tenant] Found custom domain tenant: ${tenant.name}`);
      return {
        ...tenant,
        features: parseFeatures(tenant.features),
      };
    }
  }

  // Fallback: DATABASE_URL (backward compat)
  console.warn('[Tenant] No tenant found, using DATABASE_URL fallback');
  return null;
}

/**
 * Retorna o tenantId do request atual (para uso em queries)
 */
export async function getCurrentTenantId(): Promise<string> {
  const tenant = await getTenantFromRequest();
  if (!tenant) {
    throw new Error("Tenant not found");
  }
  return tenant.id;
}

/**
 * Helper para uso em server components - retorna tenant ou redireciona
 */
export async function requireTenant(): Promise<TenantConfig> {
  const tenant = await getTenantFromRequest();
  if (!tenant) {
    throw new Error("Tenant not found");
  }
  return tenant;
}

/**
 * Lista todos os tenants (para futuro gtarp-manager)
 */
export async function listAllTenants(): Promise<TenantConfig[]> {
  const tenants = await prisma.tenant.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return tenants.map((tenant) => ({
    ...tenant,
    features: parseFeatures(tenant.features),
  }));
}

/**
 * Busca tenant pelo slug diretamente (sem cache)
 */
export async function getTenantBySlug(slug: string): Promise<TenantConfig | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug, isActive: true },
  });

  if (!tenant) return null;

  return {
    ...tenant,
    features: parseFeatures(tenant.features),
  };
}

export async function getTenantBySubdomain(subdomain: string): Promise<TenantConfig | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain, isActive: true },
  });

  if (!tenant) return null;

  return {
    ...tenant,
    features: parseFeatures(tenant.features),
  };
}

/**
 * Busca tenant por domínio customizado
 */
export async function getTenantByCustomDomain(domain: string): Promise<TenantConfig | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { customDomain: domain, isActive: true },
  });

  if (!tenant) return null;

  return {
    ...tenant,
    features: parseFeatures(tenant.features),
  };
}

/**
 * Busca o primeiro tenant ativo (fallback para desenvolvimento)
 */
export async function getFirstActiveTenant(): Promise<TenantConfig | null> {
  const tenant = await prisma.tenant.findFirst({
    where: { isActive: true },
  });

  if (!tenant) return null;

  return {
    ...tenant,
    features: parseFeatures(tenant.features),
  };
}

/**
 * Verifica se uma feature está habilitada para o tenant
 */
export async function isFeatureEnabled(feature: keyof TenantFeatures): Promise<boolean> {
  const tenant = await getTenantFromRequest();
  if (!tenant) return false;
  return tenant.features[feature] === true;
}

/**
 * Helper para criar queries isoladas por tenant
 * Uso: const db = await tenantDb(); const users = await db.user.findMany();
 */
export async function tenantDb() {
  const tenantId = await getCurrentTenantId();

  return {
    user: {
      findMany: (args?: Omit<Prisma.UserFindManyArgs, 'where'> & { where?: Prisma.UserWhereInput }) =>
        prisma.user.findMany({
          ...args,
          where: { ...args?.where, tenantId },
        }),
      findFirst: (args?: Omit<Prisma.UserFindFirstArgs, 'where'> & { where?: Prisma.UserWhereInput }) =>
        prisma.user.findFirst({
          ...args,
          where: { ...args?.where, tenantId },
        }),
      findUnique: (args: Prisma.UserFindUniqueArgs) =>
        prisma.user.findUnique(args).then(user => user?.tenantId === tenantId ? user : null),
      create: (args: Omit<Prisma.UserCreateArgs, 'data'> & { data: Omit<Prisma.UserCreateArgs, 'tenant'> }) =>
        prisma.user.create({
          ...args,
          data: { ...args.data, tenantId: { connect: { id: tenantId } } }),
      update: (args: Prisma.UserUpdateArgs) =>
        prisma.user.update(args),
      delete: (args: Prisma.UserDeleteArgs) =>
        prisma.user.delete(args),
      count: (args?: Omit<Prisma.UserCountArgs, 'where'> & { where?: Prisma.UserWhereInput }) =>
        prisma.user.count({
          ...args,
          where: { ...args?.where, tenantId },
        }),
    },
  },
};
