"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  User, 
  ChevronRight, 
  Search,
  Filter,
  ArrowLeft,
  TrendingUp,
  Sparkles,
  Scissors,
  X
} from "lucide-react";
import Link from "next/link";
import { getBookings } from "@/app/barbearia/_actions/get-bookings";
import { cancelBooking } from "@/app/barbearia/_actions/cancel-booking";
import { toast } from "sonner";

export default function AgendaPage() {
  const { data: session } = useSession();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const barbershopId = (session?.user as any)?.barbershopId;
  const isPro = theme === 'pro';

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadBookings = async () => {
    if (!barbershopId) return;
    setLoading(true);
    try {
      // Fetching for a wide range or just current to demonstrate
      const today = new Date().toISOString().split('T')[0];
      const res = await getBookings(barbershopId, today);
      if (res) {
        // In a real scenario, we might want to fetch more or have a specific action for 'all history'
        // For now, we use the available getBookings and filter for completed
        setBookings(res);
      }
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (barbershopId) loadBookings();
  }, [barbershopId]);

  if (!mounted) return null;

  const completedBookings = bookings.filter(b => 
    b.status === 'realizado' && 
    (b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     b.serviceName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={`min-h-screen bg-background text-foreground font-sans relative transition-all duration-500 ${isPro ? 'md:pl-64' : ''}`}>
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-40 pro:opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--brand-primary),transparent_50%)] opacity-10" />
      </div>

      <div className="relative z-10 p-4 sm:p-10 max-w-7xl mx-auto">
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex flex-col gap-4">
             <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-brand-primary transition-colors text-xs font-black uppercase tracking-[0.2em] group">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Voltar ao Painel
             </Link>
             <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-[2rem] bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
                  <Calendar className="text-brand-primary" size={32} />
                </div>
                <div>
                   <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                      Agenda <span className="text-brand-primary">Histórico</span>
                   </h1>
                   <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] mt-2">Agendamentos Realizados e Concluídos</p>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  type="text" 
                  placeholder="Pesquisar cliente ou serviço..."
                  className="bg-card/50 border border-border pl-12 pr-6 py-4 rounded-2xl w-full md:w-80 outline-none focus:border-brand-primary transition-all text-sm font-bold uppercase tracking-widest placeholder:opacity-50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button className="p-4 bg-muted hover:bg-muted/80 rounded-2xl transition-colors md:block hidden">
                <Filter size={20} className="text-foreground" />
             </button>
          </div>
        </div>

        {/* STATS SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
           <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-xl pro:border-brand-primary/10 group hover:border-brand-primary/30 transition-all">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground block mb-2">Total Realizados</span>
              <div className="flex items-end gap-3">
                 <span className="text-5xl font-black italic text-foreground leading-none">{completedBookings.length}</span>
                 <CheckCircle2 className="text-green-500 mb-1" size={24} />
              </div>
           </div>
           
           <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-xl pro:border-brand-primary/10 group hover:border-brand-primary/30 transition-all">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground block mb-2">Este Mês</span>
              <div className="flex items-end gap-3">
                 <span className="text-5xl font-black italic text-foreground leading-none">--</span>
                 <TrendingUp className="text-brand-primary mb-1" size={24} />
              </div>
           </div>

           <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-xl pro:border-brand-primary/10 group hover:border-brand-primary/30 transition-all">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground block mb-2">Satisfação Média</span>
              <div className="flex items-end gap-3">
                 <span className="text-5xl font-black italic text-foreground leading-none">98%</span>
                 <Sparkles className="text-yellow-500 mb-1" size={24} />
              </div>
           </div>
        </div>

        {/* LIST AREA */}
        <div className="bg-card/30 backdrop-blur-xl border border-border rounded-[3.5rem] p-4 sm:p-10 shadow-2xl">
          <div className="flex items-center justify-between mb-8 px-4">
             <h3 className="text-xl font-black italic uppercase text-foreground">Registros Recentes</h3>
             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-brand-primary tracking-widest bg-brand-primary/10 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
                Live Hub
             </div>
          </div>

          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-50">
                 <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-4" />
                 <span className="text-xs font-black uppercase tracking-widest">Sincronizando Banco de Dados...</span>
              </div>
            ) : completedBookings.length > 0 ? (
              completedBookings.map((booking, index) => (
                <div 
                  key={booking.id}
                  className="bg-card border border-border/50 p-6 sm:p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 hover:border-brand-primary/40 transition-all group cursor-pointer hover:scale-[1.01] hover:shadow-2xl"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-[1.8rem] bg-muted flex items-center justify-center overflow-hidden border border-border group-hover:border-brand-primary/20 transition-colors">
                        <User className="text-muted-foreground/50" size={36} />
                        <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1.5 rounded-xl border-4 border-card">
                         <CheckCircle2 size={12} />
                      </div>
                    </div>
                    
                    <div className="flex flex-col">
                      <h4 className="text-lg font-black text-foreground uppercase tracking-tight group-hover:text-brand-primary transition-colors">{booking.clientName}</h4>
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Scissors size={14} className="text-brand-primary" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{booking.serviceName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{booking.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full md:w-auto md:gap-12 pl-4 border-l border-border md:border-l-0">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Status</span>
                      <div className="bg-green-500/10 text-green-500 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-green-500/20">
                        Realizado
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Valor</span>
                      <span className="text-xl font-black italic text-foreground">R$ --</span>
                    </div>

                    </div>

                    <div className="flex items-center gap-2">
                         {booking.status !== 'realizado' && booking.status !== 'cancelado' && (
                             <button 
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if(!confirm("Deseja realmente cancelar este agendamento?")) return;
                                    
                                    const res = await cancelBooking(booking.id);
                                    if(res.success) {
                                        toast.success("Agendamento cancelado!");
                                        loadBookings();
                                    } else {
                                        toast.error("Erro ao cancelar.");
                                    }
                                }}
                                className="p-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all group/cancel"
                             >
                                <X size={20} />
                             </button>
                         )}
                         <div className="p-4 rounded-2xl bg-muted/50 text-muted-foreground group-hover:bg-brand-primary group-hover:text-primary-foreground transition-all">
                             <ChevronRight size={20} />
                         </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-32 rounded-[3rem] border-4 border-dashed border-muted/20">
                 <Calendar className="text-muted/20 mb-6" size={80} />
                 <h4 className="text-xl font-black italic uppercase text-muted-foreground/30">Nenhum Registro Encontrado</h4>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/20 mt-2">Tente ajustar sua busca ou filtros</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER ACTION */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 md:hidden">
         <button className="bg-brand-primary text-primary-foreground px-10 py-5 rounded-[2rem] font-black italic uppercase tracking-widest shadow-2xl shadow-brand-primary/40 flex items-center gap-4 active:scale-95 transition-transform">
            <Filter size={20} />
            Filtros
         </button>
      </div>
    </div>
  );
}
