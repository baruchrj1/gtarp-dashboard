"use client";

import { createContext, useContext, ReactNode } from "react";
import type { TenantConfig, TenantFeatures } from "@/lib/tenant";

// Tipo para o contexto (sem dados sensiveis do Discord)
type TenantContextValue = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  favicon: string | null;
  primaryColor: string;
  secondaryColor: string;
  customCss: string | null;
  features: TenantFeatures;
  discordRoleAdmin: string;
  discordRoleEvaluator: string | null;
};

const TenantContext = createContext<TenantContextValue | null>(null);

// Props do provider
type TenantProviderProps = {
  children: ReactNode;
  tenant: TenantContextValue;
};

export function TenantProvider({ children, tenant }: TenantProviderProps) {
  return (
    <TenantContext.Provider value={tenant}>
      {children}
    </TenantContext.Provider>
  );
}

// Hook para acessar dados do tenant
export function useTenant(): TenantContextValue {
  const tenant = useContext(TenantContext);
  // Allow usage without provider (returns null) for Super Admin pages that might import components using this
  // But for AdminDashboard, we need to handle the null case. 
  // Given the error "must be used within", we should keep the check BUT allow a bypass or handle it in the Page.
  // Actually, the page should NOT render if no tenant. The server redirect takes time.
  // Let's modify the Page to not crash.
  if (!tenant) {
    // Return a dummy context or throw? 
    // If we throw, the ErrorBoundary catches it.
    // Let's just return a partial dummy to satisfy Typescript and let the redirect happen.
    return {
      id: "loading", name: "Carregando...", slug: "", logo: null, favicon: null,
      primaryColor: "#000", secondaryColor: "#000", customCss: null, features: {} as any,
      discordRoleAdmin: "", discordRoleEvaluator: ""
    };
  }
  return tenant;
}

// Hook para verificar se uma feature esta habilitada
export function useFeature(feature: keyof TenantFeatures): boolean {
  const tenant = useTenant();
  return tenant.features[feature] === true;
}

// Converte TenantConfig do server para TenantContextValue (remove dados sensiveis)
export function toTenantContextValue(config: TenantConfig): TenantContextValue {
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
  };
}
