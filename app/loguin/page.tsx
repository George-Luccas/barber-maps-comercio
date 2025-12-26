'use client'

import { useState } from 'react'
import { Lock, Mail, Phone, User, ArrowRight } from 'lucide-react'
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { registerUser } from "./_actions/register" // Vamos criar esse arquivo em seguida

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData)

    try {
      if (isLogin) {
        // LÓGICA DE LOGIN
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        })

        if (result?.error) {
          alert("Email ou senha inválidos!")
        } else {
          router.push("/") // Manda para o Dashboard
          router.refresh()
        }
      } else {
        // LÓGICA DE CADASTRO (Server Action)
        await registerUser(formData)
        alert("Cadastro realizado! Agora faça o login.")
        setIsLogin(true)
      }
    } catch (error) {
      alert("Ocorreu um erro: " + error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* IMAGEM DE FUNDO */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"></div>
      </div>

      {/* CARD DE VIDRO */}
      <div className="relative z-10 w-full max-w-xl p-10 mx-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-[3rem] shadow-2xl">
        
        <div className="text-center mb-10">
          <h1 className="text-6xl font-black text-yellow-500 uppercase tracking-tighter mb-2">
            {isLogin ? 'Entrar' : 'Cadastro'}
          </h1>
          <p className="text-gray-400 text-xl font-medium tracking-widest uppercase">
            {isLogin ? 'Painel Administrativo' : 'Crie sua conta de barbeiro'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
              <input name="name" type="text" placeholder="NOME COMPLETO" required className="w-full bg-white/5 border-2 border-white/10 p-6 pl-14 rounded-2xl text-white text-xl font-bold focus:border-yellow-500 outline-none transition-all placeholder:text-gray-600" />
            </div>
          )}

          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
            <input name="email" type="email" placeholder="EMAIL" required className="w-full bg-white/5 border-2 border-white/10 p-6 pl-14 rounded-2xl text-white text-xl font-bold focus:border-yellow-500 outline-none transition-all placeholder:text-gray-600" />
          </div>

          {!isLogin && (
            <div className="relative group">
              <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
              <input name="phone" type="tel" placeholder="NÚMERO DE WHATSAPP" required className="w-full bg-white/5 border-2 border-white/10 p-6 pl-14 rounded-2xl text-white text-xl font-bold focus:border-yellow-500 outline-none transition-all placeholder:text-gray-600" />
            </div>
          )}

          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
            <input name="password" type="password" placeholder="SENHA" required className="w-full bg-white/5 border-2 border-white/10 p-6 pl-14 rounded-2xl text-white text-xl font-bold focus:border-yellow-500 outline-none transition-all placeholder:text-gray-600" />
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="group w-full flex items-center justify-between p-6 mt-10 border-2 border-yellow-500 rounded-2xl bg-yellow-500 text-black hover:bg-transparent hover:text-yellow-500 transition-all duration-300 disabled:opacity-50"
          >
            <span className="text-3xl font-black uppercase tracking-tighter">
              {loading ? 'Processando...' : isLogin ? 'Acessar Painel' : 'Finalizar Registro'}
            </span>
            <div className="w-14 h-14 border-2 border-black group-hover:border-yellow-500 rounded-xl flex items-center justify-center">
              <ArrowRight className="w-8 h-8" />
            </div>
          </button>
        </form>

        <p className="mt-8 text-center text-gray-400 text-lg font-bold">
          {isLogin ? 'NÃO TEM CONTA?' : 'JÁ POSSUI CONTA?'} 
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="ml-2 text-yellow-500 hover:underline">
            CLIQUE AQUI
          </button>
        </p>
      </div>
    </div>
  )
}