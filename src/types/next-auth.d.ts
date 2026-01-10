import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            isAdmin: boolean
            role: string // PLAYER, EVALUATOR, ADMIN
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        isAdmin?: boolean
        role?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        isAdmin: boolean
        role: string
    }
}
