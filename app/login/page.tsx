'use client'

import { useState } from 'react'
import { Lock, Mail, Phone, User, ArrowRight, Eye, EyeOff, Store, Scissors, Building2, UserCircle } from 'lucide-react'
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { registerUser } from "./_actions/register"

type AccountType = 'owner' | 'barber_promo' | null

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [accountType, setAccountType] = useState<AccountType>(null)
  const [isAutonomous, setIsAutonomous] = useState(false)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    
    const formData = new FormData(event.currentTarget)
    
    // Validar tipo de conta no cadastro
    if (!isLogin) {
      if (!accountType) {
        alert("Selecione o tipo de conta: Proprietário ou Barbeiro");
        setLoading(false);
        return;
      }
      formData.set('accountType', accountType)
      formData.set('isAutonomous', isAutonomous ? 'true' : 'false')
    }

    try {
      if (isLogin) {
        // LÓGICA DE LOGIN MANUAL DEBUG
        console.log("Debug: Iniciando login manual...");

        // 1. Obter CSRF Token
        const csrfRes = await fetch("/api/auth/csrf");
        const csrfJson = await csrfRes.json();
        const csrfToken = csrfJson.csrfToken;

        console.log("CSRF Token obtido:", csrfToken);

        // 2. Fazer POST de credenciais
        const params = new URLSearchParams();
        params.append("email", formData.get('email') as string);
        params.append("password", formData.get('password') as string);
        params.append("csrfToken", csrfToken);
        params.append("json", "true");

        const fetchUrl = "/api/auth/callback/credentials";
        console.log("Fetch URL:", fetchUrl);

        const res = await fetch(fetchUrl, {
            method: "POST",
            headers: { 
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params
        });

        const text = await res.text();
        console.log(`Login Status: ${res.status}`);
        console.log(`Login Raw Body: ${text}`);

        // Tratar erro de credenciais inválidas (401 ou URL com error)
        if (!res.ok || text.includes("error=CredentialsSignin")) {
            // Mensagem amigável para usuário não encontrado ou senha incorreta
            setLoading(false);
            alert(
                "❌ Email ou senha incorretos!\n\n" +
                "Se você ainda não tem uma conta, clique em 'Criar Conta' para se cadastrar.\n\n" +
                "Acesse nosso app e faça parte da comunidade Barber Maps! 🏆"
            );
            return;
        }

        try {
            const json = JSON.parse(text);
            if (json.url) {
                // Check if URL contains error
                if (json.url.includes("error=")) {
                    setLoading(false);
                    alert(
                        "📋 Conta não encontrada!\n\n" +
                        "Parece que você ainda não tem cadastro.\n" +
                        "Clique em 'Criar Conta' e cadastre-se para acessar nosso app! 🚀"
                    );
                    return;
                }
                window.location.href = json.url;
                return;
            }
        } catch(e) { 
            console.log("Resposta OK mas não-JSON, redirecionando..."); 
        }

        window.location.href = "/";
        return;
      } else {
        // LÓGICA DE CADASTRO (Server Action)
        const res = await registerUser(formData);
        
        if (!res.success) {
          alert(res.error || "Erro ao criar conta.");
          return;
        }

        alert("Cadastro realizado! Agora faça o login.");
        setIsLogin(true);
        setAccountType(null);
      }
    } catch (error) {
      alert("Ocorreu um erro inesperado: " + error);
    } finally {
      setLoading(false)
    }
  }

  // Componente de seleção de tipo de conta
  const AccountTypeSelector = () => (
    <div className="space-y-4 mb-6">
      <p className="text-center text-muted-foreground text-xs font-black uppercase tracking-[0.15em]">
        Escolha seu perfil
      </p>
      <div className="grid grid-cols-2 gap-4">
        {/* Proprietário */}
        <button
          type="button"
          onClick={() => { setAccountType('owner'); setIsAutonomous(false); }}
          className={`group p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
            accountType === 'owner'
              ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
              : 'border-border bg-card hover:border-brand-primary/50 text-muted-foreground hover:text-foreground'
          }`}
        >
          <Store size={32} className={`transition-colors ${accountType === 'owner' ? 'text-brand-primary' : 'group-hover:text-brand-primary'}`} />
          <span className="text-xs font-black uppercase tracking-widest">Proprietário</span>
          <span className="text-[10px] text-center opacity-70">Tenho uma barbearia</span>
        </button>

        {/* Barbeiro Divulgação */}
        <button
          type="button"
          onClick={() => setAccountType('barber_promo')}
          className={`group p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
            accountType === 'barber_promo'
              ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
              : 'border-border bg-card hover:border-brand-primary/50 text-muted-foreground hover:text-foreground'
          }`}
        >
          <Scissors size={32} className={`transition-colors ${accountType === 'barber_promo' ? 'text-brand-primary' : 'group-hover:text-brand-primary'}`} />
          <span className="text-xs font-black uppercase tracking-widest">Barbeiro</span>
          <span className="text-[10px] text-center opacity-70">Quero divulgar meu trabalho</span>
        </button>
      </div>
    </div>
  )

  // Campos extras para Barbeiro Divulgação
  const BarberPromoFields = () => (
    <div className="space-y-4">
      {/* Seleção Autônomo ou Trabalha em Barbearia */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setIsAutonomous(true)}
          className={`p-4 rounded-xl border-2 transition-all text-center ${
            isAutonomous
              ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
              : 'border-border bg-card/50 text-muted-foreground hover:border-brand-primary/30'
          }`}
        >
          <UserCircle size={20} className="mx-auto mb-2" />
          <span className="text-[10px] font-black uppercase tracking-widest">Autônomo</span>
        </button>
        <button
          type="button"
          onClick={() => setIsAutonomous(false)}
          className={`p-4 rounded-xl border-2 transition-all text-center ${
            !isAutonomous
              ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
              : 'border-border bg-card/50 text-muted-foreground hover:border-brand-primary/30'
          }`}
        >
          <Building2 size={20} className="mx-auto mb-2" />
          <span className="text-[10px] font-black uppercase tracking-widest">Trabalho em Barbearia</span>
        </button>
      </div>

      {/* Campo de nome da barbearia (só aparece se não for autônomo) */}
      {!isAutonomous && (
        <div className="relative group animate-in slide-in-from-top-2 duration-300">
          <Building2 size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
          <input 
            name="workplaceName" 
            type="text" 
            placeholder="Nome da Barbearia" 
            required={!isAutonomous}
            className="w-full bg-card border-2 border-border p-6 pl-14 rounded-2xl text-foreground text-xl font-bold focus:border-brand-primary outline-none transition-all placeholder:text-muted-foreground tracking-widest" 
          />
        </div>
      )}
    </div>
  )

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

      {/* CONTAINER */}
      <div className="relative z-10 w-full max-w-xl p-6 md:p-10 mx-4">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-black text-brand-primary uppercase tracking-tighter mb-2 italic">
            {isLogin ? 'Entrar' : 'Cadastro'}
          </h1>
          <p className="text-muted-foreground text-sm font-black tracking-[0.2em] uppercase italic">
            {isLogin 
              ? 'Painel Administrativo' 
              : accountType === 'barber_promo' 
                ? 'Divulgue seu trabalho' 
                : accountType === 'owner'
                  ? 'Gerencie sua barbearia'
                  : 'Escolha seu perfil abaixo'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleção de tipo de conta (apenas no cadastro) */}
          {!isLogin && <AccountTypeSelector />}

          {/* Campos do formulário (só aparecem após selecionar tipo) */}
          {(isLogin || accountType) && (
            <>
              {!isLogin && (
                <div className="relative group animate-in slide-in-from-top-2 duration-300">
                  <User size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
                  <input name="name" type="text" placeholder="Nome Completo" required className="w-full bg-card border-2 border-border p-6 pl-14 rounded-2xl text-foreground text-xl font-bold focus:border-brand-primary outline-none transition-all placeholder:text-muted-foreground tracking-widest" />
                </div>
              )}

              <div className="relative group">
                <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
                <input 
                  name="email" 
                  type="email" 
                  placeholder="Email" 
                  required 
                  autoCapitalize="none"
                  onInput={(e) => e.currentTarget.value = e.currentTarget.value.toLowerCase()}
                  className="w-full bg-card border-2 border-border p-6 pl-14 rounded-2xl text-foreground text-xl font-bold focus:border-brand-primary outline-none transition-all placeholder:text-muted-foreground tracking-widest lowercase-input" 
                />
              </div>

              {!isLogin && (
                <div className="relative group">
                  <Phone size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
                  <input name="phone" type="tel" placeholder="Número de WhatsApp" required className="w-full bg-card border-2 border-border p-6 pl-14 rounded-2xl text-foreground text-xl font-bold focus:border-brand-primary outline-none transition-all placeholder:text-muted-foreground tracking-widest" />
                </div>
              )}

              {/* Campos extras para Barbeiro-Divulgação */}
              {!isLogin && accountType === 'barber_promo' && <BarberPromoFields />}

              <div className="relative group">
                <Lock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Senha" 
                  required 
                  className="w-full bg-card border-2 border-border p-6 pl-14 pr-14 rounded-2xl text-foreground text-xl font-bold focus:border-brand-primary outline-none transition-all placeholder:text-muted-foreground tracking-widest" 
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
                disabled={loading || (!isLogin && !accountType)}
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
            </>
          )}
        </form>

        {/* ESQUECI MINHA SENHA */}
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
          <button 
            type="button" 
            onClick={() => { setIsLogin(!isLogin); setAccountType(null); }} 
            className="ml-2 text-brand-primary hover:underline font-black"
          >
            CLIQUE AQUI
          </button>
        </p>
      </div>
    </div>
  )
}