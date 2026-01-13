import { headers } from "next/headers";
import { cache } from "react";
import { prisma } from "./prisma";
import { getTenantFromSupabase } from "./supabase";

// Tipo do tenant com features parseadas
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

// Cache para evitar multiplas queries por request
export const getTenantBySlug = cache(async (slug: string): Promise<TenantConfig | null> => {
  const tenant = await prisma.tenant.findUnique({
    where: { slug, isActive: true },
  });

  if (!tenant) return null;

  return {
    ...tenant,
    features: parseFeatures(tenant.features),
  };
});

export const getTenantBySubdomain = cache(async (subdomain: string): Promise<TenantConfig | null> => {
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain, isActive: true },
  });

  if (!tenant) return null;

  return {
    ...tenant,
    features: parseFeatures(tenant.features),
  };
});

export const getTenantByCustomDomain = cache(async (domain: string): Promise<TenantConfig | null> => {
  const tenant = await prisma.tenant.findUnique({
    where: { customDomain: domain, isActive: true },
  });

  if (!tenant) return null;

  return {
    ...tenant,
    features: parseFeatures(tenant.features),
  };
});

// Versão SEM cache para uso em contextos onde headers() não está disponível (ex: NextAuth route)
export async function getTenantBySubdomainDirect(subdomain: string): Promise<TenantConfig | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain, isActive: true },
  });

  if (!tenant) return null;

  return {
    ...tenant,
    features: parseFeatures(tenant.features),
  };
});

// Busca tenant pelo slug diretamente (sem cache)
export async function getTenantBySlugDirect(slug: string): Promise<TenantConfig | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug, isActive: true },
  });

  if (!tenant) return null;

  return {
    ...tenant,
    features: parseFeatures(tenant.features),
  };
};

// Busca o primeiro tenant ativo (fallback para desenvolvimento)
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

// Busca tenant pelo domínio customizado
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

// Busca tenant a partir do header definido pelo middleware
export async function getTenantFromRequestOriginal(): Promise<TenantConfig | null> {
  const headersList = await headers();
  const tenantSlug = headersList.get("x-tenant-slug");

  if (!tenantSlug) {
    // DEV FALLBACK: Se estiver em desenvolvimento e sem subdomínio (localhost:3000), 
    // usa o primeiro tenant ativo encontrada para permitir testes.
    if (process.env.NODE_ENV === 'development') {
      const devTenant = await prisma.tenant.findFirst({
        where: { isActive: true }
      });

      if (devTenant) {
        console.log(`[TENANT] Dev Fallback Active - Using Tenant: ${devTenant.name} (${devTenant.subdomain})`);
        return {
          ...devTenant,
          features: parseFeatures(devTenant.features),
        };
      }
    }

    return null;
  }

  // Se for domínio customizado, busca pelo domínio
  if (tenantSlug.startsWith("custom:")) {
    const customDomain = tenantSlug.replace("custom:", "");
    return getTenantByCustomDomain(customDomain);
  }

  // Primeiro tenta buscar pelo subdomain (ex: painel-client-1)
  const tenantBySubdomain = await getTenantBySubdomain(tenantSlug);
  if (tenantBySubdomain) return tenantBySubdomain;

  // Fallback: busca pelo slug
  return getTenantBySlug(tenantSlug);
}

// Retorna o tenantId do request atual (para uso em queries)
export async function getCurrentTenantId(): Promise<string> {
  const tenant = await getTenantFromRequestOriginal();
  if (!tenant) {
    throw new Error("Tenant not found");
  }
  return tenant.id;
}

// Parse features JSON para objeto tipado
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

// Verifica se uma feature está habilitada para o tenant
export async function isFeatureEnabled(feature: keyof TenantFeatures): Promise<boolean> {
  const tenant = await getTenantFromRequestOriginal();
  if (!tenant) return false;
  return tenant.features[feature] === true;
}

// Helper para uso em server components - retorna tenant ou redireciona
export async function requireTenant(): Promise<TenantConfig> {
  const tenant = await getTenantFromRequestOriginal();
  if (!tenant) {
    throw new Error("Tenant not found");
  }
  return tenant;
}

// Cria um novo tenant
export async function createTenant(data: {
  name: string;
  slug: string;
  discordGuildId: string;
  discordClientId: string;
  discordClientSecret: string;
  discordRoleAdmin: string;
  discordRoleEvaluator?: string;
  discordRolePlayer?: string;
}): Promise<TenantConfig> {
  const tenant = await prisma.tenant.create({
    data: {
      name: data.name,
      slug: data.slug,
      subdomain: data.slug, // Mesmo que o slug inicialmente
      discordGuildId: data.discordGuildId,
      discordClientId: data.discordClientId,
      discordClientSecret: data.discordClientSecret,
      discordRoleAdmin: data.discordRoleAdmin,
      discordRoleEvaluator: data.discordRoleEvaluator,
      discordRolePlayer: data.discordRolePlayer,
    },
  });

  return {
    ...tenant,
    features: parseFeatures(tenant.features),
  };
}

// Atualiza branding do tenant
export async function updateTenantBranding(
  tenantId: string,
  data: {
    logo?: string;
    favicon?: string;
    primaryColor?: string;
    secondaryColor?: string;
    customCss?: string;
  }
): Promise<TenantConfig> {
  const tenant = await prisma.tenant.update({
    where: { id: tenantId },
    data,
  });

  return {
    ...tenant,
    features: parseFeatures(tenant.features),
  };
}

// Atualiza features do tenant
export async function updateTenantFeatures(
  tenantId: string,
  features: TenantFeatures
): Promise<TenantConfig> {
  const tenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      features: JSON.stringify(features),
    },
  });

  return {
    ...tenant,
    features: parseFeatures(tenant.features),
  };
}

// Lista todos os tenants
export async function listTenants() {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
  });

  return tenants.map((tenant) => ({
    ...tenant,
    features: parseFeatures(tenant.features),
  }));
}

// Converte TenantConfig do server para TenantContextValue (remove dados sensiveis)
export function toTenantContextValue(config: TenantConfig) {
  return {
    id: config.id,
    name: config.name,
    slug: config.slug,
    logo: config.logo,
    favicon: config.favicon,
    primaryColor: config.primaryColor,
    secondaryColor: config.secondaryColor,
    customCss: config.customCss,
    features: config.features,
    discordRoleAdmin: config.discordRoleAdmin,
    discordRoleEvaluator: config.discordRoleEvaluator,
    discordRolePlayer: config.discordRolePlayer,
  };
}
