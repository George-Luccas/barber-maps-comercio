// lib/scheduling-logic.ts

// Durações específicas conforme sua regra de negócio
export const SERVICE_DURATIONS: Record<string, number> = {
  "Hair": 40,
  "Beard": 40,
  "Eyebrow": 30,
  "Combo": 80, // Hair + Beard
  "Pigmentation": 30,
  "Kids Cut": 45,
  "Platinado": 120,
  "Skin Cleaning": 20
};

export function calculateTotalDuration(selectedServices: string[]): number {
  return selectedServices.reduce((total, service) => {
    return total + (SERVICE_DURATIONS[service] || 0);
  }, 0);
}

export function isTimeSlotAvailable(
  startTime: string, // Ex: "14:00"
  totalMinutes: number,
  config: {
    opening: string;      // Abertura
    lunchStart: string;   // Início almoço
    lunchEnd: string;     // Fim almoço
    closing: string;      // Fechamento
  }
) {
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const start = toMin(startTime);
  const end = start + totalMinutes;
  const opening = toMin(config.opening);
  const closing = toMin(config.closing);
  const lStart = toMin(config.lunchStart);
  const lEnd = toMin(config.lunchEnd);

  // Valida fechamento
  if (end > closing || start < opening) return false;

  // Valida se invade o almoço
  if (start < lEnd && end > lStart) return false;

  return true;
}