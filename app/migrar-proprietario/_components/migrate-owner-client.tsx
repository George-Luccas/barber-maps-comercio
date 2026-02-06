"use client"

import { useState } from "react"
import { Store, ArrowRight, Sparkles, MapPin, Phone, FileText } from "lucide-react"
import Sidebar from "@/app/components/Sidebar"
import { useRouter } from "next/navigation"

interface MigrateOwnerProps {
  userId: string;
  userName: string;
  userPhone: string;
}

export default function MigrateOwnerClient({ userId, userName, userPhone }: MigrateOwnerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    shopName: `${userName} Barbearia`,
    address: "",
    description: "",
    phone: userPhone,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.shopName || !formData.address) {
      alert("Preencha o nome e endereço da barbearia")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/migrate-to-owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        alert("Parabéns! Sua barbearia foi criada com sucesso!")
        // Force full page reload to update session
        window.location.href = "/"
      } else {
        const data = await res.json()
        alert(data.error || "Erro ao criar barbearia")
      }
    } catch (error) {
      alert("Erro ao processar: " + error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="p-6 md:p-10 md:ml-64">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 bg-brand-primary/10 rounded-full">
            <Sparkles className="text-brand-primary animate-pulse" size={24} />
            <span className="text-brand-primary font-black uppercase tracking-wider text-sm">Upgrade de Conta</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black text-foreground uppercase tracking-tighter mb-4">
            Virar <span className="text-brand-primary italic">Proprietário</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Crie sua própria barbearia e tenha acesso completo ao painel de gestão
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: "📊", title: "Financeiro Completo", desc: "Controle total das finanças" },
            { icon: "📦", title: "Gestão de Estoque", desc: "Controle seus produtos" },
            { icon: "👥", title: "Equipe", desc: "Gerencie seus barbeiros" },
          ].map((benefit, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-6 text-center">
              <span className="text-4xl mb-3 block">{benefit.icon}</span>
              <h3 className="font-black text-foreground mb-1">{benefit.title}</h3>
              <p className="text-muted-foreground text-sm">{benefit.desc}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-3xl p-8 max-w-2xl mx-auto">
          <h2 className="text-xl font-black text-foreground uppercase tracking-wider mb-6 flex items-center gap-3">
            <Store className="text-brand-primary" size={24} />
            Dados da Barbearia
          </h2>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                Nome da Barbearia
              </label>
              <input
                type="text"
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                placeholder="Ex: João Barbearia Premium"
                required
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-4 text-foreground text-lg font-bold focus:border-brand-primary outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                <MapPin size={14} />
                Endereço Completo
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua, Número, Bairro, Cidade - Estado"
                required
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-4 text-foreground focus:border-brand-primary outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                <Phone size={14} />
                Telefone/WhatsApp
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(00) 00000-0000"
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-4 text-foreground focus:border-brand-primary outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                <FileText size={14} />
                Descrição (opcional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Conte um pouco sobre sua barbearia..."
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-4 text-foreground h-28 resize-none focus:border-brand-primary outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-between p-6 bg-brand-primary text-primary-foreground rounded-2xl font-black uppercase tracking-wider hover:bg-brand-primary/90 transition-all disabled:opacity-50"
            >
              <span className="text-xl">
                {loading ? "Criando..." : "Criar Minha Barbearia"}
              </span>
              <ArrowRight size={24} />
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
