import { auth } from "@/app/api/auth/[...nextauth]/route"; // Ajuste o caminho se necessário
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login"); // Ou a rota da sua página de login

  // 1. Se o usuário NÃO está logado e tenta acessar qualquer página que não seja o login
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. Se o usuário JÁ ESTÁ logado e tenta ir para o login, joga ele para o painel
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

// Configura quais páginas o middleware vai proteger
export const config = {
  matcher: [
    /*
     * Protege todas as rotas exceto:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico, manifest.json (arquivos públicos)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)",
  ],
};