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

interface AppointmentsListProps {
  barbershopId?: string;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function AppointmentsList({ barbershopId, selectedDate, onDateChange }: AppointmentsListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  if (!barbershopId) {
    return (
        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
            <h3 className="text-red-400 font-bold mb-2">Erro de Sessão</h3>
            <p className="text-zinc-400 text-sm mb-4">Não foi possível identificar sua barbearia. Isso pode acontecer se sua sessão expirou ou ficou incompleta.</p>
            <button 
                onClick={() => window.location.href = "/api/auth/signout"}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors text-sm"
            >
                Sair e Entrar Novamente
            </button>
        </div>
    );
  }
  
  // Refs para controle de notificação
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastCountRef = useRef(0);
  const firstLoadRef = useRef(true);

  // Inicializa o áudio
  useEffect(() => {
    if (typeof window !== "undefined") {
        audioRef.current = new Audio(ALERT_SOUND);
    }
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function fetchAppointments() {
      if (!barbershopId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // Passa a data selecionada (string YYYY-MM-DD) direto
        const data = await getBookings(barbershopId, selectedDate);
        
        // Compara com data local
        const todayLocal = new Date();
        const year = todayLocal.getFullYear();
        const month = String(todayLocal.getMonth() + 1).padStart(2, '0');
        const day = String(todayLocal.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        const isToday = selectedDate === todayStr;
        const currentCount = data.length;
        
        if (isToday && !firstLoadRef.current && currentCount > lastCountRef.current) {
           // Toca som apenas se estiver vendo "hoje"
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
        if (isToday) {
            lastCountRef.current = currentCount;
        }
        firstLoadRef.current = false;
        
      } catch (error) {
        console.error("Erro ao carregar agenda:", error);
      } finally {
        setLoading(false);
      }
    }

    // Busca imediata ao montar ou trocar data
    fetchAppointments();

    // Polling a cada 30 segundos
    intervalId = setInterval(fetchAppointments, 30000);

    return () => clearInterval(intervalId);
  }, [barbershopId, selectedDate]);

  // UI Components
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6 transition-all">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
         <div>
            <h2 className="text-lg md:text-xl font-bold text-yellow-500">Agenda</h2>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-zinc-500 uppercase font-black flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${selectedDate === new Date().toLocaleDateString('fr-CA') ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`} /> 
                    {selectedDate === new Date().toLocaleDateString('fr-CA') ? 'Visualizando Hoje' : 'Visualizando Histórico'}
                </span>
            </div>
         </div>

         {/* Seletor de Data Estilizado usando a prop onDateChange */}
         <div className="relative group">
            <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-black/40 border border-zinc-700 text-white rounded-lg px-4 py-2 text-sm uppercase font-bold tracking-wider outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:hover:scale-110"
            />
         </div>
      </div>
      
      {loading ? (
          <div className="p-8 text-center animate-pulse text-zinc-500 mb-4">
              Carregando agendamentos...
          </div>
      ) : appointments.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center mb-4">
            <p className="text-zinc-500 uppercase text-xs font-bold tracking-widest">Nenhum agendamento para esta data</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {appointments.map((item) => (
            <div 
                key={item.id} 
                className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50 hover:border-yellow-500/30 transition-colors"
            >
                <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                    item.status === 'realizado' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                    item.status === 'pendente' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-blue-500'
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
                <p className={`text-[10px] uppercase tracking-wider font-bold ${
                    item.status === 'realizado' ? 'text-green-500' : 
                    item.status === 'pendente' ? 'text-yellow-600' : 'text-blue-500'
                }`}>
                    {item.status}
                </p>
                </div>
            </div>
            ))}
        </div>
      )}
    </div>
  );
}