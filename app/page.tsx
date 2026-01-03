"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { TrendingUp, DollarSign, Timer, Package, Zap, ArrowRight, Sparkles, Store, MapPin } from "lucide-react";
// Importações das actions
import { getStockItems } from "./barbearia/_actions/stock"; 
import { getDailySummary } from "./barbearia/_actions/finance";

const AppointmentsList = dynamic(() => import('@/app/components/AppointmentsList'), { ssr: false });
const AgendamentosTicker = dynamic(() => import('@/app/components/AgendamentosTicker'), { ssr: false });
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";

export default function AdminDashboard() {
  const { data: session } = useSession();
  // Estado para a data selecionada (compartilhado entre Ticker e Lista)
  // Inicializa com a data LOCAL (evita problemas de fuso horário onde UTC já é amanhã)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  
  const [financeData, setFinanceData] = useState({ income: 0, dailyGoal: 500 });
  const [mounted, setMounted] = useState(false);
  const [stockItems, setStockItems] = useState<any[]>([]);

  // Lógica de alerta baseada nos dados do banco
  const estoqueCritico = stockItems.some(item => item.quantity <= item.minQuantity);
  const barbershopId = (session?.user as any)?.barbershopId;

  const loadDashboardData = async () => {
    if (!barbershopId) return;
    
    // 1. Estoque
    const stockRes = await getStockItems(barbershopId);
    if (stockRes.success) setStockItems(stockRes.items);

    // 2. Financeiro (Hoje)
    const today = new Date();
    const financeRes = await getDailySummary(barbershopId, today);
    if (financeRes.success && financeRes.summary) {
      setFinanceData({
        income: Number(financeRes.summary.income),
        dailyGoal: Number(financeRes.summary.dailyGoal || 500)
      });
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (barbershopId) {
      loadDashboardData();
    }
  }, [barbershopId]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  const missingGoal = Math.max(financeData.dailyGoal - financeData.income, 0);
  const userFirstName = session?.user?.name ? session.user.name.split(' ')[0] : "Mestre";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative selection:bg-brand-primary/30 transition-colors duration-500">
        {/* Background Image & Overlay (Different per theme) */}
        <div className="fixed inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-background/80 dark:bg-background/90 pro:bg-background/95 z-10" />
            
            {/* Dark/Light BG */}
            <img 
                src="https://4kwallpapers.com/images/wallpapers/dark-background-abstract-background-network-3d-background-8192x5464-8324.jpg" 
                alt="Background" 
                className="w-full h-full object-cover opacity-20 dark:opacity-40 pro:hidden"
            />
            
            {/* Pro BG (Digital lines/grid) */}
            <div className="hidden pro:block absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.05),transparent_70%)]" />
            <div className="hidden pro:block absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

      <div className="relative z-10 flex flex-col min-h-screen">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border p-6 sm:p-8 bg-card/50 backdrop-blur-md gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 w-full">
                {/* LOGO (Mobile vs Desktop) */}
                <img src="/logo.png" alt="Barber Maps Logo" className="hidden sm:block h-28 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300" />
                
                <div className="flex sm:hidden items-center gap-2">
                   <MapPin className="text-brand-primary" size={24} fill="currentColor" />
                   <span className="text-2xl font-black text-brand-primary uppercase tracking-tighter">Barber Maps</span>
                </div>
                
                <div className="flex flex-col justify-center h-full pt-2 sm:pt-4 w-full">
                   <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Painel Gerencial</span>
                   <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tighter uppercase border-l-4 border-brand-primary pl-4 py-1 truncate">
                     {userFirstName} <span className="text-brand-primary italic">Barber</span>
                   </h1>
                </div>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
               <ThemeToggle />
            </div>
          </header>
    
          <ErrorBoundary>
            <AgendamentosTicker 
                barbershopId={barbershopId} 
                selectedDate={selectedDate} 
            />
          </ErrorBoundary>
    
          <main className="p-4 sm:p-8 space-y-8 flex-1">
             
             <ErrorBoundary>
                {/* SECTION: OPERACIONAL */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* CARD INSIGHTS (Novo) */}
                <Link href="/insights" className="block group">
                    <div className="relative overflow-hidden bg-card border border-border p-6 rounded-[2rem] transition-all duration-500 hover:scale-[1.02] active:scale-95 h-full group hover:shadow-xl hover:border-brand-primary/30 shadow-sm">
                    <div className="absolute inset-0 bg-brand-primary/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-background/50 border border-border text-brand-primary transition-all duration-500 group-hover:rotate-12 group-hover:border-brand-primary/30">
                            <Sparkles size={24} />
                        </div>
                        <div className="bg-brand-primary/10 border border-brand-primary/20 px-2 py-1 rounded-full">
                            <span className="text-[9px] text-brand-primary font-black uppercase tracking-widest">Analytics</span>
                        </div>
                        </div>

                        <h3 className="text-muted-foreground mb-1 font-bold uppercase text-[10px] tracking-widest">Inteligência Estratégica</h3>
                        <p className="text-3xl font-black text-foreground italic group-hover:text-brand-primary transition-colors">Insights</p>
                        
                        <div className="flex items-center gap-2 mt-4 text-muted-foreground group-hover:text-brand-primary transition-colors">
                            <span className="text-[10px] font-bold uppercase tracking-widest">Acessar Métricas</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                    </div>
                </Link>

                {/* CARD FINANCEIRO / CAIXA */}
                <Link href="/financeiro" className="block group">
                    <div className="relative overflow-hidden bg-card border border-border p-6 rounded-[2rem] transition-all duration-500 hover:scale-[1.02] active:scale-95 h-full group hover:shadow-xl hover:border-green-500/30 shadow-sm">
                    <div className="absolute inset-0 bg-green-500/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-background/50 border border-border text-green-500 transition-all duration-500 group-hover:rotate-12 group-hover:border-green-500/30">
                            <DollarSign size={24} />
                        </div>
                        <div className="bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full">
                            <span className="text-[9px] text-green-500 font-black uppercase tracking-widest">Caixa</span>
                        </div>
                        </div>

                        <h3 className="text-muted-foreground mb-1 font-bold uppercase text-[10px] tracking-widest">Gestão de Vendas</h3>
                        <p className="text-3xl font-black text-foreground italic group-hover:text-green-500 transition-colors">Financeiro</p>
                        
                        <div className="flex items-center gap-2 mt-4 text-muted-foreground group-hover:text-green-500 transition-colors">
                            <span className="text-[10px] font-bold uppercase tracking-widest">Fluxo de Caixa</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                    </div>
                </Link>

                {/* CARD ESTOQUE */}
                <Link href="/estoque" className="block group">
                    <div 
                    className={`relative overflow-hidden bg-card border transition-all duration-500 hover:scale-[1.02] active:scale-95 p-6 rounded-[2rem] cursor-pointer h-full hover:shadow-xl shadow-sm ${
                        estoqueCritico ? 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-border'
                    }`}
                    >
                    {estoqueCritico && <div className="absolute inset-0 bg-red-500/5 blur-[40px] animate-pulse" />}
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-2xl bg-background/50 border border-border transition-all duration-500 ${estoqueCritico ? 'text-red-500 border-red-500/30' : 'text-blue-500'}`}>
                            <Package size={24} className={estoqueCritico ? 'animate-bounce' : 'group-hover:-rotate-12'} />
                        </div>
                        {estoqueCritico ? (
                            <span className="text-[9px] font-black uppercase bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse shadow-lg shadow-red-500/20">Reposição Urgente</span>
                        ) : (
                            <div className="bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-full">
                            <span className="text-[9px] text-blue-400 font-black uppercase tracking-widest">Controle</span>
                            </div>
                        )}
                        </div>
                        <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest mb-1">Gerenciador de Estoque</p>
                        <h3 className="text-3xl font-black text-foreground italic tracking-tight">{estoqueCritico ? "Atenção" : "Em Dia"}</h3>
                        <div className="flex items-center gap-2 mt-4">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-1000 ${estoqueCritico ? 'w-[15%] bg-red-500' : 'w-[90%] bg-blue-500'}`} />
                        </div>
                        <span className={`text-[10px] font-bold ${estoqueCritico ? 'text-red-500' : 'text-muted-foreground'}`}>{estoqueCritico ? "Crítico" : "Status"}</span>
                        </div>
                    </div>
                    </div>
                </Link>
        
                {/* CARD GALERIA DE ESTILOS */}
                <Link href="/galeria-estilos" className="block group">
                    <div className="relative overflow-hidden bg-card border border-border p-6 rounded-[2rem] transition-all duration-500 hover:scale-[1.02] active:scale-95 h-full group hover:shadow-xl shadow-sm">
                    <div className="absolute inset-0 bg-purple-500/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-background/50 border border-border text-purple-500 transition-all duration-500 group-hover:rotate-12 group-hover:border-purple-500/30">
                            <Sparkles size={24} />
                        </div>
                        <div className="bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-full animate-pulse">
                            <span className="text-[9px] text-purple-400 font-black uppercase tracking-widest">Novo Recurso</span>
                        </div>
                        </div>
        
                        <h3 className="text-muted-foreground mb-1 font-bold uppercase text-[10px] tracking-widest">Inspiração IA</h3>
                        <p className="text-3xl font-black text-foreground italic group-hover:text-purple-400 transition-colors">Galeria de Estilos</p>
                        
                        <div className="flex items-center gap-2 mt-4">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full w-[100%] bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
                            </div>
                            <span className="text-[10px] font-bold text-purple-500">Generativa</span>
                        </div>
                    </div>
                    </div>
                </Link>
                </div>
             </ErrorBoundary>
    
             {/* TIMELINE RADAR */}
             <div className="bg-card/40 border border-border rounded-[2.5rem] p-4 sm:p-8 backdrop-blur-sm shadow-sm">
               <h2 className="text-2xl font-black italic uppercase mb-8 text-foreground">Timeline <span className="text-brand-primary">Radar</span></h2>
               <ErrorBoundary>
                <AppointmentsList 
                    barbershopId={barbershopId} 
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                />
               </ErrorBoundary>
             </div>
          </main>
      </div>
    </div>
  );
}
