'use client'

import { useState } from 'react'
import { Lock, Mail, Phone, User, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { registerUser } from "./_actions/register" // Vamos criar esse arquivo em seguida

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData)

      if (isLogin) {
        // LÓGICA DE LOGIN
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        })

        if (result?.error) {
          console.error("Login Result Error:", result);
            // Tenta extrair mensagem amigável
            if (result.error.includes("code")) {
                 alert("Credenciais inválidas ou erro no servidor.");
            } else {
                 alert("Erro ao entrar: " + result.error);
            }
        } else {
          router.push("/");
          router.refresh();
        }
      } else {
        // LÓGICA DE CADASTRO (Server Action)
        const res = await registerUser(formData);
        
        if (!res.success) {
          alert(res.error || "Erro ao criar conta.");
          return;
        }

        alert("Cadastro realizado! Agora faça o login.");
        setIsLogin(true);
      }
    } catch (error) {
      alert("Ocorreu um erro inesperado: " + error);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background transition-colors duration-500">
      {/* IMAGEM DE FUNDO */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-background" />
        {/* LOGO GIRANDO NO FUNDO */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-[0.1] dark:opacity-[0.2] pro:opacity-[0.1] [perspective:1000px]">
           <img 
              src="/logo-spin-v2.png" 
              alt="Background Logo" 
              className="w-[500vw] h-auto object-contain animate-sway -translate-y-[10%] pro:invert"
           />
        </div>
      </div>

      {/* CARD DE VIDRO REMOVIDO (CONTAINER TRANSPARENTE) */}
      <div className="relative z-10 w-full max-w-xl p-6 md:p-10 mx-4">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-black text-brand-primary uppercase tracking-tighter mb-2 italic">
            {isLogin ? 'Entrar' : 'Cadastro'}
          </h1>
          <p className="text-muted-foreground text-sm font-black tracking-[0.2em] uppercase italic">
            {isLogin ? 'Painel Administrativo' : 'Crie sua conta de barbeiro'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="relative group">
              <User size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
              <input name="name" type="text" placeholder="NOME COMPLETO" required className="w-full bg-card border-2 border-border p-6 pl-14 rounded-2xl text-foreground text-xl font-bold focus:border-brand-primary outline-none transition-all placeholder:text-muted-foreground uppercase tracking-widest" />
            </div>
          )}

          <div className="relative group">
            <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
            <input 
              name="email" 
              type="email" 
              placeholder="EMAIL" 
              required 
              autoCapitalize="none"
              onInput={(e) => e.currentTarget.value = e.currentTarget.value.toLowerCase()}
              className="w-full bg-card border-2 border-border p-6 pl-14 rounded-2xl text-foreground text-xl font-bold focus:border-brand-primary outline-none transition-all placeholder:text-muted-foreground uppercase tracking-widest lowercase-input" 
            />
          </div>

          {!isLogin && (
            <div className="relative group">
              <Phone size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
              <input name="phone" type="tel" placeholder="NÚMERO DE WHATSAPP" required className="w-full bg-card border-2 border-border p-6 pl-14 rounded-2xl text-foreground text-xl font-bold focus:border-brand-primary outline-none transition-all placeholder:text-muted-foreground uppercase tracking-widest" />
            </div>
          )}

          <div className="relative group">
            <Lock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
            <input 
              name="password" 
              type={showPassword ? "text" : "password"} 
              placeholder="SENHA" 
              required 
              className="w-full bg-card border-2 border-border p-6 pl-14 pr-14 rounded-2xl text-foreground text-xl font-bold focus:border-brand-primary outline-none transition-all placeholder:text-muted-foreground uppercase tracking-widest" 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-primary transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
            </button>
          </div>



          <button 
            disabled={loading}
            type="submit" 
            className="group w-full flex items-center justify-between p-6 mt-10 border-2 border-brand-primary rounded-2xl bg-brand-primary text-primary-foreground hover:bg-transparent hover:text-brand-primary transition-all duration-300 disabled:opacity-50"
          >
            <span className="text-3xl font-black uppercase tracking-tighter italic">
              {loading ? 'Processando...' : isLogin ? 'Acessar Painel' : 'Finalizar Registro'}
            </span>
            <div className="w-14 h-14 border-2 border-primary-foreground group-hover:border-brand-primary rounded-xl flex items-center justify-center">
              <ArrowRight className="w-8 h-8" />
            </div>
          </button>
        </form>

        {/* ESQUECI MINHA SENHA - REMOVIDO DO FORM PARA EVITAR CONFLITOS */}
        {isLogin && (
            <div className="flex justify-end mt-4 relative z-[9999]">
            <a 
                href="/forgot-password" 
                className="text-xs font-black text-brand-primary hover:text-foreground uppercase tracking-widest transition-colors cursor-pointer p-2 block"
            >
                RECUPERAR SENHA
            </a>
            </div>
        )}

        <p className="mt-8 text-center text-muted-foreground text-xs font-black uppercase tracking-[0.2em] italic">
          {isLogin ? 'NÃO TEM CONTA?' : 'JÁ POSSUI CONTA?'} 
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="ml-2 text-brand-primary hover:underline font-black">
            CLIQUE AQUI
          </button>
        </p>
      </div>
    </div>
  )
}