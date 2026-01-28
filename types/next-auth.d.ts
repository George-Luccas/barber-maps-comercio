import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      barbershopId?: string
      role?: string
      isSuspended?: boolean
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    barbershopId?: string
    role?: string
    isSuspended?: boolean
  }
}
