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

export default function AdminDashboard() {
  const { data: session } = useSession();
  // Estado para a data selecionada (compartilhado entre Ticker e Lista)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
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

  if (!mounted) return <div className="min-h-screen bg-gray-100 dark:bg-[#0a0a0a]" />;

  const missingGoal = Math.max(financeData.dailyGoal - financeData.income, 0);
  const goalPercent = Math.min((financeData.income / financeData.dailyGoal) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0a0a0a] text-zinc-900 dark:text-white font-sans relative transition-colors duration-300">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-200 dark:border-zinc-900 p-6 sm:p-8 bg-white/80 dark:bg-black/50 backdrop-blur-md gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 w-full">
            {/* LOGO (Mobile vs Desktop) */}
            <img src="/logo.png" alt="Barber Maps Logo" className="hidden sm:block h-28 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300" />
            
            {/* LOGO ALTERNATIVO MOBILE */}
            <div className="flex sm:hidden items-center gap-2">
               <span className="text-2xl font-black text-yellow-500 uppercase tracking-tighter">Barber Maps</span>
               <MapPin className="text-yellow-500" size={24} fill="currentColor" />
            </div>
            
            <div className="flex flex-col justify-center h-full pt-2 sm:pt-4 w-full">
               <span className="text-zinc-500 dark:text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Painel Gerencial</span>
               <h1 className="text-lg sm:text-xl font-black text-zinc-800 dark:text-zinc-100 tracking-tighter uppercase border-l-4 border-yellow-500 pl-4 py-1 truncate max-w-[250px] sm:max-w-none">
                 {session?.user?.name?.split(' ')[0] || "Visitante"}
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

      <main className="p-8 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* CARD FINANCEIRO */}
          <Link href="/financeiro" className="block group">
            <div className="relative overflow-hidden bg-white/60 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[2rem] transition-all duration-500 hover:scale-[1.02] active:scale-95 h-full shadow-sm dark:shadow-none hover:shadow-xl dark:disk-shadow-none">
              <div className="absolute inset-0 bg-green-500/10 dark:bg-green-500/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-2xl bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 text-green-600 dark:text-green-500 transition-all duration-500 group-hover:rotate-12">
                    <DollarSign size={24} />
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full">
                      <TrendingUp size={14} className="text-green-600 dark:text-green-500" />
                      <span className="text-[9px] text-green-600 dark:text-green-500 font-black uppercase">{goalPercent.toFixed(0)}% da Meta</span>
                  </div>
                </div>
                
                <p className="text-zinc-400 dark:text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-1">Falta para a Meta</p>
                
                <div className="flex items-baseline gap-1">
                   {missingGoal > 0 ? (
                      <h3 className="text-4xl font-black text-zinc-900 dark:text-white italic tracking-tight group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        R$ {missingGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </h3>
                   ) : (
                      <h3 className="text-3xl font-black text-green-600 dark:text-green-500 italic tracking-tight animate-pulse">
                        META BATIDA! 🚀
                      </h3>
                   )}
                </div>

                <div className="mt-4 w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-1000" 
                      style={{ width: `${goalPercent}%` }}
                    />
                </div>
              </div>
            </div>
          </Link>

          {/* CARD MINHA BARBEARIA (NOVO) */}
          <Link href="/barbearia" className="block group">
            <div className="relative overflow-hidden bg-white/60 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[2rem] transition-all duration-500 hover:scale-[1.02] active:scale-95 h-full shadow-sm dark:shadow-none hover:shadow-xl">
              <div className="absolute inset-0 bg-yellow-500/10 dark:bg-yellow-500/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-2xl bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 text-yellow-500 transition-all duration-500 group-hover:rotate-12">
                    <Store size={24} />
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-full">
                      <span className="text-[9px] text-yellow-600 dark:text-yellow-500 font-black uppercase">Configurações</span>
                  </div>
                </div>
                
                <p className="text-zinc-400 dark:text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-1">Gestão</p>
                <h3 className="text-3xl font-black text-zinc-900 dark:text-white italic tracking-tight group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">Minha Barbearia</h3>
                
                <div className="flex items-center gap-2 mt-6">
                   <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                      <ArrowRight size={14} className="text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                   </div>
                   <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Acessar Painel</span>
                </div>
              </div>
            </div>
          </Link>

          {/* CARD ESTOQUE */}
          <Link href="/estoque" className="block group">
            <div 
              className={`relative overflow-hidden bg-white/60 dark:bg-zinc-900/40 border transition-all duration-500 hover:scale-[1.02] active:scale-95 p-6 rounded-[2rem] cursor-pointer h-full shadow-sm dark:shadow-none hover:shadow-xl ${
                estoqueCritico ? 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {estoqueCritico && <div className="absolute inset-0 bg-red-500/5 blur-[40px] animate-pulse" />}
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 transition-all duration-500 ${estoqueCritico ? 'text-red-500 border-red-500/30' : 'text-blue-500 dark:text-blue-400'}`}>
                    <Package size={24} className={estoqueCritico ? 'animate-bounce' : 'group-hover:-rotate-12'} />
                  </div>
                  {estoqueCritico ? (
                    <span className="text-[9px] font-black uppercase bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse shadow-lg shadow-red-500/20">Reposição Urgente</span>
                  ) : (
                    <div className="bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-full">
                       <span className="text-[9px] text-blue-600 dark:text-blue-400 font-black uppercase">Controle</span>
                    </div>
                  )}
                </div>
                <p className="text-zinc-400 dark:text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-1">Gerenciador de Estoque</p>
                <h3 className="text-4xl font-black text-zinc-900 dark:text-white italic tracking-tight">{estoqueCritico ? "Atenção" : "Em Dia"}</h3>
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${estoqueCritico ? 'w-[15%] bg-red-500' : 'w-[90%] bg-blue-500 dark:bg-blue-400'}`} />
                  </div>
                  <span className={`text-[10px] font-bold ${estoqueCritico ? 'text-red-500' : 'text-zinc-400 dark:text-zinc-500'}`}>{estoqueCritico ? "Crítico" : "Status"}</span>
                </div>
              </div>
            </div>
          </Link>

          {/* CARD GALERIA DE ESTILOS */}
          <Link href="/galeria-estilos" className="block group">
            <div className="relative overflow-hidden bg-white/60 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[2rem] transition-all duration-500 hover:scale-[1.02] active:scale-95 h-full group shadow-sm dark:shadow-none hover:shadow-xl">
              <div className="absolute inset-0 bg-yellow-500/10 dark:bg-yellow-500/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-2xl bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 text-purple-600 dark:text-purple-500 transition-all duration-500 group-hover:rotate-12 group-hover:border-purple-500/30">
                    <Sparkles size={24} />
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-full animate-pulse">
                     <span className="text-[9px] text-purple-500 dark:text-purple-400 font-black uppercase">Novo Recurso</span>
                  </div>
                </div>

                <h3 className="text-zinc-400 dark:text-zinc-500 mb-1 font-bold uppercase text-[10px] tracking-widest">Inspiração IA</h3>
                <p className="text-3xl font-black text-zinc-900 dark:text-white italic group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Galeria de Estilos</p>
                
                <div className="flex items-center gap-2 mt-4">
                   <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full w-[100%] bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
                   </div>
                   <span className="text-[10px] font-bold text-purple-600 dark:text-purple-500">Generativa</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-10 bg-white/40 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-sm dark:shadow-none">
          <h2 className="text-2xl font-black italic uppercase mb-8 text-zinc-900 dark:text-white">Timeline <span className="text-yellow-500">Radar</span></h2>
          <AppointmentsList 
            barbershopId={barbershopId} 
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>
      </main>
    </div>
  );
}