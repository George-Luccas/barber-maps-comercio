
"use client";

import { useState, Suspense } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
        toast.error("As senhas não coincidem!");
        return;
    }
    
    if (password.length < 6) {
        toast.error("A senha deve ter no mínimo 6 caracteres.");
        return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao redefinir");

      toast.success("Senha alterada com sucesso! Redirecionando...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
      return (
          <div className="text-center p-8 bg-card border border-border rounded-2xl">
              <p className="text-red-500 font-bold uppercase text-sm">Token inválido ou não fornecido.</p>
              <Link href="/login" className="block mt-4 text-xs font-black uppercase text-muted-foreground hover:text-foreground">Voltar</Link>
          </div>
      )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <div className="relative">
         <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nova Senha"
            required
            className="w-full bg-muted border border-border rounded-xl p-4 outline-none focus:border-brand-primary font-bold text-sm transition-all"
         />
         <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 -translate-y-1/2 right-4 text-muted-foreground hover:text-foreground">
             {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
         </button>
      </div>

      <input
        type={showPassword ? "text" : "password"}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirmar Nova Senha"
        required
        className="w-full bg-muted border border-border rounded-xl p-4 outline-none focus:border-brand-primary font-bold text-sm transition-all"
      />
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-primary text-primary-foreground font-black uppercase text-xs tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" size={16} /> : "SAVAR NOVA SENHA"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex h-screen items-center justify-center bg-background px-4 flex-col gap-6">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-black italic uppercase">Redefinir <span className="text-brand-primary">Senha</span></h1>
                <p className="text-sm text-muted-foreground">Crie uma nova senha segura para sua conta.</p>
            </div>
            
            <Suspense fallback={<Loader2 className="animate-spin text-brand-primary" />}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    )
}
