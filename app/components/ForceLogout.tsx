"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function ForceLogout() {
  useEffect(() => {
    // Force redirect to signout endpoint to clear cookies server-side
    // This avoids dependency on SessionProvider context being present
    window.location.href = "/api/auth/signout?callbackUrl=/login";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
          Limpando sessão...
        </p>
      </div>
    </div>
  );
}
