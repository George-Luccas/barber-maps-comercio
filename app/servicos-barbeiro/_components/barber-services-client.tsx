"use client"

import { useState } from "react"
import { Scissors, Plus, Trash2, Edit3, Save, X, DollarSign, Clock } from "lucide-react"
import Sidebar from "@/app/components/Sidebar"

interface Service {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  durationMinutes: number;
}

interface BarberServicesProps {
  userId: string;
  userName: string;
  specialties: string[];
}

export default function BarberServicesClient({ userId, userName, specialties }: BarberServicesProps) {
  // Mock services based on specialties - in production, fetch from DB
  const [services, setServices] = useState<Service[]>(
    specialties.map((specialty, index) => ({
      id: `temp-${index}`,
      name: specialty,
      description: `Serviço de ${specialty.toLowerCase()}`,
      priceInCents: 3500 + (index * 500),
      durationMinutes: 30 + (index * 15),
    }))
  )
  
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newService, setNewService] = useState<Omit<Service, 'id'>>({
    name: "",
    description: "",
    priceInCents: 3500,
    durationMinutes: 30,
  })

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const handleAddService = () => {
    if (!newService.name) {
      alert("Informe o nome do serviço")
      return
    }

    const tempId = Date.now().toString()
    setServices([...services, { id: tempId, ...newService }])
    setNewService({ name: "", description: "", priceInCents: 3500, durationMinutes: 30 })
    setIsAddingNew(false)
    // TODO: Save to API
  }

  const handleDeleteService = (serviceId: string) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return
    setServices(services.filter(s => s.id !== serviceId))
    // TODO: Delete from API
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="p-6 md:p-10 md:ml-64">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Scissors className="text-brand-primary" size={28} />
              <h1 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tighter italic">
                Meus Serviços
              </h1>
            </div>
            <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">
              Serviços que você oferece
            </p>
          </div>

          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-primary-foreground rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-brand-primary/80 transition-all"
          >
            <Plus size={20} />
            Novo Serviço
          </button>
        </div>

        {/* Add New Service Modal */}
        {isAddingNew && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-3xl p-8 w-full max-w-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-foreground uppercase">Novo Serviço</h3>
                <button onClick={() => setIsAddingNew(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Nome do Serviço
                  </label>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    placeholder="Ex: Corte Degradê"
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Descrição
                  </label>
                  <textarea
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    placeholder="Descrição do serviço..."
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground h-24 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                      Preço (R$)
                    </label>
                    <input
                      type="number"
                      value={newService.priceInCents / 100}
                      onChange={(e) => setNewService({ ...newService, priceInCents: Math.round(parseFloat(e.target.value) * 100) })}
                      step="0.01"
                      min="0"
                      className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                      Duração (min)
                    </label>
                    <input
                      type="number"
                      value={newService.durationMinutes}
                      onChange={(e) => setNewService({ ...newService, durationMinutes: parseInt(e.target.value) })}
                      min="5"
                      step="5"
                      className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddService}
                  className="w-full py-4 bg-brand-primary text-primary-foreground rounded-xl font-bold uppercase tracking-wider hover:bg-brand-primary/80 transition-all"
                >
                  Salvar Serviço
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Services List */}
        {services.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-12 text-center">
            <Scissors size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">Nenhum serviço cadastrado</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Adicione os serviços que você oferece para seus clientes
            </p>
            <button
              onClick={() => setIsAddingNew(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-primary-foreground rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-brand-primary/80 transition-all"
            >
              <Plus size={20} />
              Adicionar Primeiro Serviço
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div 
                key={service.id} 
                className="bg-card border border-border rounded-2xl p-6 hover:border-brand-primary/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                    <Scissors className="text-brand-primary" size={24} />
                  </div>
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <h3 className="text-lg font-black text-foreground mb-2">{service.name}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {service.description || "Sem descrição"}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <DollarSign size={16} />
                    <span className="font-black">{formatPrice(service.priceInCents)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock size={16} />
                    <span className="text-sm font-medium">{service.durationMinutes} min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
