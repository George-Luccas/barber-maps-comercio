"use client"

import { useState } from "react"
import { User, Mail, Phone, Briefcase, Edit3, Save, X, Sparkles, Building2, UserCircle, Image as ImageIcon } from "lucide-react"
import Sidebar from "@/app/components/Sidebar"
import PortfolioTab from "./portfolio-tab"
import { UploadButton } from "@/app/_lib/uploadthing"

interface GalleryImage {
  id: string
  imageUrl: string
  description: string | null
}

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
  initialPortfolio: GalleryImage[]
}

export default function BarberProfileClient({ user, initialPortfolio }: BarberProfileProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'portfolio'>('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone,
    bio: user.bio,
    specialties: user.specialties.join(", "),
    workplaceName: user.workplaceName,
    isAutonomous: user.isAutonomous,
    image: user.image, // Add image to form state
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async (dataToSave = formData) => {
    setSaving(true)
    try {
      const res = await fetch("/api/barber-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...dataToSave,
          specialties: dataToSave.specialties.split(",").map(s => s.trim()).filter(Boolean),
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

  const handleProfileImageUpload = async (res: { url: string }[]) => {
    if (res && res.length > 0) {
      const newImageUrl = res[0].url
      setFormData(prev => ({ ...prev, image: newImageUrl }))
      // Save immediately
      await handleSave({ ...formData, image: newImageUrl })
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

        {/* Tabs Navigation */}
        <div className="flex items-center gap-2 mb-8 border-b border-border/50 pb-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-t-xl font-black uppercase text-xs tracking-wider transition-all relative ${
              activeTab === 'profile'
                ? 'text-brand-primary bg-brand-primary/10 border-b-2 border-brand-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <User size={16} />
              Dados Pessoais
            </div>
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-6 py-3 rounded-t-xl font-black uppercase text-xs tracking-wider transition-all relative ${
              activeTab === 'portfolio'
                ? 'text-brand-primary bg-brand-primary/10 border-b-2 border-brand-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <ImageIcon size={16} />
              Meus Trabalhos
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'profile' ? (
            <>
              {/* Profile Tab */}
              <div className="bg-card border border-border rounded-3xl p-8 mb-6">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Avatar Upload */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-3">
                    <div className="w-32 h-32 rounded-2xl bg-brand-primary/10 border-2 border-brand-primary/30 flex items-center justify-center overflow-hidden relative group">
                      {user.image ? (
                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={48} className="text-brand-primary" />
                      )}
                      
                      {/* Upload Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                         <div className="scale-75">
                           <UploadButton
                             endpoint="imageUploader"
                             onClientUploadComplete={handleProfileImageUpload}
                             onUploadError={(error: Error) => alert(`Erro: ${error.message}`)}
                             appearance={{
                               button: "bg-transparent text-white w-full h-full",
                               allowedContent: "hidden"
                             }}
                             content={{
                               button: <Edit3 size={24} />
                             }}
                           />
                         </div>
                      </div>
                    </div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest text-center">
                      Alterar Foto
                    </p>
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-full">
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="text-2xl font-black text-foreground bg-muted/50 border border-border rounded-xl px-4 py-2 w-full mb-2"
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
                          className="p-3 rounded-xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-all ml-4"
                        >
                          <Edit3 size={20} />
                        </button>
                      ) : (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleSave()}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
            </>
          ) : (
            /* Portfolio Tab */
            <PortfolioTab initialImages={initialPortfolio} />
          )}
        </div>
      </main>
    </div>
  )
}
