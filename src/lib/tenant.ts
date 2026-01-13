import { headers } from "next/headers";
import { cache } from "react";
import { prisma } from "./prisma";
import { getTenantFromSupabase } from "./supabase";

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

export async function getTenantFromSupabaseByHost(host: string): Promise<TenantConfig | null> {
  const supabaseTenant = await getTenantFromSupabase(host);
  if (supabaseTenant) {
    return {
      id: supabaseTenant.id,
      name: supabaseTenant.name,
      slug: supabaseTenant.slug,
      subdomain: supabaseTenant.subdomain,
      customDomain: supabaseTenant.customDomain,
      logo: supabaseTenant.logo,
      favicon: supabaseTenant.favicon,
      primaryColor: supabaseTenant.primaryColor,
      secondaryColor: supabaseTenant.secondaryColor,
      customCss: supabaseTenant.customCss,
      features: typeof supabaseTenant.features === 'string' 
        ? JSON.parse(supabaseTenant.features)
        : supabaseTenant.features,
      discordGuildId: supabaseTenant.discordGuildId,
      discordClientId: supabaseTenant.discordClientId,
      discordClientSecret: supabaseTenant.discordClientSecret,
      discordBotToken: supabaseTenant.discordBotToken,
      discordWebhookUrl: supabaseTenant.discordWebhookUrl,
      discordAdminChannel: supabaseTenant.discordAdminChannel,
      discordRoleAdmin: supabaseTenant.discordRoleAdmin,
      discordRoleEvaluator: supabaseTenant.discordRoleEvaluator,
      discordRolePlayer: supabaseTenant.discordRolePlayer,
      isActive: supabaseTenant.isActive,
    };
  }
  return null;
}

export async function getTenantFromRequest(): Promise<TenantConfig | null> {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  if (!host) return null;

  // 1. Try Supabase first (NEW - Central management)
  const supabaseTenant = await getTenantFromSupabase(host);
  if (supabaseTenant) {
    console.log(`[Tenant] Using Supabase tenant: ${supabaseTenant.name}`);
    return getTenantFromSupabaseByHost(host);
  }

  // 2. Fallback: DATABASE_URL (Backward Compatibility)
  console.warn('[Tenant] Supabase not available, using DATABASE_URL fallback');

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

  // DEV FALLBACK
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

  // Fallback
  console.warn('[Tenant] No tenant found, using DATABASE_URL fallback');
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
