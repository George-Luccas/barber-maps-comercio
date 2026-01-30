"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { TrendingUp, DollarSign, Timer, Package, Zap, ArrowRight, Sparkles, Store, MapPin, AlertCircle, Palette, Calendar, Brain, ChevronRight, X, Truck, Shield, User, Trash2, Users } from "lucide-react";
import { getBookings } from "@/app/barbearia/_actions/get-bookings";
import { getBarbers } from "@/app/barbeiros/_actions/barber-actions";
import { getWeeklyRevenue } from "@/app/barbearia/_actions/analytics";
import { toggleShopStatus } from "@/app/barbearia/_actions/shop-status";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { toast } from "sonner";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";
import { useTheme } from "next-themes";

const AppointmentsList = dynamic(() => import('@/app/components/AppointmentsList'), { ssr: false });
const AgendamentosTicker = dynamic(() => import('@/app/components/AgendamentosTicker'), { ssr: false });

interface DashboardClientProps {
  barbershopId: string;
  userFirstName: string;
  initialStockItems: any[];
  initialFinanceData: { income: number; dailyGoal: number };
  initialBookings: any[];
  initialWeeklyRevenue: { day: string; amount: number }[];
  initialShopStatus: boolean;
}

export default function DashboardClient({
  barbershopId,
  userFirstName,
  initialStockItems,
  initialFinanceData,
  initialBookings,
  initialWeeklyRevenue,
  initialShopStatus
}: DashboardClientProps) {
  const { theme } = useTheme();
  
  const [isShopOpen, setShopOpen] = useState(initialShopStatus);
  
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  
  const [bookings, setBookings] = useState<any[]>(initialBookings);
  const [barbers, setBarbers] = useState<{id: string, name: string}[]>([]);
  const [activeBarberId, setActiveBarberId] = useState<string>("all");

  useEffect(() => {
    async function fetchBarbers() {
        if (barbershopId) {
            const data = await getBarbers(barbershopId);
            setBarbers(data);
        }
    }
    fetchBarbers();
  }, [barbershopId]);
  // We can treat initialWeekyRevenue and stock as static for now or re-fetch if needed.
  // For simplicity and speed, we only re-fetch bookings on date change.
  // Ideally, stock and finance updates are pushed or re-fetched on actions, but let's stick to the previous logic.
  // The previous logic re-fetched EVERYTHING on date change or mount. 
  // Let's assume stock and finance don't change by just switching dashboard date view (except finance might if it was date filtered, 
  // but getDailySummary uses new Date() in page.tsx, not selectedDate).
  
  useEffect(() => {
    // Only fetch bookings when date changes, avoiding full dashboard reload
    const fetchBookings = async () => {
        if (!barbershopId) return;
        const res = await getBookings(barbershopId, selectedDate);
        if (res) setBookings(res);
    };
    if (barbershopId) {
        fetchBookings();
    }
  }, [barbershopId, selectedDate]);

  const isPro = theme === 'pro';
  const estoqueCritico = initialStockItems.some(item => item.quantity <= item.minQuantity);

  return (
    <div className={`min-h-screen bg-background text-foreground font-sans relative transition-all duration-500`}>
        {/* Background Overlay */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-background/80 dark:bg-background/90 pro:bg-background/95 z-10" />
            <img 
                src="https://4kwallpapers.com/images/wallpapers/dark-background-abstract-background-network-3d-background-8192x5464-8324.jpg" 
                alt="Background" 
                className="w-full h-full object-cover opacity-20 dark:opacity-40 pro:hidden"
            />
            {/* Pro BG Effects */}
            <div className="hidden pro:block absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.03),transparent_70%)]" />
            <div className="hidden pro:block absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            
            {/* Floating Particles (Pro) */}
            <div className="hidden pro:block absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/5 rounded-full blur-[120px] animate-float" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand-secondary/5 rounded-full blur-[100px] animate-float [animation-delay:2s]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(204,255,0,0.01)_0%,transparent_70%)]" />
            </div>
        </div>

      <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header (Hidden only on Pro Desktop) */}
          <header className={`flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border p-6 sm:p-8 bg-card/50 backdrop-blur-md gap-4 ${isPro ? 'md:hidden' : ''}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 w-full">
                {!isPro && <img src="/logo.png" alt="Barber Maps Logo" className="hidden sm:block h-28 w-auto object-contain animate-spin-y-10s" />}
                <div className="flex sm:hidden items-center gap-2">
                   <MapPin className="text-brand-primary" size={24} fill="currentColor" />
                   <span className="text-2xl font-black text-brand-primary uppercase tracking-tighter">Barber Maps</span>
                </div>
                <div className="flex flex-col justify-center h-full pt-2 sm:pt-4 w-full">
                   <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Painel Gerencial</span>
                   <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tighter uppercase border-l-4 border-brand-primary pl-4 py-1">
                     {userFirstName} <span className="text-brand-primary italic">Barber</span>
                   </h1>
                </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-end">
               <button 
                   onClick={async () => {
                       const newStatus = !isShopOpen;
                       setShopOpen(newStatus); // Optimistic
                       const res = await toggleShopStatus(barbershopId);
                       if (!res.success) {
                           setShopOpen(!newStatus); // Revert
                           toast.error(`Erro: ${res.message}`);
                       } else {
                           toast.success(newStatus ? "Barbearia ABERTA!" : "Barbearia FECHADA!");
                       }
                   }}
                   className={`px-4 py-2 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg flex items-center gap-2 ${isShopOpen ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-red-500 text-white shadow-red-500/20'}`}
               >
                   {isShopOpen ? (
                       <>
                          <Store size={14} /> <span className="hidden sm:inline">ABERTO</span>
                       </>
                   ) : (
                       <>
                          <Store size={14} /> <span className="hidden sm:inline">FECHADO</span>
                       </>
                   )}
               </button>
               <ThemeToggle />
            </div>
          </header>

          {isPro ? (
            /* --- LAYOUT PRO (GRID 12 COLUNAS) --- */
            <main className="p-4 pro:p-4 pro:pt-10 flex-1 flex flex-col gap-6 overflow-x-hidden relative pro:md:ml-64 lg:pro:grid lg:pro:grid-cols-12 lg:pro:gap-8">
                
                {/* GLOBAL LIVE MONITORING FEED (TOP) */}
                <div className="col-span-12 mb-4">
                    <div className="bg-black/40 border border-brand-primary/20 rounded-2xl p-1 overflow-hidden backdrop-blur-md relative group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary shadow-[0_0_10px_rgba(204,255,0,0.5)]" />
                        <div className="flex items-center gap-4 px-4 py-2">
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">Live Monitor //</span>
                            </div>
                            <div className="flex-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                <AgendamentosTicker barbershopId={barbershopId} />
                            </div>
                            
                            {/* SHOP STATUS BUTTON (PRO DESKTOP) */}
                            <button 
                                onClick={async () => {
                                    const newStatus = !isShopOpen;
                                    setShopOpen(newStatus); // Optimistic
                                    const res = await toggleShopStatus(barbershopId);
                                    if (!res.success) {
                                        setShopOpen(!newStatus); // Revert
                                        toast.error(`Erro: ${res.message}`);
                                    } else {
                                        toast.success(newStatus ? "Barbearia ABERTA!" : "Barbearia FECHADA!");
                                    }
                                }}
                                className={`px-4 py-1.5 rounded-lg font-black uppercase tracking-widest text-[10px] transition-all shadow-lg flex items-center gap-2 border hover:scale-105 active:scale-95 ${isShopOpen ? 'bg-green-500/20 text-green-500 border-green-500/30' : 'bg-red-500/20 text-red-500 border-red-500/30'}`}
                            >
                                {isShopOpen ? (
                                    <>
                                    <Store size={12} /> ABERTO
                                    </>
                                ) : (
                                    <>
                                    <Store size={12} /> FECHADO
                                    </>
                                )}
                            </button>

                            <div className="hidden md:flex items-center gap-3 text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">
                                <span>Status: Syncing</span>
                                <div className="h-3 w-[1px] bg-muted/20" />
                                <span>Uptime: 99.9%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TIMELINE RADAR (Pro section) */}
                <div className="lg:col-span-9 col-span-12">
                    <div className="bg-card border border-border rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12 h-full shadow-2xl flex flex-col min-h-[500px] md:min-h-[800px] relative overflow-hidden group/radar">
                        {/* Radar Scanning Effect */}
                        <div className="absolute inset-0 pointer-events-none z-20">
                            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent shadow-[0_0_15px_rgba(204,255,0,0.5)] animate-scan opacity-0 group-hover/radar:opacity-100 transition-opacity" />
                        </div>
                        {/* Radar Grid Lines Overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.02)_1px,transparent_1px)] bg-[size:100%_40px] pointer-events-none" />
                        
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-2xl md:text-4xl font-black italic uppercase text-foreground leading-tight flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                    Timeline <span className="text-brand-primary text-xl md:text-3xl opacity-80 block sm:inline">Radar / Agenda</span>
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-brand-secondary/60 animate-pulse">Monitoring Active</span>
                                    <div className="h-[1px] w-12 bg-brand-secondary/20" />
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1 md:flex-none">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary opacity-50" size={16} />
                                        <input 
                                            type="date" 
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="bg-muted/50 border border-border pl-10 pr-4 py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest outline-none focus:border-brand-primary transition-all w-full md:w-48 shadow-inner text-foreground cursor-pointer" 
                                        />
                                    </div>
                                    <div className="relative group flex-1 md:flex-none">
                                        <input type="text" placeholder="Pesquisar..." className="bg-muted/50 border border-border px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest outline-none focus:border-brand-primary transition-all w-full md:w-64 shadow-inner" />
                                    </div>
                                </div>
                            </div>

                             {/* ABAS DE BARBEIROS (Só mostra se tiver mais de 1 barbeiro ou pelo menos 1) */}
                            {barbers.length > 0 && (
                                <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide">
                                    <button
                                        onClick={() => setActiveBarberId("all")}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                            activeBarberId === "all" 
                                            ? "bg-brand-primary text-primary-foreground shadow-lg shadow-brand-primary/20" 
                                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        }`}
                                    >
                                        <Users size={14} /> Geral
                                    </button>
                                    {barbers.map(barber => (
                                        <button
                                            key={barber.id}
                                            onClick={() => setActiveBarberId(barber.id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                                activeBarberId === barber.id 
                                                ? "bg-brand-primary text-primary-foreground shadow-lg shadow-brand-primary/20" 
                                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                            }`}
                                        >
                                            <User size={14} /> {barber.name.split(' ')[0]}
                                        </button>
                                    ))}
                                </div>
                            )}

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 flex-1">
                            {[
                                { id: 'pendente', label: 'Agendado' },
                                { id: 'em-atendimento', label: 'Na Cadeira' },
                                { id: 'realizado', label: 'Concluído' },
                                { id: 'cancelado', label: 'Cancelado' }
                            ].map((col) => {
                                const columnBookings = bookings
                                    .filter(b => activeBarberId === "all" || b.barberId === activeBarberId)
                                    .filter(b => b.status === col.id);
                                return (
                                    <div key={col.id} className="flex flex-col gap-4 md:gap-8">
                                        <div className="flex items-center justify-between px-3 md:px-4">
                                            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">{col.label}</span>
                                            <div className="bg-muted px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[9px] md:text-[11px] font-black text-muted-foreground/80">{columnBookings.length}</div>
                                        </div>
                                        <div className="flex-1 flex flex-col gap-4 md:gap-6 p-3 md:p-4 bg-muted/5 rounded-[2rem] md:rounded-[2.5rem] min-h-[200px] md:min-h-[500px] border border-border/10">
                                            {columnBookings.length > 0 ? columnBookings.map(booking => (
                                                <div key={booking.id} className="bg-card border border-border/50 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-lg hover:border-brand-primary/60 transition-all cursor-pointer group hover:scale-[1.04] hover:shadow-2xl active:scale-95">
                                                    <div className="flex items-center gap-4 md:gap-5 mb-3 md:mb-4">
                                                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-brand-primary/10 flex items-center justify-center shrink-0 border border-brand-primary/20 overflow-hidden text-brand-primary font-black text-sm md:text-lg">
                                                           {booking.clientName.charAt(0)}
                                                        </div>
                                                        <div className="flex flex-col truncate">
                                                            <span className="text-xs md:text-sm font-black text-foreground uppercase truncate tracking-tight mb-1">{booking.clientName}</span>
                                                            <div className="flex items-center gap-2">
                                                                <Timer size={10} className="text-brand-primary" />
                                                                <span className="text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest truncate">{booking.time} • {booking.serviceName}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] px-3 md:px-5 py-1.5 md:py-2 rounded-lg md:rounded-xl inline-block ${col.id === 'realizado' ? 'bg-green-500/10 text-green-500' : 'bg-brand-primary/10 text-brand-primary'}`}>
                                                        {col.label}
                                                    </div>
                                                    <button 
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if(confirm("Confirmar cancelamento?")) {
                                                                const { cancelBooking } = await import("@/app/barbearia/_actions/cancel-booking");
                                                                const res = await cancelBooking(booking.id);
                                                                if(res.success) {
                                                                    setBookings(prev => prev.map(b => 
                                                                        b.id === booking.id ? { ...b, status: 'cancelado' } : b
                                                                    ));
                                                                    toast.success("Cancelado!");
                                                                } else {
                                                                    toast.error("Erro ao cancelar");
                                                                }
                                                            }
                                                        }}
                                                        className="absolute top-4 right-4 p-2 text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )) : (
                                                <div className="flex-1 flex items-center justify-center border-2 md:border-4 border-dashed border-muted/10 rounded-[1.5rem] md:rounded-[2rem] py-8">
                                                   <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/10 italic">Vazio</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ANALYTICS (Pro section) */}
                <div className="lg:col-span-3 md:col-span-6 col-span-12">
                    <div className="bg-card border border-border rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-8 h-full shadow-md flex flex-col">
                        <h2 className="text-xl md:text-2xl font-black italic uppercase text-foreground mb-6 md:mb-8 flex items-center justify-between">
                            Analytics
                            <div className="flex gap-1">
                                {[1,2,3].map(i => <div key={i} className="w-1 h-3 bg-brand-primary/20 rounded-full" />)}
                            </div>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-4 mb-6 md:mb-8 flex-1">
                            {[
                                { label: 'Clientes', value: bookings.length.toString(), trend: '+5%', color: 'text-green-500', icon: TrendingUp },
                                { label: 'Receita', value: `R$ ${initialFinanceData.income.toFixed(0)}`, trend: initialFinanceData.income > initialFinanceData.dailyGoal ? '+10%' : '-5%', color: initialFinanceData.income > initialFinanceData.dailyGoal ? 'text-green-500' : 'text-red-500', icon: DollarSign },
                                { label: 'Meta', value: `${Math.round((initialFinanceData.income / initialFinanceData.dailyGoal) * 100)}%`, trend: 'Hoje', color: 'text-brand-primary', icon: Timer }
                            ].map(kpi => (
                                <Link 
                                    key={kpi.label} 
                                    href="/insights" 
                                    className={`relative overflow-hidden bg-muted/30 border border-border/50 p-6 rounded-[1.8rem] md:rounded-[2rem] group hover:border-brand-primary/30 transition-all flex flex-col justify-center cursor-pointer active:scale-95 ${kpi.label === 'Meta' ? 'animate-pulse-neon shadow-lg ring-1 ring-brand-primary/20' : ''}`}
                                >
                                    {kpi.label === 'Meta' && (
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Sparkles className="text-brand-primary animate-spin-slow" size={40} />
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between items-start mb-2 relative z-10">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{kpi.label}</span>
                                            <div className={`flex items-center gap-1 ${kpi.color} text-[10px] font-black mt-1`}>
                                                {kpi.label === 'Meta' ? (
                                                    <span className="animate-pulse">Sincr. Ativa</span>
                                                ) : kpi.trend}
                                            </div>
                                        </div>
                                        {kpi.label === 'Meta' ? (
                                            <Timer className="text-brand-primary animate-pulse" size={16} />
                                        ) : (
                                            <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                        )}
                                    </div>
                                    
                                    {kpi.label === 'Meta' ? (
                                        <div className="mt-2 flex items-baseline gap-2 relative z-10">
                                            <span className="text-4xl md:text-5xl font-black italic text-brand-primary leading-none tracking-tighter">
                                                {Math.round((initialFinanceData.income / initialFinanceData.dailyGoal) * 100)}<span className="text-xl">%</span>
                                            </span>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black uppercase text-muted-foreground leading-none">Status</span>
                                                <span className="text-[10px] font-black uppercase text-brand-primary leading-none mt-1">Holográfico</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-2xl md:text-3xl font-black italic text-foreground tracking-tighter relative z-10">{kpi.value}</span>
                                    )}

                                    {/* Bottom Decorative Line */}
                                    <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/40 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            ))}
                        </div>
                        
                    </div>
                </div>

                {/* BOTTOM ROW (Pro widgets) */}
                <div className="lg:col-span-3 md:col-span-6 col-span-12">
                    <div className="bg-card border border-border rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-md flex flex-col min-h-[300px] md:min-h-[350px]">
                        <h2 className="text-xl md:text-2xl font-black italic uppercase text-foreground mb-6 md:mb-10 flex items-center gap-4 flex-wrap">
                            <div className="p-2 md:p-3 bg-brand-primary/10 rounded-xl md:rounded-2xl text-brand-primary shrink-0"><DollarSign size={20} /></div>
                            <span className="break-words">Receita <span className="xl:inline">Semanal</span></span>
                        </h2>
                        <div className="flex-1 bg-muted/20 rounded-[2rem] md:rounded-[2.5rem] flex items-stretch justify-between p-6 md:p-8 gap-1 md:gap-3 min-h-[180px] md:min-h-[220px]">
                            {initialWeeklyRevenue.length > 0 ? initialWeeklyRevenue.map((data, i) => {
                                const maxAmount = Math.max(...initialWeeklyRevenue.map(d => d.amount), 100);
                                const height = Math.max(8, (data.amount / maxAmount) * 100);
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center justify-end gap-3 group">
                                        <div 
                                          className="w-full max-w-[40px] bg-brand-primary/60 rounded-t-lg md:rounded-t-xl hover:bg-brand-primary transition-all relative cursor-help shadow-[0_0_15px_rgba(204,255,0,0.1)]" 
                                          style={{ height: `${height}%` }}
                                        >
                                           <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-card border border-border px-3 py-1.5 rounded-xl text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity shadow-xl whitespace-nowrap z-50 pointer-events-none">
                                              R$ {data.amount.toFixed(0)}
                                           </div>
                                        </div>
                                        <span className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">{data.day}</span>
                                    </div>
                                );
                            }) : (
                                [1,2,3,4,5,6,7].map((_, i) => (
                                    <div key={i} className="flex-1 bg-muted/10 rounded-t-xl h-[30%] animate-pulse mx-1" />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-3 col-span-12">
                     <Link href="/estoque" className="block h-full group">
                        <div className="bg-card border border-border rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-md h-full transition-all hover:scale-[1.02] active:scale-95 hover:border-brand-primary/30 group-hover:shadow-xl relative overflow-hidden bg-gradient-to-br from-card to-brand-primary/5">
                            {/* Background Glow Effect */}
                            <div className="absolute inset-0 bg-brand-primary/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                            <h2 className="text-xl md:text-2xl font-black italic uppercase text-foreground mb-6 md:mb-10 flex items-center gap-4 relative z-10">
                                <div className="p-2 md:p-3 bg-brand-primary/10 rounded-xl md:rounded-2xl text-brand-primary group-hover:rotate-12 transition-transform"><Package size={20} /></div>
                                Estoque
                            </h2>
                            <div className="space-y-6 md:space-y-8 relative z-10">
                                {(initialStockItems.length > 0 ? initialStockItems.slice(0, 3) : [
                                    { name: 'Sem Produtos', quantity: 0, minQuantity: 10 }
                                ]).map((item) => {
                                    const level = Math.min(100, Math.round((item.quantity / (item.minQuantity * 2)) * 100));
                                    return (
                                        <div key={item.name} className="space-y-3 md:space-y-4">
                                            <div className="flex justify-between items-center px-1">
                                                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground truncate max-w-[150px]">{item.name}</span>
                                            </div>
                                            <div className="h-2.5 md:h-3 w-full bg-muted rounded-full overflow-hidden p-[1px]">
                                                <div className={`h-full rounded-full transition-all duration-1000 ${item.quantity <= item.minQuantity ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-brand-primary shadow-[0_0_10px_rgba(204,255,0,0.3)]'}`} style={{ width: `${level}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Conveyor Belt Animation Overlay */}
                            <div className="absolute bottom-0 left-0 w-full h-24 overflow-hidden pointer-events-none group-hover:opacity-100 transition-opacity">
                                <div className="absolute bottom-4 left-0 w-full h-2 bg-muted/30 border-y border-brand-primary/20 animate-conveyor" />
                                <div className="animate-box-stream" style={{ animationDelay: '0s' }}>
                                    <Package size={72} className="text-brand-primary fill-brand-primary/5" strokeWidth={1} />
                                </div>
                                <div className="animate-box-stream" style={{ animationDelay: '5s' }}>
                                    <Package size={72} className="text-brand-primary fill-brand-primary/5" strokeWidth={1} />
                                </div>
                                <div className="animate-box-stream" style={{ animationDelay: '10s' }}>
                                    <Package size={72} className="text-brand-primary fill-brand-primary/5" strokeWidth={1} />
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="md:col-span-3 col-span-12">
                   <Link href="/barbeiros" className="block h-full group">
                        <div className="bg-card border border-border rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-md h-full transition-all hover:scale-[1.02] active:scale-95 hover:border-red-500/30 group-hover:shadow-xl relative overflow-hidden bg-gradient-to-br from-card to-red-500/5">
                             <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                             <h2 className="text-xl md:text-2xl font-black italic uppercase text-foreground mb-6 md:mb-10 flex items-center gap-4 relative z-10">
                                <div className="p-2 md:p-3 bg-red-500/10 rounded-xl md:rounded-2xl text-red-500 group-hover:rotate-12 transition-transform"><User size={20} /></div>
                                Equipe
                            </h2>
                            
                            {/* Holographic Team Animation */}
                            <div className="flex-1 flex items-center justify-center relative z-10 min-h-[150px]">
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <div className="absolute w-24 h-24 bg-red-500/20 rounded-full animate-ping opacity-20" />
                                    <div className="absolute w-16 h-16 bg-red-500/10 rounded-full animate-ping delay-75 opacity-40" />
                                    
                                    <div className="flex items-center justify-center gap-[-10px]">
                                         <div className="w-12 h-12 rounded-full border-2 border-card bg-muted flex items-center justify-center -mr-4 z-10 transition-transform group-hover:-translate-x-4">
                                            <User size={20} className="text-muted-foreground" />
                                         </div>
                                         <div className="w-16 h-16 rounded-full border-4 border-card bg-red-500 text-white flex items-center justify-center z-20 shadow-xl shadow-red-500/30 group-hover:scale-110 transition-transform">
                                            <Shield size={28} className="animate-pulse" />
                                         </div>
                                         <div className="w-12 h-12 rounded-full border-2 border-card bg-muted flex items-center justify-center -ml-4 z-10 transition-transform group-hover:translate-x-4">
                                            <User size={20} className="text-muted-foreground" />
                                         </div>
                                    </div>
                                </div>
                            </div>
                             <div className="absolute bottom-6 left-0 w-full text-center">
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500/60 group-hover:text-red-500 transition-colors">Squad Active</span>
                             </div>
                        </div>
                   </Link>
                </div>

                <div className="md:col-span-3 col-span-12">
                    <Link href="/galeria-estilos" className="block h-full group">
                        <div className="bg-card border border-border rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-md flex flex-col h-full transition-all hover:scale-[1.02] active:scale-95 hover:border-purple-500/30 group-hover:shadow-xl relative overflow-hidden">
                            {/* Efeito de fundo */}
                            <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="relative z-10 flex flex-col h-full">
                                <h2 className="text-xl md:text-2xl font-black italic uppercase text-foreground mb-6 md:mb-10 flex items-center gap-4">
                                    <div className="p-2 md:p-3 bg-purple-500/10 rounded-xl md:rounded-2xl text-purple-500 group-hover:rotate-12 transition-transform"><Palette size={20} /></div>
                                    Galeria de <span className="text-purple-500">Estilos</span>
                                </h2>
                                
                                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-[2rem] p-8 group-hover:border-purple-500/30 transition-colors">
                                    <Sparkles className="text-purple-500 mb-4 animate-pulse" size={40} />
                                    <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-muted-foreground text-center">Clique para gerenciar sua<br/>vitrine de cortes e estilos</p>
                                    <div className="mt-8 px-6 py-2 bg-purple-500/10 rounded-full border border-purple-500/20 text-[9px] font-black uppercase tracking-widest text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all">
                                        Explorar Galeria
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </main>
          ) : (
            /* --- LAYOUT PADRÃO (DARK/LIGHT - 5 CARDS OPERACIONAIS) --- */
            <main className="p-4 sm:p-8 space-y-8 flex-1">
                
                {/* AGENDAMENTOS ROTATIVOS (Ticker) */}
                <ErrorBoundary>
                    <AgendamentosTicker barbershopId={barbershopId} selectedDate={selectedDate} />
                </ErrorBoundary>

                {/* SECTION: OPERACIONAL (6 CARDS) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* CARD INSIGHTS */}
                  <Link href="/insights" className="block group">
                    <div className="relative overflow-hidden bg-card border border-border p-6 rounded-[2rem] transition-all duration-500 hover:scale-[1.02] active:scale-95 h-full group hover:shadow-xl hover:border-brand-primary/30 shadow-sm bg-gradient-to-br from-card to-brand-primary/10 dark:to-brand-primary/5">
                      <div className="absolute inset-0 bg-brand-primary/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                      <div className="relative z-10">
                        <div className="p-3 rounded-2xl bg-background/50 border border-border text-brand-primary mb-4 w-fit group-hover:rotate-12 transition-transform"><Sparkles size={24} /></div>
                        <h3 className="text-muted-foreground mb-1 font-bold uppercase text-[10px] tracking-widest">Inteligência</h3>
                        <p className="text-2xl font-black text-foreground italic group-hover:text-brand-primary transition-colors">Insights</p>
                      </div>
                    </div>
                  </Link>

                  {/* CARD FINANCEIRO */}
                  <Link href="/financeiro" className="block group">
                    <div className="relative overflow-hidden bg-card border border-border p-6 rounded-[2rem] transition-all duration-500 hover:scale-[1.02] active:scale-95 h-full group hover:shadow-xl hover:border-green-500/30 shadow-sm bg-gradient-to-br from-card to-green-500/10 dark:to-green-500/5">
                      <div className="absolute inset-0 bg-green-500/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                      <div className="relative z-10">
                        <div className="p-3 rounded-2xl bg-background/50 border border-border text-green-500 mb-4 w-fit group-hover:rotate-12 transition-transform"><DollarSign size={24} /></div>
                        <h3 className="text-muted-foreground mb-1 font-bold uppercase text-[10px] tracking-widest">Gestão de Vendas</h3>
                        <p className="text-2xl font-black text-foreground italic group-hover:text-green-500 transition-colors">Financeiro</p>
                      </div>
                    </div>
                  </Link>

                  {/* CARD ESTOQUE */}
                  <Link href="/estoque" className="block group">
                    <div className={`relative overflow-hidden bg-card border p-6 rounded-[2rem] transition-all duration-500 hover:scale-[1.02] active:scale-95 h-full hover:shadow-xl shadow-sm group ${estoqueCritico ? 'border-red-500/40 hover:border-red-500/60 bg-gradient-to-br from-card to-red-500/15 dark:to-red-500/5' : 'border-border hover:border-blue-500/30 bg-gradient-to-br from-card to-blue-500/15 dark:to-blue-500/5'}`}>
                      <div className={`absolute inset-0 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${estoqueCritico ? 'bg-red-500/10' : 'bg-blue-500/10'}`} />
                      <div className="relative z-10">
                        <div className={`p-3 rounded-2xl bg-background/50 border border-border mb-4 w-fit group-hover:rotate-12 transition-transform ${estoqueCritico ? 'text-red-500' : 'text-blue-500'}`}><Package size={24} /></div>
                        <h3 className="text-muted-foreground mb-1 font-bold uppercase text-[10px] tracking-widest">Controle</h3>
                        <p className={`text-2xl font-black text-foreground italic transition-colors ${estoqueCritico ? 'group-hover:text-red-500' : 'group-hover:text-blue-500'}`}>Estoque</p>
                      </div>
                    </div>
                  </Link>

                  {/* CARD MINHA BARBEARIA */}
                  <Link href="/barbearia" className="block group">
                    <div className="relative overflow-hidden bg-card border border-border p-6 rounded-[2rem] transition-all duration-500 hover:scale-[1.02] active:scale-95 h-full group hover:shadow-xl hover:border-brand-primary/30 shadow-sm bg-gradient-to-br from-card to-brand-primary/10 dark:to-brand-primary/5">
                      <div className="absolute inset-0 bg-brand-primary/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                      <div className="relative z-10">
                        <div className="p-3 rounded-2xl bg-background/50 border border-border text-brand-primary mb-4 w-fit group-hover:rotate-12 transition-transform"><Store size={24} /></div>
                        <h3 className="text-muted-foreground mb-1 font-bold uppercase text-[10px] tracking-widest">Configuração</h3>
                        <p className="text-2xl font-black text-foreground italic group-hover:text-brand-primary transition-colors truncate">Barbearia</p>
                      </div>
                    </div>
                  </Link>

                   {/* CARD EQUIPE */}
                   <Link href="/barbeiros" className="block group">
                    <div className="relative overflow-hidden bg-card border border-border p-6 rounded-[2rem] transition-all duration-500 hover:scale-[1.02] active:scale-95 h-full group hover:shadow-xl hover:border-red-500/30 shadow-sm bg-gradient-to-br from-card to-red-500/15 dark:to-red-500/5">
                      <div className="absolute inset-0 bg-red-500/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                      <div className="relative z-10">
                        <div className="p-3 rounded-2xl bg-background/50 border border-border text-red-500 mb-4 w-fit group-hover:rotate-12 transition-transform"><User size={24} /></div>
                        <h3 className="text-muted-foreground mb-1 font-bold uppercase text-[10px] tracking-widest">Profissionais</h3>
                        <p className="text-2xl font-black text-foreground italic group-hover:text-red-500 transition-colors">Equipe</p>
                      </div>
                    </div>
                  </Link>

                  {/* CARD GALERIA DE ESTILO */}
                  <Link href="/galeria-estilos" className="block group">
                    <div className="relative overflow-hidden bg-card border border-border p-6 rounded-[2rem] transition-all duration-500 hover:scale-[1.02] active:scale-95 h-full group hover:shadow-xl hover:border-purple-500/30 shadow-sm bg-gradient-to-br from-card to-purple-500/10 dark:to-purple-500/5">
                      <div className="absolute inset-0 bg-purple-500/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                      <div className="relative z-10">
                        <div className="p-3 rounded-2xl bg-background/50 border border-border text-purple-500 mb-4 w-fit group-hover:rotate-12 transition-transform"><Palette size={24} /></div>
                        <h3 className="text-muted-foreground mb-1 font-bold uppercase text-[10px] tracking-widest">Inspiração</h3>
                        <p className="text-2xl font-black text-foreground italic group-hover:text-purple-400 transition-colors">Estilos</p>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* TIMELINE RADAR (Abaixo dos cards no layout padrão) */}
                <div className="bg-card/40 border border-border rounded-[2.5rem] p-4 sm:p-8 backdrop-blur-sm shadow-sm">
                  <h2 className="text-2xl font-black italic uppercase mb-8 text-foreground">Timeline <span className="text-brand-primary">Radar</span></h2>
                  <ErrorBoundary>
                    <AppointmentsList barbershopId={barbershopId} selectedDate={selectedDate} onDateChange={setSelectedDate} />
                  </ErrorBoundary>
                </div>
            </main>
          )}

      </div>
    </div>
  );
}
