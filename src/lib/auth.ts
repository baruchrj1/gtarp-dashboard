import { NextAuthOptions, getServerSession as nextAuthGetServerSession } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials"; // DEBUG
import { headers } from "next/headers";
import { prisma } from "./db";
import {
    TenantConfig,
    getTenantBySubdomainDirect,
    getTenantBySlugDirect,
    getFirstActiveTenant,
    getTenantBySlug,
    getTenantFromRequest
} from "./tenant";

// ============================================
// DYNAMIC TENANT-BASED AUTHENTICATION
// ============================================

/**
 * Resolve tenant from request.
 * This function works outside normal request context (no headers()).
 * It receives subdomain/slug extracted from host header.
 */
export async function resolveTenantForAuth(tenantSlug: string | null): Promise<TenantConfig | null> {
    // 1. DEFAULT TENANT - for main domain access
    if (tenantSlug === "default") {
        const defaultTenant = await prisma.tenant.findUnique({
            where: { slug: "default", isActive: true },
        });
        if (defaultTenant) {
            console.log(`[AUTH] Using default tenant: ${defaultTenant.name}`);
            return {
                ...defaultTenant,
                features: JSON.parse(defaultTenant.features),
            };
        }
        console.warn("[AUTH] Default tenant not found in database");
    }

    // 2. Try to find by subdomain/slug
    if (tenantSlug) {
        // Handle custom domain prefix
        if (tenantSlug.startsWith("custom:")) {
            const customDomain = tenantSlug.replace("custom:", "");
            const tenant = await prisma.tenant.findUnique({
                where: { customDomain, isActive: true },
            });
            if (tenant) {
                return {
                    ...tenant,
                    features: JSON.parse(tenant.features),
                };
            }
        }

        // Try subdomain
        const tenantBySubdomain = await getTenantBySubdomainDirect(tenantSlug);
        if (tenantBySubdomain) return tenantBySubdomain;

        // Fallback to slug
        const tenantBySlug = await getTenantBySlugDirect(tenantSlug);
        if (tenantBySlug) return tenantBySlug;
    }

    // 3. Fallback: use first active tenant (both dev AND production)
    const fallbackTenant = await getFirstActiveTenant();
    if (fallbackTenant) {
        console.log(`[AUTH] Fallback - Using Tenant: ${fallbackTenant.name} (${fallbackTenant.subdomain})`);
        return fallbackTenant;
    }

    return null;
}

/**
 * Extract tenant slug from host header.
 * This is used in NextAuth route handler.
 */
export function extractTenantSlugFromHost(host: string | null): string | null {
    if (!host) return null;

    // Vercel subdomain pattern: {subdomain}.vercel.app
    if (host.includes(".vercel.app")) {
        // MAIN DOMAIN - use default tenant
        if (host.startsWith("gtarp-dashboard")) {
            return "default";
        }
        // SUBDOMAIN - extract first part
        return host.split(".")[0];
    }

    // Localhost - default tenant
    if (host.includes("localhost") || host.includes("127.0.0.1")) {
        return "default";
    }

    // Custom domain
    return `custom:${host}`;
}

/**
 * Build NextAuth options dynamically based on tenant.
 * Each tenant has its own Discord OAuth credentials stored in database.
 */
export function buildAuthOptions(tenant: TenantConfig): NextAuthOptions {
    return {
        debug: process.env.NODE_ENV === "development",
        secret: process.env.NEXTAUTH_SECRET,
        providers: [
            DiscordProvider({
                // === DYNAMIC: Credentials from database ===
                clientId: tenant.discordClientId,
                clientSecret: tenant.discordClientSecret,
                authorization: { params: { scope: "identify email guilds.members.read" } },
            }),
            // === DEBUG PROVIDER (REMOVE AFTER VALIDATION) ===
            CredentialsProvider({
                name: "Debug Access",
                credentials: { password: { label: "Password", type: "password" } },
                async authorize(credentials) {
                    // Complex enough password for temporary use
                    if (credentials?.password === "ANTIGRAVITY_DEBUG_TOKEN_99137!") {
                        return {
                            id: "debug-admin-user",
                            name: "Debug Admin",
                            email: "debug@system.local",
                            image: "https://github.com/shadcn.png"
                        };
                    }
                    return null;
                }
            })
        ],
        session: {
            strategy: "jwt",
            maxAge: 24 * 60 * 60, // 24 hours
        },
        callbacks: {
            async signIn({ user, account, profile }) {
                // Allow debug user
                if (user.email === "debug@system.local") return true;

                // console.log("[AUTH] SignIn logic...");
                if (account?.error) {
                    console.error("[AUTH DEBUG] Account Error:", account.error);
                }
                // Basic validation
                if (!user.email && !user.id) {
                    // console.log("[AUTH DEBUG] SignIn Failed: Missing email/id");
                    return false;
                }
                return true;
            },

            async jwt({ token, user, account, trigger, session }) {
                // Initial sign in data
                if (user) {
                    token.id = user.id;
                    token.email = user.email;

                    // DEBUG USER LOGIC
                    if (user.email === "debug@system.local") {
                        token.role = "ADMIN";
                        token.isAdmin = true;
                        token.isSuperAdmin = true;
                        // Force dbId mostly for types, though it won't exist in DB unless we create it
                        // For pure read-only validation of UI, this might be enough if UI relies on token.
                        // However, DB lookups using this ID will fail.
                        // Better to just let it fail DB lookups but allow UI navigation.
                        // Or we can rely on resolveTenantForAuth returning valid tenant.
                    }
                }

                // Handle Session Updates (client-side triggers)
                if (trigger === "update" && session) {
                    return { ...token, ...session };
                }

                // ALWAYS Re-evaluate Super Admin Status (DB Based)
                // If user is ADMIN of the DEFAULT tenant, they are a Super Admin.
                if (tenant.slug === "default" && token.role === "ADMIN") {
                    token.isSuperAdmin = true;
                } else {
                    token.isSuperAdmin = false;
                }


                // Sync Discord Roles on Sign In (Access Token available)
                if (account?.provider === "discord" && account.access_token) {
                    try {
                        // MODIFIED: Check if tenant has Discord credentials
                        if (!tenant.discordGuildId || !tenant.discordClientId || !tenant.discordClientSecret) {
                            console.warn(`[AUTH] Tenant ${tenant.name} has no Discord credentials, skipping role sync`);
                            return token;
                        }

                        // Use tenant-specific guild ID from database
                        const guildId = tenant.discordGuildId;

                        if (guildId) {
                            const res = await fetch(`https://discord.com/api/users/@me/guilds/${guildId}/member`, {
                                headers: { Authorization: `Bearer ${account.access_token}` },
                            });

                            if (res.ok) {
                                const member = await res.json();
                                const roles = (member.roles || []) as string[];

                                // Parse admin roles (can be comma-separated in database)
                                const adminRoleIds = tenant.discordRoleAdmin
                                    .split(",")
                                    .map((id) => id.trim())
                                    .filter(Boolean);

                                const evaluatorRoleIds = tenant.discordRoleEvaluator
                                    ? tenant.discordRoleEvaluator.split(",").map((id) => id.trim()).filter(Boolean)
                                    : [];

                                // Determine Role
                                let determinedRole = "PLAYER";
                                let isAdmin = false;

                                // Check Discord roles for permissions
                                if (adminRoleIds.some((id) => roles.includes(id))) {
                                    determinedRole = "ADMIN";
                                    isAdmin = true;
                                } else if (evaluatorRoleIds.some((id) => roles.includes(id))) {
                                    determinedRole = "EVALUATOR";
                                    isAdmin = false;
                                }

                                // Sync to Database
                                if (user) {
                                    try {
                                        // 1. Fetch existing user to prevent downgrading manual Admins
                                        const existingUser = await prisma.user.findUnique({
                                            where: {
                                                discordId_tenantId: {
                                                    discordId: user.id,
                                                    tenantId: tenant.id,
                                                },
                                            }
                                        });

                                        // 2. If user is already ADMIN, preserve it (don't downgrade via Sync)
                                        if (existingUser?.isAdmin) {
                                            console.log(`[AUTH] User ${user.id} is already ADMIN in DB. Preserving role.`);
                                            determinedRole = "ADMIN";
                                            isAdmin = true;
                                        }

                                        // Update Token
                                        token.role = determinedRole;
                                        token.isAdmin = isAdmin;
                                        token.discordRoles = roles;

                                        // Upsert User with final decided role
                                        const dbUser = await prisma.user.upsert({
                                            where: {
                                                discordId_tenantId: {
                                                    discordId: user.id,
                                                    tenantId: tenant.id,
                                                },
                                            },
                                            update: {
                                                username: user.name || "Unknown",
                                                avatar: user.image,
                                                role: token.role as string,
                                                isAdmin: token.isAdmin as boolean,
                                            },
                                            create: {
                                                discordId: user.id,
                                                username: user.name || "Unknown",
                                                avatar: user.image,
                                                role: token.role as string,
                                                isAdmin: token.isAdmin as boolean,
                                                tenantId: tenant.id,
                                            },
                                        });

                                        // Attach DB ID and Tenant ID to Token
                                        token.dbId = dbUser.id;
                                        token.tenantId = tenant.id;
                                    } catch (err) {
                                        console.error("[AUTH] DB Sync Error:", err);
                                    }
                                }
                            } else {
                                console.warn(`[AUTH] Failed to fetch member data from Guild ${guildId}. Status: ${res.status}`);
                            }
                        }
                    } catch (error) {
                        console.error("[AUTH] Discord Role Sync Failed:", error);
                    }
                }

                // Always ensure tenantId is in token
                if (!token.tenantId) {
                    token.tenantId = tenant.id;
                }

                return token;
            },

            async session({ session, token }) {
                if (session.user) {
                    session.user.id = (token.dbId as string) || (token.id as string);
                    session.user.discordId = token.id as string;
                    session.user.role = (token.role as string) || "PLAYER";
                    session.user.isAdmin = (token.isAdmin as boolean) || false;
                    session.user.discordRoles = (token.discordRoles as string[]) || [];
                    session.user.tenantId = (token.tenantId as string) || tenant.id;

                    // Expose Super Admin status
                    (session.user as any).isSuperAdmin = token.isSuperAdmin || false;
                }
                return session;
            },
        },
        pages: {
            signIn: "/login",
            error: "/login", // Redirect errors back to login
        },
    };
}

// ============================================
// FALLBACK AUTH OPTIONS (for build time / error cases)
// ============================================

/**
 * Fallback auth options used when tenant cannot be resolved.
 * This uses empty credentials which will fail gracefully.
 */
/**
 * Fallback auth options used when tenant cannot be resolved.
 * This checks for Environment Variables (for initial bootstrapping)
 * or defaults to invalid credentials if envs are missing.
 */
export const fallbackAuthOptions: NextAuthOptions = {
    debug: process.env.NODE_ENV === "development",
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID || "INVALID_NO_TENANT",
            clientSecret: process.env.DISCORD_CLIENT_SECRET || "INVALID_NO_TENANT",
            authorization: { params: { scope: "identify email guilds.members.read" } },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60,
    },
    callbacks: {
        async signIn() {
            // Allow sign in if we are using Env Vars (Bootstrapping Mode)
            if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
                console.log("[AUTH] Bootstrapping Mode: Using Environment Variables for Auth");
                return true;
            }

            // Block sign ins if we really have no credentials
            console.error("[AUTH] Sign in blocked: No tenant resolved and no Env Vars provided");
            return false;
        },
        async jwt({ token, user, account }) {
            // ALWAYS Re-evaluate Super Admin Status
            const userId = (user?.id) || (token.id as string) || (token.sub as string);
            if (userId) {
                const superAdminsRaw = process.env.SUPER_ADMIN_IDS || "";
                const superAdmins = superAdminsRaw.split(",").map(id => id.trim());
                if (superAdmins.includes(userId)) {
                    token.isSuperAdmin = true;
                    token.role = "ADMIN"; // Force Admin for bootstrap user
                    token.isAdmin = true;

                    // Only set system-bootstrap if not already set (or force it if fallback)
                    if (!token.tenantId) {
                        token.tenantId = "system-bootstrap";
                    }
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).isSuperAdmin = token.isSuperAdmin || false;
                // Set a fake tenantId for bootstrap session so it doesn't crash parts of the app expecting it
                session.user.tenantId = "system-bootstrap";
                session.user.role = (token.role as string) || "PLAYER";
                session.user.isAdmin = (token.isAdmin as boolean) || false;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
};

// ============================================
// COMPATIBILITY LAYER
// ============================================
// These exports maintain compatibility with existing code that uses
// getServerSession(authOptions). They automatically resolve tenant
// and build appropriate auth options.

/**
 * Get auth options for current request.
 * This function reads headers to determine tenant and returns
 * appropriate auth options.
 *
 * @deprecated Use buildAuthOptions(tenant) for new code
 */
export async function getAuthOptions(): Promise<NextAuthOptions> {
    try {
        // Use the cached tenant from request (handles headers, middleware, etc.)
        const tenant = await getTenantFromRequest();

        if (!tenant) {
            console.warn("[AUTH] No tenant found via getTenantFromRequest - using fallback options");
            return fallbackAuthOptions;
        }

        return buildAuthOptions(tenant);
    } catch (error) {
        console.error("[AUTH] Error getting auth options:", error);
        return fallbackAuthOptions;
    }
}

/**
 * authOptions export for compatibility with existing code.
 *
 * WARNING: This is a static fallback. For proper multi-tenant auth,
 * use getServerSession() which dynamically resolves tenant.
 *
 * @deprecated Use getServerSession() instead
 */
export const authOptions: NextAuthOptions = fallbackAuthOptions;

/**
 * Get server session with automatic tenant resolution.
 * This replaces direct calls to getServerSession(authOptions).
 *
 * Usage:
 *   import { getServerSession } from "@/lib/auth";
 *   const session = await getServerSession();
 */
export async function getServerSession() {
    const nextAuthOptions = await getAuthOptions();
    return nextAuthGetServerSession(nextAuthOptions);
}

