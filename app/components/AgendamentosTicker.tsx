"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Scissors, Clock, User, Zap } from "lucide-react";
import { getBookings } from "@/app/barbearia/_actions/get-bookings";

interface AgendamentosTickerProps {
  barbershopId?: string;
  selectedDate?: string;
}

export default function AgendamentosTicker({ barbershopId, selectedDate }: AgendamentosTickerProps) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
       if (!barbershopId) return;

       // Se não vier data, usa hoje (Local)
       let dateStr = selectedDate;
       if (!dateStr) {
          const d = new Date();
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          dateStr = `${year}-${month}-${day}`;
       }
       try {
         const bookings = await getBookings(barbershopId, dateStr);
         
         const formatted = bookings.map(b => ({
            id: b.id,
            cliente: b.clientName,
            servico: b.serviceName,
            tempo: "40 min", // O banco ainda não retornava tempo, assumindo padrão por enquanto ou ajustar action depois
            hora: b.time,
            status: b.status // 'realizado' | 'pendente'
         }));
         
         setItems(formatted);
       } catch (error) {
         console.error("Erro ticker:", error);
       }
    }
    fetchData();
  }, [barbershopId, selectedDate]);

  if (items.length === 0) return null;

  // Duplicamos a lista para criar o efeito de loop infinito sem buracos
  const tickerItems = [...items, ...items, ...items]; // Triplicar para garantir scroll suave em telas largas

  return (
    <div className="w-full bg-zinc-900/50 border-y border-zinc-800 py-3 overflow-hidden flex items-center">
      {/* Container da Animação */}
      <motion.div
        className="flex whitespace-nowrap gap-8"
        animate={{ x: ["0%", "-50%"] }} // Move metade da largura total
        transition={{
          ease: "linear",
          duration: Math.max(30, tickerItems.length * 3), // Ajusta velocidade baseado na qtd de itens
          repeat: Infinity,
        }}
      >
        {tickerItems.map((item, idx) => (
          <div 
            key={`${item.id}-${idx}`} 
            className={`flex items-center gap-4 border px-6 py-2 rounded-2xl ${
                item.status === 'realizado' 
                ? 'bg-green-900/20 border-green-900/50 opacity-60' 
                : 'bg-black/40 border-zinc-800'
            }`}
          >
            {/* Indicador de Status Piscante para Pendente (Próximos) */}
            {item.status === "pendente" && (
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
            )}
            
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-500 flex items-center gap-1">
                <Clock size={10} /> {item.hora}
              </span>
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <User size={14} className={item.status === 'realizado' ? 'text-green-500' : 'text-yellow-500'} /> 
                {item.cliente}
              </span>
            </div>

            <div className="h-8 w-[1px] bg-zinc-800 mx-2" />

            <div className="flex flex-col">
              <span className={`text-[10px] font-black uppercase flex items-center gap-1 ${item.status === 'realizado' ? 'text-green-500' : 'text-yellow-500'}`}>
                <Scissors size={10} /> {item.servico}
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">
                {item.status === 'realizado' ? 'Concluído' : 'Agendado'}
              </span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}