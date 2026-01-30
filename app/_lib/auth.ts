import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./prisma";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/app/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: true,
  ...authConfig,
  // adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
            console.log("Tentando autorizar:", credentials?.email);
            if (!credentials?.email || !credentials?.password) return null;

            const email = (credentials.email as string).trim().toLowerCase();
            const password = (credentials.password as string).trim();

            const user = await db.user.findUnique({
              where: { email },
            });

            if (!user || !user.password) return null;

            const isValid = await bcrypt.compare(
              password,
              user.password
            );

            if (!isValid) return null;

            // return user; 
            // Retornamos um objeto simples para evitar erros de serialização (Dates, Decimals)
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role,
            };
        } catch (error) {
            console.error("Erro na autorização:", error);
            return null;
        }
      },
    }),
  ],
  callbacks: {
    // Merge callbacks if needed, or simply override/extend
    async jwt({ token, user, trigger, session }) {
      if (user) {
        try {
            // REDUCED PAYLOAD to prevent cookie chunking/header overflow
            token.role = user.role;
            // token.barbershopId ... (removed for stability)
        } catch (error) {
            console.error("Erro no callback JWT:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
        session.user.barbershopId = token.barbershopId as string;
        session.user.role = token.role as string;
        session.user.isSuspended = token.isSuspended as boolean; // Pass to session
      }
      return session;
    },
    // We can include the 'authorized' callback from authConfig here or let it be handled by middleware import
  },
  session: {
    strategy: "jwt",
  },
});