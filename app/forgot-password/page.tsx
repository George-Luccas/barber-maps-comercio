
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Erro ao enviar");

      setSent(true);
      toast.success("Se o e-mail existir, você receberá um link de recuperação.");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
            <h1 className="text-2xl font-black italic uppercase text-brand-primary">Email Enviado!</h1>
            <p className="text-muted-foreground">Verifique sua caixa de entrada (e spam) para redefinir sua senha.</p>
            <Link href="/login" className="block w-full bg-muted py-3 rounded-xl font-bold uppercase text-xs hover:bg-muted/80 transition-cell">
                Voltar para Login
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
            <h1 className="text-2xl font-black italic uppercase">Recuperar <span className="text-brand-primary">Senha</span></h1>
            <p className="text-sm text-muted-foreground">Digite seu email de cadastro para receber o link.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            className="w-full bg-muted border border-border rounded-xl p-4 outline-none focus:border-brand-primary font-bold text-sm transition-all"
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary text-primary-foreground font-black uppercase text-xs tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : "ENVIAR EMAIL"}
          </button>
        </form>

        <div className="text-center">
             <Link href="/login" className="text-xs font-bold uppercase text-muted-foreground hover:text-foreground">
                Voltar para Login
             </Link>
        </div>
      </div>
    </div>
  );
}
