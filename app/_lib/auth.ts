import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./prisma";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/app/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
            if (!credentials?.email || !credentials?.password) return null;

            const user = await db.user.findUnique({
              where: { email: credentials.email as string },
            });

            if (!user || !user.password) return null;

            const isValid = await bcrypt.compare(
              credentials.password as string,
              user.password
            );

            if (!isValid) return null;

            return user;
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
            // Quando o usuário faz login, buscamos a barbearia associada
            const dbUser = await db.user.findUnique({
               where: { email: user.email! },
               include: { Barbershop: true }
            });
            
            if (dbUser?.Barbershop) {
                token.barbershopId = dbUser.Barbershop.id;
            }
        } catch (error) {
            console.error("Erro no callback JWT:", error);
            // Não quebramos o login, apenas seguimos sem o barbershopId se der erro no banco
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
        session.user.barbershopId = token.barbershopId as string;
      }
      return session;
    },
    // We can include the 'authorized' callback from authConfig here or let it be handled by middleware import
  },
  session: {
    strategy: "jwt",
  },
});