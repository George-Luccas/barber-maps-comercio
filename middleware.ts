import NextAuth from "next-auth";
import { authConfig } from "./app/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    /*
     * Protege todas as rotas exceto:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico, manifest.json (arquivos públicos)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.jpeg).*)",
  ],
};