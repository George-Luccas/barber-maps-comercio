
"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { checkNewBookings } from "@/app/barbearia/_actions/check-new-bookings";
import { toast } from "sonner";
import { Bell } from "lucide-react";

// Som de notificação (Ding simples)
const ALERT_SOUND = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//uQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAZAAABmwBMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTFExTlAAAADUAAAAGQAAAAAAAAAAAAAA//uQZAAAAAAAIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//sQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAA/8AAAKQAAAAwAAANIAAAAQAAAaQAAAAgAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAA/8AAAKQAAAAwAAANIAAAAQAAAaQAAAAgAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//"

export function NotificationWatcher() {
  const { data: session } = useSession();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Guardamos o timestamp da última verificação.
  // Começa com "agora" para não notificar tudo que já existe ao abrir o app.
  const lastCheckTimeRef = useRef<Date>(new Date());
  
  const barbershopId = (session?.user as any)?.barbershopId;

  // Inicializa audio
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio(ALERT_SOUND);
    }
  }, []);

  useEffect(() => {
    if (!barbershopId) return;

    const checkForNotifications = async () => {
      try {
        const lastCheck = lastCheckTimeRef.current;
        
        // Atualiza o ref imediatamente para evitar overlap (idealmente usaria retorno do server, mas aqui simplificamos)
        // Vamos atualizar só depois do sucesso, mas usamos o tempo DA CHAMADA para a próxima query
        const now = new Date(); 

        const newBookings = await checkNewBookings(barbershopId, lastCheck);

        if (newBookings.length > 0) {
            // Toca o som uma vez
            audioRef.current?.play().catch(e => console.log("Audio play failed", e));
            
            // Exibe notificação para cada novo agendamento
            newBookings.forEach(booking => {
                toast.success(`Novo Agendamento: ${booking.clientName}`, {
                    description: `${booking.serviceName} - ${booking.date} às ${booking.time}`,
                    icon: <Bell className="text-yellow-500 animate-bounce" />,
                    duration: 8000, // Um pouco mais longo para dar tempo de ler
                    action: {
                        label: "Ver",
                        onClick: () => window.location.href = "/" // ou link direto pro detalhe
                    }
                });
            });
        }
        
        // Atualiza o tempo de corte para o momento atual (ou maior createdAt recebido)
        lastCheckTimeRef.current = now;

      } catch (error) {
        console.error("Erro no watcher de notificações:", error);
      }
    };

    // Poll a cada 15 segundos (mais frequente que a lista)
    const intervalId = setInterval(checkForNotifications, 15000); // 15s

    return () => clearInterval(intervalId);
  }, [barbershopId]);

  return null; // Componente "headless", só lógica
}
