"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Sparkles, Zap, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Actions
import { getDashboardMetrics, getRevenueMix, getOccupancyHeatmap, DashboardMetrics } from "../barbearia/_actions/analytics";
import { seedMockData } from "../barbearia/_actions/seed-data";

// Components
import { KPIGrid } from "../components/analytics/KPIGrid";
import { RevenueMixChart } from "../components/analytics/RevenueMixChart";
import { OccupancyHeatmap } from "../components/analytics/OccupancyHeatmap";

export default function InsightsPage() {
  const { data: session } = useSession();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [revenueMix, setRevenueMix] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const barbershopId = (session?.user as any)?.barbershopId;

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadAnalytics = async () => {
    if (!barbershopId) return;
    setLoading(true);
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
      toast.error("Erro ao carregar insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (barbershopId) {
      loadAnalytics();
    }
  }, [barbershopId]);

  if (!mounted) return <div className="min-h-screen bg-white dark:bg-black" />;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans relative selection:bg-yellow-500/30 pb-10">
      {/* Background Overlay */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-white/90 dark:bg-black/90 z-10" />
        <img 
          src="https://4kwallpapers.com/images/wallpapers/dark-background-abstract-background-network-3d-background-8192x5464-8324.jpg" 
          alt="Background" 
          className="w-full h-full object-cover opacity-10 dark:opacity-20"
        />
      </div>

      <div className="relative z-10 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-8">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-2">
              <ArrowLeft size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Voltar ao Painel</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 outline-none">
                <Sparkles size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white">Smart <span className="text-yellow-500">Insights</span></h1>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Inteligência de Dados da sua Barbearia</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
                onClick={loadAnalytics}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-all shadow-sm"
            >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                ATUALIZAR
            </button>

            <button 
                onClick={async () => {
                    if(!confirm("Gerar dados de teste? Isso criará agendamentos passados.")) return;
                    const toastId = toast.loading("Gerando dados...");
                    try {
                        await seedMockData(barbershopId);
                        toast.success("Dados gerados!", { id: toastId });
                        loadAnalytics();
                    } catch(e) {
                        toast.error("Erro ao gerar dados", { id: toastId });
                    }
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-yellow-500/20"
            >
                <Zap size={14} fill="black" />
                SIMULAR DADOS
            </button>
          </div>
        </header>

        {/* Content */}
        {loading && !metrics ? (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white dark:bg-zinc-900/50 animate-pulse rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-[400px] bg-white dark:bg-zinc-900/30 animate-pulse rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm" />
                    <div className="h-[400px] bg-white dark:bg-zinc-900/30 animate-pulse rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm" />
                </div>
            </div>
        ) : metrics ? (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <KPIGrid metrics={metrics} />
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[2rem] backdrop-blur-sm shadow-sm">
                       <h3 className="text-zinc-500 dark:text-zinc-400 text-xs font-black uppercase tracking-widest mb-6">Mix de Faturamento</h3>
                       <div className="h-[350px]">
                           <RevenueMixChart data={revenueMix} />
                       </div>
                   </div>
                   
                   <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[2rem] backdrop-blur-sm shadow-sm">
                       <h3 className="text-zinc-500 dark:text-zinc-400 text-xs font-black uppercase tracking-widest mb-6">Mapa de Ocupação</h3>
                       <div className="h-[350px]">
                           <OccupancyHeatmap data={heatmapData} />
                       </div>
                   </div>
               </div>
           </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Zap size={48} className="text-zinc-300 dark:text-zinc-800 mb-4" />
                <h3 className="text-xl font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter">Sem dados para exibir</h3>
                <p className="text-zinc-500 dark:text-zinc-600 text-sm mt-2">Clique em simular dados para popular o painel.</p>
            </div>
        )}
      </div>
    </div>
  );
}

