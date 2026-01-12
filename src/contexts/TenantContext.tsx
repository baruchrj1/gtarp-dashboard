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
  if (!tenant) {
    throw new Error("useTenant must be used within a TenantProvider");
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
  };
}
