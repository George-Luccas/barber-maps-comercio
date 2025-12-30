"use client";
import { useEffect, useState, useRef } from "react";
import { getBookings } from "@/app/barbearia/_actions/get-bookings";
import { toast } from "sonner";
import { Bell } from "lucide-react";

// 1. Criamos uma interface para o TypeScript não reclamar
interface Appointment {
  id: string;
  clientName: string;
  serviceName: string;
  time: string;
  status: string;
}

// Som de notificação (Ding simples)
const ALERT_SOUND = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//uQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAZAAABmwBMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTFExTlAAAADUAAAAGQAAAAAAAAAAAAAA//uQZAAAAAAAIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//sQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAA/8AAAKQAAAAwAAANIAAAAQAAAaQAAAAgAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAA/8AAAKQAAAAwAAANIAAAAQAAAaQAAAAgAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//"

// Recebemos o barbershopId como "prop" vinda do Dashboard
export default function AppointmentsList({ barbershopId }: { barbershopId?: string }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Refs para controle de notificação
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastCountRef = useRef(0);
  const firstLoadRef = useRef(true);

  // Inicializa o áudio
  useEffect(() => {
    audioRef.current = new Audio(ALERT_SOUND);
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function fetchAppointments() {
      if (!barbershopId) return;
      
      try {
        const data = await getBookings(barbershopId);
        
        // Verifica se houve novos agendamentos (aumentou a quantidade)
        const currentCount = data.length;
        
        if (!firstLoadRef.current && currentCount > lastCountRef.current) {
           // Toca som
           audioRef.current?.play().catch(e => console.log("Audio play failed (user interaction needed)", e));
           
           // Mostra notificação
           const diff = currentCount - lastCountRef.current;
           toast.success(`${diff} Novo(s) agendamento(s) recebido(s)!`, {
             description: "Sua agenda foi atualizada.",
             icon: <Bell className="text-yellow-500" />,
             duration: 5000,
           });
        }

        setAppointments(data);
        lastCountRef.current = currentCount;
        firstLoadRef.current = false;
        
      } catch (error) {
        console.error("Erro ao carregar agenda:", error);
      } finally {
        setLoading(false);
      }
    }

    // Busca imediata ao montar
    fetchAppointments();

    // Polling a cada 30 segundos
    intervalId = setInterval(fetchAppointments, 30000);

    return () => clearInterval(intervalId);
  }, [barbershopId]);

  if (loading) return <div className="p-4 text-zinc-500 animate-pulse">Sincronizando radar...</div>;

  // Se não tiver nada
  if (appointments.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center">
        <p className="text-zinc-500 uppercase text-xs font-bold tracking-widest">Nenhum agendamento encontrado para sua unidade</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6 transition-all">
      <div className="flex justify-between items-center mb-4">
         <h2 className="text-lg md:text-xl font-bold text-yellow-500">Agenda de Hoje</h2>
         <span className="text-[10px] text-zinc-500 uppercase font-black animate-pulse flex items-center gap-1">
             <div className="w-2 h-2 bg-green-500 rounded-full" /> Ao Vivo
         </span>
      </div>
      
      <div className="space-y-3">
        {appointments.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50 animate-in slide-in-from-left duration-300"
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                item.status === 'realizado' ? 'bg-green-500' : 
                item.status === 'pendente' ? 'bg-yellow-500' : 'bg-blue-500'
              }`} />
              
              <div>
                <p className="font-medium text-sm md:text-base text-white leading-tight">
                  {item.clientName}
                </p>
                <p className="text-xs text-gray-400">
                  {item.serviceName}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-bold text-yellow-500">{item.time}</p>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">
                {item.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}