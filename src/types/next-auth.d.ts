import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            isAdmin: boolean
            isSuperAdmin: boolean
            role: string // PLAYER, EVALUATOR, ADMIN
            tenantId?: string
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        isAdmin?: boolean
        isSuperAdmin?: boolean
        role?: string
        tenantId?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        isAdmin: boolean
        isSuperAdmin: boolean
        role: string
        tenantId?: string
    }
}
