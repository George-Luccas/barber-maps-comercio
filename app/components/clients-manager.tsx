"use client";

import { useState, useEffect } from "react";
import { getClients } from "@/app/clientes/_actions/client-actions";
import { quickRegister } from "@/app/barbearia/lancamento/_actions/launch-actions";
import { Loader2, Search, UserPlus, X, Check } from "lucide-react";
import { toast } from "sonner";

export default function ClientsManager() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState("");
  
  // Estados de Cadastro
  const [isRegistering, setIsRegistering] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientInstagram, setNewClientInstagram] = useState("");

  const loadClients = async () => {
    setLoading(true);
    const res = await getClients();
    if (res.success && res.clients) {
      setClients(res.clients);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(term.toLowerCase()) || 
    c.phone.includes(term) ||
    (c.instagram && c.instagram.toLowerCase().includes(term.toLowerCase()))
  );

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const handleRegister = async () => {
    if(!newClientName || !newClientPhone) {
        toast.error("Nome e Telefone são obrigatórios");
        return;
    }
    
    // Otimista: Feedback imediato
    const loadingToast = toast.loading("Cadastrando...");

    const res = await quickRegister({
        name: newClientName,
        phone: newClientPhone,
        instagram: newClientInstagram || undefined
    });

    toast.dismiss(loadingToast);

    if (res.error) {
        toast.error(res.error);
    } else if (res.user) {
        toast.success("Cliente cadastrado!");
        setIsRegistering(false);
        // Limpar form
        setNewClientName("");
        setNewClientPhone("");
        setNewClientInstagram("");
        // Recarregar lista
        loadClients();
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();



  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border p-6 rounded-[2rem] shadow-sm">
        <div>
            <h2 className="text-xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                <Search className="text-brand-primary" size={20} />
                Gestão de Clientes
            </h2>
            <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mt-1">
                {clients.length} Clientes Cadastrados
            </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
             <button 
                onClick={() => setIsRegistering(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand-primary text-black px-4 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform"
            >
                <UserPlus size={16} />
                Novo Cliente
            </button>
        </div>
      </div>

      {/* NEW CLIENT FORM (MODAL-LIKE INLINE) */}
      {isRegistering && (
          <div className="bg-muted/30 border border-brand-primary/30 p-6 rounded-[2rem] animate-in slide-in-from-top-4">
               <div className="flex justify-between items-center mb-4">
                   <h3 className="font-black uppercase text-sm text-brand-primary flex items-center gap-2">
                       <UserPlus size={18} /> Novo Cadastro
                   </h3>
                   <button onClick={() => setIsRegistering(false)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-full">
                       <X size={18} />
                   </button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                        placeholder="Nome Completo *"
                        className="p-4 bg-card rounded-xl border border-border outline-none focus:border-brand-primary uppercase font-bold text-xs"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                    />
                    <input 
                        placeholder="Telefone (WhatsApp) *"
                        className="p-4 bg-card rounded-xl border border-border outline-none focus:border-brand-primary uppercase font-bold text-xs"
                        value={newClientPhone}
                        onChange={(e) => setNewClientPhone(formatPhone(e.target.value))}
                        maxLength={15}
                    />
                    <input 
                        placeholder="Instagram (Ex: @cliente)"
                        className="p-4 bg-card rounded-xl border border-border outline-none focus:border-brand-primary font-bold text-xs"
                        value={newClientInstagram}
                        onChange={(e) => setNewClientInstagram(e.target.value)}
                    />
               </div>
               
               <div className="flex justify-end mt-4">
                   <button 
                        onClick={handleRegister}
                        className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-green-500/20 hover:scale-105 transition-transform"
                    >
                        <Check size={16} />
                        Salvar Cadastro
                   </button>
               </div>
          </div>
      )}

      {/* SEARCH AND LIST */}
      <div className="bg-card border border-border rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
         <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
                type="text"
                placeholder="Buscar por nome, telefone ou instagram..."
                className="w-full bg-muted/30 border border-border pl-12 pr-4 py-4 rounded-xl outline-none focus:border-brand-primary transition-all font-bold uppercase text-xs"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
            />
         </div>

         {loading ? (
             <div className="flex justify-center py-20">
                 <Loader2 className="animate-spin text-brand-primary" size={40} />
             </div>
         ) : (
             <div className="overflow-x-auto">
                 <table className="w-full text-left">
                     <thead>
                         <tr className="border-b border-border/50 text-muted-foreground text-[9px] uppercase font-black tracking-widest">
                             <th className="pb-4 pl-4">Cliente</th>
                             <th className="pb-4">Contato</th>
                             <th className="pb-4">Nível</th>
                             <th className="pb-4 text-center">Cortes</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-border/30">
                         {filteredClients.length === 0 ? (
                             <tr>
                                 <td colSpan={4} className="py-8 text-center text-muted-foreground font-bold uppercase text-xs">
                                     Nenhum cliente encontrado.
                                 </td>
                             </tr>
                         ) : (
                             filteredClients.map((client) => (
                                 <tr key={client.id} className="group hover:bg-muted/30 transition-colors">
                                     <td className="py-3 pl-4">
                                         <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-xs">
                                                 {client.name.charAt(0).toUpperCase()}
                                             </div>
                                             <div>
                                                 <p className="font-bold text-xs uppercase">{client.name}</p>
                                                 {client.instagram && <p className="text-[9px] text-brand-primary font-bold">{client.instagram}</p>}
                                             </div>
                                         </div>
                                     </td>
                                     <td className="py-3">
                                         <p className="text-[10px] font-medium text-muted-foreground">{client.phone}</p>
                                     </td>
                                     <td className="py-3">
                                         <span className={`
                                            px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border
                                            ${client.tier === 'GOLD' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' : 
                                              client.tier === 'SILVER' ? 'bg-gray-300/20 text-gray-300 border-gray-300/30' : 
                                              'bg-orange-700/20 text-orange-700 border-orange-700/30'}
                                         `}>
                                             {client.tier}
                                         </span>
                                     </td>
                                     <td className="py-3 text-center">
                                         <span className="font-black text-sm italic">{client.totalCuts}</span>
                                     </td>
                                 </tr>
                             ))
                         )}
                     </tbody>
                 </table>
             </div>
         )}
      </div>
    </div>
  );
}
