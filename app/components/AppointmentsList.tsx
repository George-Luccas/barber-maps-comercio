"use client";
import { useEffect, useState } from "react";
import { getBookings } from "@/app/barbearia/_actions/get-bookings";

// 1. Criamos uma interface para o TypeScript não reclamar
interface Appointment {
  id: string;
  clientName: string;
  serviceName: string;
  time: string;
  status: string;
}

// Recebemos o barbershopId como "prop" vinda do Dashboard
export default function AppointmentsList({ barbershopId }: { barbershopId?: string }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointments() {
      if (!barbershopId) return;
      
      try {
        setLoading(true);
        // 2. Fazemos a busca na sua API enviando o ID da barbearia logada
        // 2. Fazemos a busca na sua API enviando o ID da barbearia logada
        const data = await getBookings(barbershopId);
        setAppointments(data);
      } catch (error) {
        console.error("Erro ao carregar agenda:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [barbershopId]);

  if (loading) return <div className="p-4 text-zinc-500 animate-pulse">Sincronizando radar...</div>;

  // 3. Se o Adrian entrar e não tiver nada, aparecerá essa mensagem bonitona
  if (appointments.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center">
        <p className="text-zinc-500 uppercase text-xs font-bold tracking-widest">Nenhum agendamento encontrado para sua unidade</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-bold text-yellow-500 mb-4">Agenda de Hoje</h2>
      
      <div className="space-y-3">
        {appointments.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50"
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