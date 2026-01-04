"use client";
import { useEffect, useState, useRef } from "react";
import { getBookings } from "@/app/barbearia/_actions/get-bookings";
import { toast } from "sonner";
import { Bell, Trash2 } from "lucide-react";

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
    <div className="bg-card/30 border border-border rounded-xl p-4 md:p-6 transition-all shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
         <div>
            <h2 className="text-lg md:text-xl font-black italic uppercase text-brand-primary tracking-tighter italic">Agenda</h2>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-muted-foreground uppercase font-black flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${selectedDate === new Date().toLocaleDateString('fr-CA') ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} /> 
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
                className="bg-background/40 border border-border text-foreground rounded-lg px-4 py-2 text-sm uppercase font-bold tracking-wider outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all cursor-pointer invert-0 dark:invert-0 pro:invert-0 [&::-webkit-calendar-picker-indicator]:invert-0 dark:[&::-webkit-calendar-picker-indicator]:invert pro:[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:hover:scale-110 shadow-sm"
            />
         </div>
      </div>
      
      {loading ? (
          <div className="p-8 text-center animate-pulse text-muted-foreground mb-4">
              Carregando agendamentos...
          </div>
      ) : appointments.length === 0 ? (
        <div className="bg-background/50 border border-border rounded-xl p-8 text-center mb-4 shadow-inner">
            <p className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Nenhum agendamento para esta data</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {appointments.map((item) => (
            <div 
                key={item.id} 
                className="flex items-center justify-between bg-background/50 p-4 rounded-lg border border-border hover:border-brand-primary/30 transition-colors shadow-sm"
            >
                <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                    item.status === 'realizado' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                    item.status === 'pendente' ? 'bg-brand-primary shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-blue-500'
                }`} />
                
                <div>
                    <p className="font-bold text-sm md:text-base text-foreground leading-tight">
                    {item.clientName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                    {item.serviceName}
                    </p>
                </div>
                </div>

                <div className="text-right flex items-center gap-4">
                    <div>
                        <p className="text-sm font-black text-brand-primary">{item.time}</p>
                        <p className={`text-[10px] uppercase tracking-wider font-bold ${
                            item.status === 'realizado' ? 'text-green-500' : 
                            item.status === 'pendente' ? 'text-yellow-600 pro:text-brand-primary' : 'text-blue-500'
                        }`}>
                            {item.status}
                        </p>
                    </div>
                    <button 
                        onClick={async () => {
                             if(confirm("Deseja realmente CANCELAR este agendamento?")) {
                                 const { cancelBooking } = await import("@/app/barbearia/_actions/cancel-booking");
                                 const res = await cancelBooking(item.id);
                                 if(res.success) {
                                     setAppointments(prev => prev.map(a => 
                                         a.id === item.id ? { ...a, status: 'cancelado' } : a
                                     ));
                                     toast.success("Agendamento cancelado!");
                                 } else {
                                     toast.error("Erro ao cancelar");
                                 }
                             }
                        }}
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Cancelar Agendamento"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
            ))}
        </div>
      )}
    </div>
  );
}