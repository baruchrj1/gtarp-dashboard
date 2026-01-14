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

export async function getTenantBySlugDirect(slug: string): Promise<TenantConfig | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug, isActive: true },
  });

  if (!tenant) return null;

  return {
    ...tenant,
    features: parseFeatures(tenant.features),
  };
}

export async function getTenantBySubdomainDirect(subdomain: string): Promise<TenantConfig | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain, isActive: true },
  });

  if (!tenant) return null;

  return {
    ...tenant,
    features: parseFeatures(tenant.features),
  };
}

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

export async function getTenantFromRequest(): Promise<TenantConfig | null> {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  if (!host) return null;

  // 1. DEFAULT TENANT - para domínio principal
  if (host.includes('.vercel.app') && host.startsWith('gtarp-dashboard')) {
    const defaultTenant = await prisma.tenant.findUnique({
      where: { slug: 'default', isActive: true },
    });

    if (defaultTenant) {
      // console.log('[Tenant] Using default tenant from database');
      return {
        ...defaultTenant,
        features: parseFeatures(defaultTenant.features),
      };
    }
  }

  // 2. DEV FALLBACK (Localhost)
  if (process.env.NODE_ENV === 'development' && (host.includes('localhost') || host.includes('127.0.0.1'))) {
    // Tenta pegar o tenant 'default' ou o primeiro que encontrar
    const defaultTenant = await prisma.tenant.findUnique({
      where: { slug: 'default', isActive: true }
    });

    if (defaultTenant) {
      // console.log(`[Tenant] Dev Environment - Using 'default' tenant`);
      return { ...defaultTenant, features: parseFeatures(defaultTenant.features) };
    }

    const firstTenant = await prisma.tenant.findFirst({
      where: { isActive: true }
    });

    if (firstTenant) {
      console.log(`[Tenant] Dev Fallback - Using First Tenant: ${firstTenant.name} (${firstTenant.subdomain})`);
      return {
        ...firstTenant,
        features: parseFeatures(firstTenant.features),
      };
    }
  }

  // 3. Buscar por subdomínio (Vercel ou outro domínio com sub)
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

  // 4. Domínio customizado
  if (!host.includes('localhost') && !host.includes('127.0.0.1') && !host.includes('.vercel.app')) {
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

  // Fallback
  console.warn('[Tenant] No tenant found');
  return null;
}

export async function getCurrentTenantId(): Promise<string> {
  const tenant = await getTenantFromRequest();
  if (!tenant) {
    throw new Error("Tenant not found");
  }
  return tenant.id;
}

export async function requireTenant(): Promise<TenantConfig> {
  const tenant = await getTenantFromRequest();
  if (!tenant) {
    throw new Error("Tenant not found");
  }
  return tenant;
}

export async function isFeatureEnabled(feature: keyof TenantFeatures): Promise<boolean> {
  const tenant = await getTenantFromRequest();
  if (!tenant) return false;
  return tenant.features[feature] === true;
}

export function toTenantContextValue(tenant: TenantConfig) {
  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    subdomain: tenant.subdomain,
    customDomain: tenant.customDomain,
    logo: tenant.logo,
    favicon: tenant.favicon,
    primaryColor: tenant.primaryColor,
    secondaryColor: tenant.secondaryColor,
    customCss: tenant.customCss,
    features: tenant.features,
    discordRoleAdmin: tenant.discordRoleAdmin,
    discordRoleEvaluator: tenant.discordRoleEvaluator,
  };
}
