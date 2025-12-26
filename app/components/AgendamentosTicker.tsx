"use client";

import { motion } from "framer-motion";
import { Scissors, Clock, User, Zap } from "lucide-react";

// Dados mockados baseados nos seus serviços reais
const AGENDAMENTOS_DIA = [
  { id: 1, cliente: "Marcos Silva", servico: "Hair", tempo: "40 min", hora: "14:00", status: "concluido" },
  { id: 2, cliente: "Felipe Souza", servico: "Nevou / Platinado", tempo: "120 min", hora: "15:00", status: "em-andamento" },
  { id: 3, cliente: "Lucas Lima", servico: "Beard", tempo: "40 min", hora: "17:30", status: "agendado" },
  { id: 4, cliente: "João Pedro", servico: "Combo", tempo: "80 min", hora: "18:10", status: "agendado" },
  { id: 5, cliente: "Ricardo Dias", servico: "Kids Cut", tempo: "45 min", hora: "19:40", status: "agendado" },
];

export default function AgendamentosTicker() {
  // Duplicamos a lista para criar o efeito de loop infinito sem buracos
  const tickerItems = [...AGENDAMENTOS_DIA, ...AGENDAMENTOS_DIA];

  return (
    <div className="w-full bg-zinc-900/50 border-y border-zinc-800 py-3 overflow-hidden flex items-center">
      {/* Container da Animação */}
      <motion.div
        className="flex whitespace-nowrap gap-8"
        animate={{ x: ["0%", "-50%"] }} // Move metade da largura total
        transition={{
          ease: "linear",
          duration: 30, // Velocidade: quanto maior, mais devagar
          repeat: Infinity,
        }}
      >
        {tickerItems.map((item, idx) => (
          <div 
            key={idx} 
            className="flex items-center gap-4 bg-black/40 border border-zinc-800 px-6 py-2 rounded-2xl"
          >
            {/* Indicador de Status Piscante para o que está rolando agora */}
            {item.status === "em-andamento" && (
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
            )}
            
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-500 flex items-center gap-1">
                <Clock size={10} /> {item.hora}
              </span>
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <User size={14} className="text-yellow-500" /> {item.cliente}
              </span>
            </div>

            <div className="h-8 w-[1px] bg-zinc-800 mx-2" />

            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-yellow-500 flex items-center gap-1">
                <Scissors size={10} /> {item.servico}
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">
                Duração: {item.tempo}
              </span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}