"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBarbershop } from "./_actions/create-barbershop"
import { Store, Phone, ArrowRight, Loader2 } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")

    try {
      const result = await createBarbershop(formData)

      if (result.success) {
        // Redireciona para o dash/home após sucesso
        router.push("/")
        router.refresh()
      } else {
        setError(result.error || "Erro ao criar barbearia.")
        setLoading(false)
      }
    } catch (e) {
      setError("Erro inesperado. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
            <Store className="h-8 w-8 text-violet-600" />
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">
            Bem-vindo ao Barber Maps!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Para começar, precisamos criar o perfil da sua barbearia. É rápido!
          </p>
        </div>

        <form action={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="name" className="sr-only">Nome da Barbearia</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Store className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-500 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-violet-500 sm:text-sm transition-all"
                  placeholder="Nome da Barbearia"
                />
              </div>
            </div>
            <div>
              <label htmlFor="phone" className="sr-only">Telefone</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-500 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-violet-500 sm:text-sm transition-all"
                  placeholder="Telefone / WhatsApp"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 text-center border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-70 transition-all shadow-md hover:shadow-lg"
          >
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <span className="flex items-center">
                Criar Minha Barbearia
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
