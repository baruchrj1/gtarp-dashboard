import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            isAdmin: boolean
            isSuperAdmin: boolean
            role: string // PLAYER, EVALUATOR, ADMIN
            discordRoles: string[] // Array of Discord Role IDs
            tenantId?: string
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        isAdmin?: boolean
        isSuperAdmin?: boolean
        role?: string
        discordRoles?: string[]
        tenantId?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        isAdmin: boolean
        isSuperAdmin: boolean
        role: string
        discordRoles: string[]
        tenantId?: string
    }
}
