"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { searchClients, quickRegister, launchService, getBarbersAndServices } from "./_actions/launch-actions";
import { Search, UserPlus, Scissors, Check, X, Calendar, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Tipos locais
type Client = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
};

type Service = {
  id: string;
  name: string;
  priceInCents: number;
  points: number;
};

type Barber = {
  id: string;
  name: string;
};

export default function LancamentoPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const barbershopId = (session?.user as any)?.barbershopId;
  const [mounted, setMounted] = useState(false);

  // Estados de Dados
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  
  // Estados de Seleção
  const [term, setTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedBarberId, setSelectedBarberId] = useState("");
  
  // Estados de Cadastro Rápido
  const [isRegistering, setIsRegistering] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientInstagram, setNewClientInstagram] = useState("");

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  // Carregamento inicial
  useEffect(() => {
    setMounted(true);
    if (barbershopId) {
        getBarbersAndServices(barbershopId).then(data => {
            setServices(data.services.map(s => ({...s, points: s.points || 10})));
            setBarbers(data.barbers);
        });
    }
  }, [barbershopId]);

  // Busca de clientes (debounce simples)
  useEffect(() => {
    if (term.length < 3) {
        setSearchResults([]);
        return;
    }
    const timeout = setTimeout(async () => {
        try {
            const results = await searchClients(term);
            setSearchResults(results as Client[]); // As Client[] pois o prisma retorna tipos compativeis
        } catch (error) {
            console.error(error);
        }
    }, 500);
    return () => clearTimeout(timeout);
  }, [term]);

  const handleRegister = async () => {
      if(!newClientName || !newClientPhone) {
          toast.error("Nome e Telefone são obrigatórios");
          return;
      }
      
      const res = await quickRegister({
          name: newClientName,
          phone: newClientPhone,
          instagram: newClientInstagram || undefined
      });

      if (res.error) {
          toast.error(res.error);
      } else if (res.user) {
          toast.success("Cliente cadastrado!");
          setSelectedClient(res.user as any); // Cast for safety
          setIsRegistering(false);
          setTerm("");
          setSearchResults([]);
          // Limpar form
          setNewClientName("");
          setNewClientPhone("");
          setNewClientInstagram("");
      }
  };

  const handleLaunch = async () => {
      if (!selectedClient || !selectedServiceId || !selectedBarberId || !barbershopId) return;

      const confirm = window.confirm(`Confirmar lançamento para ${selectedClient.name}?`);
      if (!confirm) return;

      const res = await launchService({
          userId: selectedClient.id,
          barbershopId,
          serviceId: selectedServiceId,
          barberId: selectedBarberId,
          date: new Date() // Lança como agora
      });

      if (res.success) {
          toast.success("Serviço lançado e pontuação creditada!");
          // Reset parcial
          setSelectedServiceId("");
          setSelectedBarberId("");
          // Podemos querer manter o cliente selecionado para lançar outro serviço, ou limpar.
          // Vamos manter por conveniência, mas daremos opção de limpar.
      } else {
          toast.error(res.error || "Erro ao lançar");
      }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-10 font-sans max-w-7xl mx-auto">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-8">
            Balcão de <span className="text-brand-primary">Lançamento</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* COLUNA DA ESQUERDA: CLIENTE */}
            <div className="flex flex-col gap-6">
                <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-xl">
                    <h2 className="text-xl font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                        <UserIcon className="text-brand-primary" />
                        Cliente
                    </h2>
                    
                    {selectedClient ? (
                        <div className="bg-brand-primary/10 border border-brand-primary/20 p-6 rounded-2xl flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black uppercase text-brand-primary">{selectedClient.name}</h3>
                                <p className="text-sm font-bold opacity-70">{selectedClient.phone || "Sem telefone"}</p>
                                <p className="text-xs opacity-50">{selectedClient.email && !selectedClient.email.includes("@sememail.com") ? selectedClient.email : "Instagram: " + ((selectedClient as any).instagram || "Não informado")}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedClient(null)}
                                className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors"
                            >
                                <X />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {!isRegistering ? (
                                <>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <input 
                                            type="text" 
                                            placeholder="Buscar por nome, telefone ou email..."
                                            className="w-full bg-muted/50 border border-border pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-brand-primary transition-all font-bold uppercase text-sm"
                                            value={term}
                                            onChange={(e) => setTerm(e.target.value)}
                                        />
                                    </div>

                                    {searchResults.length > 0 && (
                                        <div className="flex flex-col gap-2 mt-2">
                                            {searchResults.map(client => (
                                                <button
                                                    key={client.id}
                                                    onClick={() => {
                                                        setSelectedClient(client);
                                                        setTerm("");
                                                    }}
                                                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted transition-colors text-left"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold">
                                                        {client.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold uppercase text-sm">{client.name}</p>
                                                        <p className="text-xs text-muted-foreground">{client.phone}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {term.length > 2 && searchResults.length === 0 && (
                                        <div className="text-center py-6 text-muted-foreground text-sm">
                                            Nenhum cliente encontrado.
                                        </div>
                                    )}

                                    <button 
                                        onClick={() => setIsRegistering(true)}
                                        className="mt-4 py-4 border-2 border-dashed border-muted-foreground/30 rounded-2xl text-muted-foreground hover:border-brand-primary hover:text-brand-primary transition-all flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs"
                                    >
                                        <UserPlus size={18} />
                                        Novo Cliente
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
                                    <h3 className="font-black uppercase text-sm text-brand-primary">Novo Cadastro</h3>
                                    <input 
                                        placeholder="Nome Completo *"
                                        className="p-4 bg-muted/50 rounded-xl border border-border outline-none focus:border-brand-primary uppercase font-bold text-sm"
                                        value={newClientName}
                                        onChange={(e) => setNewClientName(e.target.value)}
                                    />
                                    <input 
                                        placeholder="Telefone (WhatsApp) *"
                                        className="p-4 bg-muted/50 rounded-xl border border-border outline-none focus:border-brand-primary uppercase font-bold text-sm"
                                        value={newClientPhone}
                                        onChange={(e) => setNewClientPhone(formatPhone(e.target.value))}
                                        maxLength={15}
                                    />
                                    <input 
                                        placeholder="Instagram (Ex: @cliente)"
                                        className="p-4 bg-muted/50 rounded-xl border border-border outline-none focus:border-brand-primary font-bold text-sm"
                                        value={newClientInstagram}
                                        onChange={(e) => setNewClientInstagram(e.target.value)}
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button 
                                            onClick={() => setIsRegistering(false)}
                                            className="flex-1 py-3 rounded-xl border border-border hover:bg-muted font-black uppercase text-xs"
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            onClick={handleRegister}
                                            className="flex-1 py-3 rounded-xl bg-brand-primary text-black font-black uppercase text-xs hover:brightness-110"
                                        >
                                            Cadastrar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* COLUNA DA DIREITA: SERVIÇO */}
            <div className={`flex flex-col gap-6 transition-all ${!selectedClient ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                 <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-xl">
                    <h2 className="text-xl font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Scissors className="text-brand-primary" />
                        Serviço & Profissional
                    </h2>

                    <div className="flex flex-col gap-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Selecione o Serviço</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {services.map(service => (
                                    <button
                                        key={service.id}
                                        onClick={() => setSelectedServiceId(service.id)}
                                        className={`p-4 rounded-xl border text-left transition-all ${selectedServiceId === service.id ? 'bg-brand-primary border-brand-primary text-black' : 'bg-muted/30 border-border hover:border-brand-primary/50'}`}
                                    >
                                        <div className="font-black uppercase text-sm">{service.name}</div>
                                        <div className="text-xs opacity-70">R$ {(service.priceInCents/100).toFixed(2)} • {service.points} pts</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Selecione o Profissional</label>
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                {barbers.map(barber => (
                                    <button
                                        key={barber.id}
                                        onClick={() => setSelectedBarberId(barber.id)}
                                        className={`min-w-[120px] p-4 rounded-xl border text-center transition-all ${selectedBarberId === barber.id ? 'bg-brand-primary border-brand-primary text-black' : 'bg-muted/30 border-border hover:border-brand-primary/50'}`}
                                    >
                                        <div className="font-black uppercase text-sm truncate">{barber.name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleLaunch}
                            disabled={!selectedClient || !selectedServiceId || !selectedBarberId}
                            className="w-full py-5 rounded-2xl bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black italic uppercase tracking-widest text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 mt-4"
                        >
                            <Check size={24} />
                            Concluir Lançamento
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
