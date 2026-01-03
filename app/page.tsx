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

import { getDashboardMetrics, getRevenueMix, getOccupancyHeatmap, DashboardMetrics } from "./barbearia/_actions/analytics";
import { KPIGrid } from "./components/analytics/KPIGrid";
import { RevenueMixChart } from "./components/analytics/RevenueMixChart";
import { OccupancyHeatmap } from "./components/analytics/OccupancyHeatmap";
import { seedMockData } from "./barbearia/_actions/seed-data"; 
import { toast } from "sonner";

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
  
  // Analytics States
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [revenueMix, setRevenueMix] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

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

  // Busca dados de Analytics
  useEffect(() => {
    async function loadAnalytics() {
      if (!barbershopId) return;
      try {
        const [m, mix, heat] = await Promise.all([
            getDashboardMetrics(barbershopId),
            getRevenueMix(barbershopId),
            getOccupancyHeatmap(barbershopId)
        ]);
        setMetrics(m);
        setRevenueMix(mix);
        setHeatmapData(heat);
      } catch (error) {
        console.error("Failed to load analytics", error);
      } finally {
        setAnalyticsLoading(false);
      }
    }
    loadAnalytics();
  }, [barbershopId]);

  if (!mounted) return <div className="min-h-screen bg-gray-100 dark:bg-[#0a0a0a]" />;

  const missingGoal = Math.max(financeData.dailyGoal - financeData.income, 0);
  const goalPercent = Math.min((financeData.income / financeData.dailyGoal) * 100, 100);

  return (
    <div className="min-h-screen bg-black/95 text-zinc-100 font-sans relative selection:bg-yellow-500/30">
        {/* Background Image & Overlay */}
        <div className="fixed inset-0 z-0">
            <div className="absolute inset-0 bg-black/80 z-10" />
            <img 
                src="https://4kwallpapers.com/images/wallpapers/dark-background-abstract-background-network-3d-background-8192x5464-8324.jpg" 
                alt="Background" 
                className="w-full h-full object-cover opacity-40"
            />
        </div>

      <div className="relative z-10 flex flex-col min-h-screen">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-800 p-6 sm:p-8 bg-black/50 backdrop-blur-md gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 w-full">
                {/* LOGO (Mobile vs Desktop) */}
                <img src="/logo.png" alt="Barber Maps Logo" className="hidden sm:block h-28 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300" />
                
                <div className="flex sm:hidden items-center gap-2">
                   <MapPin className="text-yellow-500" size={24} fill="currentColor" />
                   <span className="text-2xl font-black text-yellow-500 uppercase tracking-tighter">Barber Maps</span>
                </div>
                
                <div className="flex flex-col justify-center h-full pt-2 sm:pt-4 w-full">
                   <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Painel Gerencial</span>
                   <h1 className="text-lg sm:text-xl font-black text-white tracking-tighter uppercase border-l-4 border-yellow-500 pl-4 py-1 truncate">
                     {session?.user?.name?.split(' ')[0] || "Mestre"} <span className="text-yellow-500">Barber</span>
                   </h1>
                </div>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
               <ThemeToggle />
            </div>
          </header>
    
          <AgendamentosTicker 
            barbershopId={barbershopId} 
            selectedDate={selectedDate} 
          />
    
          <main className="p-4 sm:p-8 space-y-8 flex-1">
             
             {/* SECTION: SMART INSIGHTS (Novo) */}
             <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-yellow-500" size={18} />
                        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Smart Insights</h2>
                    </div>
                    
                    {/* Botão de Simulação Temporário */}
                    <button 
                        onClick={async () => {
                            if(!confirm("Gerar dados de teste? Isso criará agendamentos passados.")) return;
                            const toastId = toast.loading("Gerando dados...");
                            try {
                                await seedMockData(barbershopId);
                                toast.success("Dados gerados! Recarregando...", { id: toastId });
                                window.location.reload();
                            } catch(e) {
                                toast.error("Erro ao gerar dados", { id: toastId });
                            }
                        }}
                        className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-lg shadow-yellow-500/20"
                    >
                        <Zap size={14} fill="black" />
                        SIMULAR DADOS
                    </button>
                 </div>
                 
                 {analyticsLoading ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                         {[1,2,3,4].map(i => <div key={i} className="h-32 bg-zinc-900/50 animate-pulse rounded-2xl" />)}
                     </div>
                 ) : metrics ? (
                     <KPIGrid metrics={metrics} />
                 ) : null}
    
                 {!analyticsLoading && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-[400px]">
                           <RevenueMixChart data={revenueMix} />
                        </div>
                        <div className="h-[400px]">
                           <OccupancyHeatmap data={heatmapData} />
                        </div>
                    </div>
                 )}
             </div>

             <div className="h-px bg-zinc-800 w-full" />
    
             {/* SECTION: OPERACIONAL */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
               {/* CARD ESTOQUE */}
               <Link href="/estoque" className="block group">
                 <div 
                   className={`relative overflow-hidden bg-zinc-900/60 border transition-all duration-500 hover:scale-[1.02] active:scale-95 p-6 rounded-[2rem] cursor-pointer h-full hover:shadow-xl ${
                     estoqueCritico ? 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-zinc-800'
                   }`}
                 >
                   {estoqueCritico && <div className="absolute inset-0 bg-red-500/5 blur-[40px] animate-pulse" />}
                   <div className="relative z-10">
                     <div className="flex justify-between items-start mb-4">
                       <div className={`p-3 rounded-2xl bg-black/50 border border-zinc-800 transition-all duration-500 ${estoqueCritico ? 'text-red-500 border-red-500/30' : 'text-blue-500'}`}>
                         <Package size={24} className={estoqueCritico ? 'animate-bounce' : 'group-hover:-rotate-12'} />
                       </div>
                       {estoqueCritico ? (
                         <span className="text-[9px] font-black uppercase bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse shadow-lg shadow-red-500/20">Reposição Urgente</span>
                       ) : (
                         <div className="bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-full">
                            <span className="text-[9px] text-blue-400 font-black uppercase">Controle</span>
                         </div>
                       )}
                     </div>
                     <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-1">Gerenciador de Estoque</p>
                     <h3 className="text-3xl font-black text-white italic tracking-tight">{estoqueCritico ? "Atenção" : "Em Dia"}</h3>
                     <div className="flex items-center gap-2 mt-4">
                       <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                         <div className={`h-full transition-all duration-1000 ${estoqueCritico ? 'w-[15%] bg-red-500' : 'w-[90%] bg-blue-500'}`} />
                       </div>
                       <span className={`text-[10px] font-bold ${estoqueCritico ? 'text-red-500' : 'text-zinc-500'}`}>{estoqueCritico ? "Crítico" : "Status"}</span>
                     </div>
                   </div>
                 </div>
               </Link>
    
               {/* CARD GALERIA DE ESTILOS */}
               <Link href="/galeria-estilos" className="block group">
                 <div className="relative overflow-hidden bg-zinc-900/60 border border-zinc-800 p-6 rounded-[2rem] transition-all duration-500 hover:scale-[1.02] active:scale-95 h-full group hover:shadow-xl">
                   <div className="absolute inset-0 bg-purple-500/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                   
                   <div className="relative z-10">
                     <div className="flex justify-between items-start mb-4">
                       <div className="p-3 rounded-2xl bg-black/50 border border-zinc-800 text-purple-500 transition-all duration-500 group-hover:rotate-12 group-hover:border-purple-500/30">
                         <Sparkles size={24} />
                       </div>
                       <div className="bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-full animate-pulse">
                          <span className="text-[9px] text-purple-400 font-black uppercase">Novo Recurso</span>
                       </div>
                     </div>
    
                     <h3 className="text-zinc-500 mb-1 font-bold uppercase text-[10px] tracking-widest">Inspiração IA</h3>
                     <p className="text-3xl font-black text-white italic group-hover:text-purple-400 transition-colors">Galeria de Estilos</p>
                     
                     <div className="flex items-center gap-2 mt-4">
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                           <div className="h-full w-[100%] bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
                        </div>
                        <span className="text-[10px] font-bold text-purple-500">Generativa</span>
                     </div>
                   </div>
                 </div>
               </Link>
             </div>
    
             {/* TIMELINE RADAR */}
             <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-4 sm:p-8 backdrop-blur-sm">
               <h2 className="text-2xl font-black italic uppercase mb-8 text-white">Timeline <span className="text-yellow-500">Radar</span></h2>
               <AppointmentsList 
                 barbershopId={barbershopId} 
                 selectedDate={selectedDate}
                 onDateChange={setSelectedDate}
               />
             </div>
          </main>
      </div>
    </div>
  );
}