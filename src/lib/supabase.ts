import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('[Supabase] Environment variables not configured, will use DATABASE_URL fallback');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseServiceKey || ''
);

export type SupabaseTenant = {
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
    discordGuildId: string;
    discordClientId: string;
    discordClientSecret: string;
    discordBotToken: string | null;
    discordWebhookUrl: string | null;
    discordAdminChannel: string | null;
    discordRoleAdmin: string;
    discordRoleEvaluator: string | null;
    discordRolePlayer: string | null;
    databaseUrl: string;
    directUrl: string | null;
    features: Record<string, boolean>;
    isActive: boolean;
    vercelProjectId: string | null;
    vercelDomain: string | null;
    vercelProductionBranch: string | null;
    createdAt: string;
    updatedAt: string;
};

export async function getTenantFromSupabase(host: string): Promise<SupabaseTenant | null> {
    if (!supabaseUrl || !supabaseServiceKey) {
        console.warn('[Supabase] Not configured, skipping');
        return null;
    }

    let tenantIdentifier: string | null = null;

    if (host.includes('.vercel.app')) {
        if (host.startsWith('gtarp-dashboard')) {
            tenantIdentifier = 'default';
        } else {
            tenantIdentifier = host.split('.')[0];
        }
    } else if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
        tenantIdentifier = `custom:${host}`;
    }

    if (!tenantIdentifier) return null;

    try {
        const { data, error } = await supabase
            .from('Tenant')
            .select('*')
            .or(`slug.eq.${tenantIdentifier},subdomain.eq.${tenantIdentifier},customDomain.eq.${tenantIdentifier.replace('custom:', '')}`)
            .eq('isActive', true)
            .single();

        if (error) {
            console.error('[Supabase] Error fetching tenant:', error);
            return null;
        }

        if (!data) {
            console.log('[Supabase] No tenant found for identifier:', tenantIdentifier);
            return null;
        }

        console.log(`[Supabase] Found tenant: ${data.name} (${data.slug})`);
        return data as SupabaseTenant;
    } catch (err) {
        console.error('[Supabase] Exception:', err);
        return null;
    }
}

export async function listTenantsFromSupabase(): Promise<SupabaseTenant[]> {
    if (!supabaseUrl || !supabaseServiceKey) {
        return [];
    }

    const { data, error } = await supabase
        .from('Tenant')
        .select('*')
        .order('createdAt', { ascending: false });

    if (error) {
        console.error('[Supabase] Error listing tenants:', error);
        return [];
    }

    return (data || []) as SupabaseTenant[];
}
