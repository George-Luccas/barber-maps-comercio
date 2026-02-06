"use client"

import { useState } from "react"
import { User, Mail, Phone, MapPin, Briefcase, Edit3, Save, X, Sparkles, Building2, UserCircle } from "lucide-react"
import Sidebar from "@/app/components/Sidebar"

interface BarberProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    image: string;
    bio: string;
    specialties: string[];
    isAutonomous: boolean;
    workplaceName: string;
    createdAt: string;
  }
}

export default function BarberProfileClient({ user }: BarberProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone,
    bio: user.bio,
    specialties: user.specialties.join(", "),
    workplaceName: user.workplaceName,
    isAutonomous: user.isAutonomous,
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/barber-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          specialties: formData.specialties.split(",").map(s => s.trim()).filter(Boolean),
        }),
      })
      if (res.ok) {
        setIsEditing(false)
        window.location.reload()
      } else {
        alert("Erro ao salvar alterações")
      }
    } catch (error) {
      alert("Erro ao salvar: " + error)
    } finally {
      setSaving(false)
    }
  }

  const specialtiesArray = user.specialties.length > 0 ? user.specialties : ["Adicione suas especialidades"]

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="p-6 md:p-10 md:ml-64">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="text-brand-primary" size={28} />
            <h1 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tighter italic">
              Meu Perfil
            </h1>
          </div>
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">
            Barbeiro Divulgação
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-3xl p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-2xl bg-brand-primary/10 border-2 border-brand-primary/30 flex items-center justify-center overflow-hidden">
                {user.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-brand-primary" />
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="text-2xl font-black text-foreground bg-muted/50 border border-border rounded-xl px-4 py-2 w-full"
                    />
                  ) : (
                    <h2 className="text-2xl font-black text-foreground">{user.name}</h2>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {user.isAutonomous ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase">
                        <UserCircle size={14} />
                        Autônomo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold uppercase">
                        <Building2 size={14} />
                        {user.workplaceName || "Barbearia não informada"}
                      </span>
                    )}
                  </div>
                </div>
                
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-3 rounded-xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-all"
                  >
                    <Edit3 size={20} />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="p-3 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-all disabled:opacity-50"
                    >
                      <Save size={20} />
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail size={18} className="text-brand-primary" />
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone size={18} className="text-brand-primary" />
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="text-sm bg-muted/50 border border-border rounded-lg px-3 py-1 w-full"
                    />
                  ) : (
                    <span className="text-sm font-medium">{user.phone || "Não informado"}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-card border border-border rounded-3xl p-8 mb-6">
          <h3 className="text-lg font-black text-foreground uppercase tracking-wider mb-4">Sobre Mim</h3>
          {isEditing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Conte um pouco sobre você e seu trabalho..."
              className="w-full h-32 bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground resize-none"
            />
          ) : (
            <p className="text-muted-foreground leading-relaxed">
              {user.bio || "Você ainda não adicionou uma descrição. Clique em editar para adicionar."}
            </p>
          )}
        </div>

        {/* Specialties */}
        <div className="bg-card border border-border rounded-3xl p-8">
          <h3 className="text-lg font-black text-foreground uppercase tracking-wider mb-4">Especialidades</h3>
          {isEditing ? (
            <input
              type="text"
              value={formData.specialties}
              onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
              placeholder="Degradê, Barba, Corte Navalhado (separado por vírgula)"
              className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground"
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {specialtiesArray.map((specialty, index) => (
                <span
                  key={index}
                  className="px-4 py-2 rounded-xl bg-brand-primary/10 text-brand-primary text-sm font-bold uppercase tracking-wider"
                >
                  {specialty}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Member Since */}
        <div className="mt-6 text-center text-muted-foreground text-xs uppercase tracking-widest">
          Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </div>
      </main>
    </div>
  )
}
