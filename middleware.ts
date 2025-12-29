import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Caminhos públicos que não precisam de autenticação
  const publicPaths = ["/login", "/register", "/landing"];
  
  // Verifica se é um caminho público
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Tenta obter o token de sessão (nome varia entre prod e dev)
  const token = request.cookies.get("authjs.session-token")?.value || // v5 beta default
                request.cookies.get("__Secure-authjs.session-token")?.value || 
                request.cookies.get("next-auth.session-token")?.value || 
                request.cookies.get("__Secure-next-auth.session-token")?.value;

  // Se o usuário tenta acessar página de login mas já tem token, redireciona para home
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Se o usuário tenta acessar página protegida sem token, redireciona para login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Protege todas as rotas exceto:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico, manifest.json (arquivos públicos)
     * - landing pages, etc
     */
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.jpeg).*)",
  ],
};