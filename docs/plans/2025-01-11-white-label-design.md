# White Label Design - GTA RP Dashboard

## Visao Geral

Sistema multi-tenant para oferecer o GTA RP Dashboard como white label para multiplos clientes (20+).

## Requisitos

- **Clientes esperados:** 20+
- **Dominios:** Subdominios (cliente.suaplataforma.com) + dominios proprios
- **Banco de dados:** Schema separado por tenant (isolamento moderado)
- **Personalizacao:** Completa (logo, cores, CSS, features on/off)
- **Gerenciamento:** Painel admin central
- **Hospedagem:** Vercel

## Arquitetura

Multi-tenant com um unico deploy. Um projeto Vercel serve todos os clientes, detectando o tenant pelo dominio.

```
┌─────────────────────────────────────────────────────────┐
│                      VERCEL                              │
│  ┌─────────────────────────────────────────────────┐    │
│  │           Next.js (unico deploy)                 │    │
│  │  ┌─────────────┐  ┌─────────────────────────┐   │    │
│  │  │ Middleware  │→ │ Detecta tenant por URL  │   │    │
│  │  └─────────────┘  └─────────────────────────┘   │    │
│  │         ↓                                        │    │
│  │  ┌─────────────────────────────────────────┐    │    │
│  │  │  App Routes (com tenantId em contexto)  │    │    │
│  │  │  /dashboard, /reports, /admin           │    │    │
│  │  └─────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   PostgreSQL                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│  │ Tenant A │ │ Tenant B │ │ Tenant C │  (tenantId)     │
│  │ Users    │ │ Users    │ │ Users    │                 │
│  │ Reports  │ │ Reports  │ │ Reports  │                 │
│  └──────────┘ └──────────┘ └──────────┘                 │
└─────────────────────────────────────────────────────────┘
```

---

## 1. Modelo de Dados - Tenant

```prisma
model Tenant {
  id          String   @id @default(cuid())
  name        String   // "Cidade Alta RP"
  slug        String   @unique // "cidadealta"

  // Dominios
  subdomain   String   @unique // cidadealta.suaplataforma.com
  customDomain String? @unique // dashboard.cidadealta.com.br

  // Branding
  logo        String?  // URL do logo
  primaryColor String  @default("#6366f1")
  secondaryColor String @default("#4f46e5")
  customCss   String?  // CSS adicional

  // Features habilitadas
  features    Json     @default("{}")
  // Ex: { "archive": true, "punishments": true, "discord_notify": false }

  // Discord (cada cliente tem seu proprio)
  discordGuildId    String
  discordClientId   String
  discordClientSecret String
  discordRoleAdmin  String
  discordRoleEvaluator String?
  discordRolePlayer String?

  // Status
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  // Relacoes
  users       User[]
  reports     Report[]
  punishments Punishment[]
}
```

**Modificacoes nas tabelas existentes:**

Adicionar `tenantId` em: User, Report, Punishment, Organization, etc.

```prisma
model User {
  // ... campos existentes
  tenantId  String
  tenant    Tenant @relation(fields: [tenantId], references: [id])
}
```

---

## 2. Middleware - Deteccao de Tenant

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const domain = hostname.split(':')[0]

  let tenantSlug: string | null = null

  if (domain.endsWith('.suaplataforma.com')) {
    // Subdominio
    tenantSlug = domain.replace('.suaplataforma.com', '')
  } else {
    // Dominio customizado - busca no banco
    tenantSlug = await getTenantByCustomDomain(domain)
  }

  if (!tenantSlug) {
    return NextResponse.redirect(new URL('/404', request.url))
  }

  const response = NextResponse.next()
  response.headers.set('x-tenant-slug', tenantSlug)

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

---

## 3. Tenant Context - React

```typescript
// src/lib/tenant-context.tsx
'use client'
import { createContext, useContext } from 'react'

type TenantConfig = {
  id: string
  name: string
  slug: string
  logo: string | null
  primaryColor: string
  secondaryColor: string
  customCss: string | null
  features: {
    archive?: boolean
    punishments?: boolean
    discordNotify?: boolean
  }
}

const TenantContext = createContext<TenantConfig | null>(null)

export const TenantProvider = TenantContext.Provider

export function useTenant() {
  const tenant = useContext(TenantContext)
  if (!tenant) throw new Error('useTenant must be used within TenantProvider')
  return tenant
}
```

---

## 4. Layout com Branding Dinamico

```tsx
// src/app/(tenant)/layout.tsx
import { headers } from 'next/headers'
import { getTenantBySlug } from '@/lib/tenant'
import { TenantProvider } from '@/lib/tenant-context'

export default async function TenantLayout({ children }) {
  const headersList = headers()
  const tenantSlug = headersList.get('x-tenant-slug')
  const tenant = await getTenantBySlug(tenantSlug)

  return (
    <html
      lang="pt-BR"
      style={{
        '--color-primary': tenant.primaryColor,
        '--color-secondary': tenant.secondaryColor,
      } as React.CSSProperties}
    >
      <head>
        <title>{tenant.name} - Dashboard</title>
        {tenant.customCss && <style>{tenant.customCss}</style>}
      </head>
      <body>
        <TenantProvider value={tenant}>
          {children}
        </TenantProvider>
      </body>
    </html>
  )
}
```

---

## 5. Isolamento de Dados - Prisma Helper

```typescript
// src/lib/db.ts
import { prisma } from './prisma'
import { getCurrentTenantId } from './tenant'

export async function getTenantPrisma() {
  const tenantId = await getCurrentTenantId()

  return {
    user: {
      findMany: (args?: any) => prisma.user.findMany({
        ...args,
        where: { ...args?.where, tenantId }
      }),
      findFirst: (args?: any) => prisma.user.findFirst({
        ...args,
        where: { ...args?.where, tenantId }
      }),
      create: (args: any) => prisma.user.create({
        ...args,
        data: { ...args.data, tenantId }
      }),
      update: (args: any) => prisma.user.update({
        ...args,
        where: { ...args.where, tenantId }
      }),
      delete: (args: any) => prisma.user.delete({
        ...args,
        where: { ...args.where, tenantId }
      }),
    },
    report: {
      // mesma estrutura...
    },
    punishment: {
      // mesma estrutura...
    },
  }
}
```

---

## 6. Autenticacao Discord Multi-tenant

```typescript
// src/lib/auth-options.ts
import { NextAuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import { TenantConfig } from './tenant'

export function createAuthOptions(tenant: TenantConfig): NextAuthOptions {
  return {
    providers: [
      DiscordProvider({
        clientId: tenant.discordClientId,
        clientSecret: tenant.discordClientSecret,
        authorization: {
          params: {
            scope: 'identify guilds guilds.members.read'
          }
        }
      })
    ],
    callbacks: {
      async signIn({ account }) {
        // Verifica se usuario pertence ao Discord do tenant
        const isMember = await checkGuildMembership(
          account?.access_token!,
          tenant.discordGuildId
        )
        return isMember
      },
      async session({ session, token }) {
        session.tenantId = tenant.id
        session.user.id = token.sub
        return session
      },
      async jwt({ token, account, profile }) {
        if (account && profile) {
          token.accessToken = account.access_token
        }
        return token
      }
    }
  }
}
```

---

## 7. Estrutura de Pastas

```
src/
├── app/
│   ├── (tenant)/              # Rotas do dashboard (por tenant)
│   │   ├── layout.tsx         # Aplica branding
│   │   ├── page.tsx           # Home
│   │   ├── reports/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── punishments/
│   │   └── settings/
│   │
│   ├── admin/                 # Painel super admin
│   │   ├── layout.tsx         # Protegido por super admin
│   │   ├── page.tsx           # Dashboard admin
│   │   ├── tenants/
│   │   │   ├── page.tsx       # Lista tenants
│   │   │   ├── new/page.tsx   # Criar tenant
│   │   │   └── [id]/
│   │   │       ├── page.tsx   # Editar tenant
│   │   │       ├── branding/page.tsx
│   │   │       ├── features/page.tsx
│   │   │       └── discord/page.tsx
│   │   └── metrics/page.tsx
│   │
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── tenants/
│       │   ├── route.ts       # GET (list), POST (create)
│       │   └── [id]/route.ts  # GET, PUT, DELETE
│       └── admin/
│           └── metrics/route.ts
│
├── components/
│   ├── ui/                    # Componentes com CSS variables
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── tenant/                # Componentes especificos de tenant
│   │   ├── logo.tsx
│   │   └── navbar.tsx
│   └── admin/                 # Componentes do painel admin
│       ├── tenant-form.tsx
│       └── tenant-list.tsx
│
├── lib/
│   ├── prisma.ts              # Cliente Prisma
│   ├── tenant.ts              # Helpers de tenant
│   ├── tenant-context.tsx     # Context React
│   ├── db.ts                  # Prisma com filtro de tenant
│   └── auth-options.ts        # NextAuth dinamico
│
└── middleware.ts              # Detecta tenant pelo dominio
```

---

## 8. Configuracao Vercel

### Dominios

```
# Vercel > Project > Domains

# Wildcard para subdominios
*.suaplataforma.com

# Dominio principal (painel admin)
suaplataforma.com
admin.suaplataforma.com

# Dominios customizados (adicionar conforme clientes)
dashboard.cidadealta.com.br
dashboard.outrocliente.com
```

### Variaveis de Ambiente

```env
# Globais (unicas para toda plataforma)
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://suaplataforma.com"

# Super admins
SUPER_ADMIN_EMAILS="admin@suaplataforma.com"

# Credenciais Discord sao por tenant (salvas no banco, nao aqui)
```

---

## 9. Fluxo de Onboarding

1. Super admin acessa `/admin/tenants/new`
2. Preenche dados do cliente:
   - Nome do servidor
   - Slug (gera subdominio)
   - Discord Guild ID
   - Discord OAuth credentials
3. Sistema cria tenant no banco
4. Cliente acessa `slug.suaplataforma.com`
5. Faz login com Discord
6. Dashboard funcionando

### Dominio customizado (opcional)

1. Cliente solicita usar dominio proprio
2. Super admin adiciona no painel + Vercel
3. Cliente configura DNS (CNAME para cname.vercel-dns.com)
4. Pronto

---

## 10. Proximos Passos - Implementacao

1. [ ] Adicionar model Tenant no schema.prisma
2. [ ] Adicionar tenantId nas tabelas existentes
3. [ ] Criar middleware de deteccao de tenant
4. [ ] Criar TenantContext e TenantProvider
5. [ ] Adaptar layout para branding dinamico
6. [ ] Criar helper tenantPrisma para isolamento
7. [ ] Adaptar NextAuth para multi-tenant
8. [ ] Criar rotas do painel admin (/admin/*)
9. [ ] Criar API routes para CRUD de tenants
10. [ ] Configurar dominios na Vercel
11. [ ] Migrar CSS fixo para CSS variables
12. [ ] Testar com 2-3 tenants de teste
