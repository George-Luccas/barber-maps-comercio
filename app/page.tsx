"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AppointmentsList from '@/app/components/AppointmentsList';
import AgendamentosTicker from '@/app/components/AgendamentosTicker'; // Certifique-se de criar este arquivo
import { TrendingUp, DollarSign, Timer, Users, Zap } from "lucide-react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [metaEstipulada, setMetaEstipulada] = useState(500);

  useEffect(() => {
    const carregarMeta = () => {
      const salva = localStorage.getItem("meta_estipulada");
      if (salva) setMetaEstipulada(Number(salva));
    };
    carregarMeta();
    window.addEventListener("storage", carregarMeta);
    return () => window.removeEventListener("storage", carregarMeta);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* HEADER PREMIUM */}
      <header className="flex justify-between items-center border-b border-zinc-900 p-8 bg-black/50 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-yellow-500 text-black p-1 rounded-md">
              <Zap size={16} fill="currentColor" />
            </div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">
              Barber <span className="text-yellow-500">Maps AI</span>
            </h1>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
            Painel do Barbeiro: <span className="text-white">{session?.user?.name || "Carregando..."}</span>
          </p>
        </div>
        
        <Link href="/barbearia"> 
          <div className="bg-zinc-900 border border-zinc-800 px-6 py-2.5 rounded-2xl text-white font-black hover:bg-zinc-800 transition-all text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl">
            Minha Barbearia
          </div>
        </Link>
      </header>

      {/* TICKER BOLSA DE VALORES - Movimentação Infinita */}
      <AgendamentosTicker />

      <main className="p-8 pt-4">
        {/* CARDS DE MÉTRICAS ANALYTICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Faturamento / Gestão Comercial */}
          <Link href="/financeiro" className="block group">
            <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-[2rem] transition-all hover:border-yellow-500/50 active:scale-95 h-full group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-black/50 border border-zinc-800 text-green-500">
                  <DollarSign size={24} />
                </div>
                <TrendingUp size={18} className="text-yellow-500" />
              </div>
              <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-1">Gestão Comercial</p>
              <h3 className="text-4xl font-black text-white italic tracking-tight">
                R$ {metaEstipulada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
              <span className="text-[10px] text-zinc-500 mt-3 block uppercase font-bold tracking-tighter flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                Meta sincronizada
              </span>
            </div>
          </Link>

          {/* Novos Clientes / Fidelidade */}
          <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-[2rem]">
             <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-black/50 border border-zinc-800 text-blue-400">
                  <Users size={24} />
                </div>
                <span className="text-[10px] font-black uppercase text-zinc-600">Mensal</span>
              </div>
            <h3 className="text-zinc-500 mb-1 font-bold uppercase text-[10px] tracking-widest">Novos Clientes</h3>
            <p className="text-4xl font-black text-white italic">04</p>
            <p className="text-[10px] text-zinc-600 mt-3 font-medium">Clientes retidos via Visagismo AI</p>
          </div>

          {/* Eficiência de Cadeira (Baseado nos tempos que você definiu) */}
          <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-[2rem]">
             <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-black/50 border border-zinc-800 text-yellow-500">
                  <Timer size={24} />
                </div>
                <span className="text-[10px] font-black uppercase text-zinc-600">Tempo</span>
              </div>
            <h3 className="text-zinc-500 mb-1 font-bold uppercase text-[10px] tracking-widest">Média de Cadeira</h3>
            <p className="text-4xl font-black text-white italic">52 min</p>
            <p className="text-[10px] text-zinc-600 mt-3 font-medium">Calculado: Hair 40m | Nevou 120m</p>
          </div>
        </div>

        {/* LISTA DE AGENDAMENTOS RADAR */}
        <div className="mt-10 bg-zinc-900/20 border border-zinc-800 rounded-[2.5rem] p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-black italic uppercase">Timeline <span className="text-yellow-500">Radar</span></h2>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Controle de atendimentos em tempo real</p>
            </div>
          </div>
          <AppointmentsList />
        </div>
      </main>
    </div>
  );
}