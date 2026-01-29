
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isSuspended = (auth?.user as any)?.isSuspended;
      
      const isOnSuspendedPage = nextUrl.pathname === '/suspended';
      const isOnLoginPage = nextUrl.pathname.startsWith('/login');
      const isPublicPath = ["/login", "/register", "/landing", "/test-db", "/api", "/forgot-password", "/reset-password"].some(p => nextUrl.pathname.startsWith(p));

      // 1. If suspended, FORCE redirect to /suspended (unless already there)
      if (isSuspended && !isOnSuspendedPage) {
          return Response.redirect(new URL('/suspended', nextUrl));
      }

      // 2. If NOT suspended but trying to access /suspended, kick out to home
      if (!isSuspended && isOnSuspendedPage) {
          return Response.redirect(new URL('/', nextUrl));
      }

      // 3. Login Redirects
      if (isOnLoginPage) {
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
        return true;
      }
      
      // 4. Protected Routes
      if (!isLoggedIn && !isPublicPath) {
        return false; // Redirect to login
      }

      return true;
    },
  },
} satisfies NextAuthConfig
