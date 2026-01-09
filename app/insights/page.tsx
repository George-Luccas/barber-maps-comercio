"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Sparkles, ArrowLeft, RefreshCw, Zap } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Actions
// Actions
import { getDashboardMetrics, getRevenueMix, getOccupancyHeatmap, getBarberPerformance, DashboardMetrics } from "../barbearia/_actions/analytics";

// Components
import { KPIGrid } from "../components/analytics/KPIGrid";
import { RevenueMixChart } from "../components/analytics/RevenueMixChart";
import { BarberPerformanceChart } from "../components/analytics/BarberPerformanceChart";
import { OccupancyHeatmap } from "../components/analytics/OccupancyHeatmap";

export default function InsightsPage() {
  const { data: session } = useSession();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [revenueMix, setRevenueMix] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
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
      const [m, mix, heat, perf] = await Promise.all([
        getDashboardMetrics(barbershopId),
        getRevenueMix(barbershopId),
        getOccupancyHeatmap(barbershopId),
        getBarberPerformance(barbershopId)
      ]);
      setMetrics(m);
      setRevenueMix(mix);
      setHeatmapData(heat);
      setPerformanceData(perf);
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

  if (!mounted) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative selection:bg-brand-primary/30 pb-10 transition-colors duration-500">
      {/* Background Overlay */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-background/90 z-10" />
        
        {/* Dark/Light BG */}
        <img 
          src="https://4kwallpapers.com/images/wallpapers/dark-background-abstract-background-network-3d-background-8192x5464-8324.jpg" 
          alt="Background" 
          className="w-full h-full object-cover opacity-10 dark:opacity-20 pro:hidden"
        />

        {/* Pro BG (Digital lines/grid) */}
        <div className="hidden pro:block absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.05),transparent_70%)]" />
        <div className="hidden pro:block absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-8">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-2">
              <ArrowLeft size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Voltar ao Painel</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary outline-none">
                <Sparkles size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-black italic uppercase tracking-tighter text-foreground italic">Smart <span className="text-brand-primary">Insights</span></h1>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Inteligência de Dados da sua Barbearia</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
                onClick={loadAnalytics}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-card hover:bg-muted text-foreground text-xs font-bold px-4 py-2.5 rounded-xl border border-border transition-all shadow-sm"
            >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                ATUALIZAR
            </button>
          </div>
        </header>

        {/* Content */}
        {loading && !metrics ? (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1,2,3,4].map(i => <div key={i} className="h-32 bg-card animate-pulse rounded-2xl border border-border shadow-sm" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-[400px] bg-card animate-pulse rounded-3xl border border-border shadow-sm" />
                    <div className="h-[400px] bg-card animate-pulse rounded-3xl border border-border shadow-sm" />
                </div>
            </div>
        ) : metrics ? (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <KPIGrid metrics={metrics} />
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   <div className="bg-card border border-border p-6 rounded-[2rem] backdrop-blur-sm shadow-sm">
                       <h3 className="text-muted-foreground text-xs font-black uppercase tracking-widest mb-6">Desempenho da Equipe</h3>
                       <div className="h-[350px]">
                           <BarberPerformanceChart data={performanceData} />
                       </div>
                   </div>

                   <div className="bg-card border border-border p-6 rounded-[2rem] backdrop-blur-sm shadow-sm">
                       <h3 className="text-muted-foreground text-xs font-black uppercase tracking-widest mb-6">Mix de Faturamento</h3>
                       <div className="h-[350px]">
                           <RevenueMixChart data={revenueMix} />
                       </div>
                   </div>
                   
                   <div className="bg-card border border-border p-6 rounded-[2rem] backdrop-blur-sm shadow-sm">
                       <h3 className="text-muted-foreground text-xs font-black uppercase tracking-widest mb-6">Mapa de Ocupação</h3>
                       <div className="h-[350px]">
                           <OccupancyHeatmap data={heatmapData} />
                       </div>
                   </div>
               </div>
           </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Zap size={48} className="text-muted mb-4" />
                <h3 className="text-xl font-bold text-muted-foreground uppercase tracking-tighter">Sem dados para exibir</h3>
                <p className="text-muted-foreground text-sm mt-2">Comece a agendar para visualizar os insights.</p>
            </div>
        )}
      </div>
    </div>
  );
}

