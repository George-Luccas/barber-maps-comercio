
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
  // Guardamos o timestamp da última verificação.
  // Começa com "agora" para não notificar tudo que já existe ao abrir o app.
  const lastCheckTimeRef = useRef<Date>(new Date());
  const errorCountRef = useRef(0);
  
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

        if (errorCountRef.current > 3) return; // Stop polling if too many errors

        const newBookings = await checkNewBookings(barbershopId, lastCheck);
        
        // Reset error count on success
        errorCountRef.current = 0;

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
        errorCountRef.current += 1;
        if (errorCountRef.current > 3) {
            console.warn("Muitos erros consecutivos nas notificações. Pausando verificação.");
        }
      }
    };

    // Poll a cada 60 segundos para evitar spam de erros se o servidor cair
    const intervalId = setInterval(checkForNotifications, 60000); 

    return () => clearInterval(intervalId);
  }, [barbershopId]);

  return null; // Componente "headless", só lógica
}
