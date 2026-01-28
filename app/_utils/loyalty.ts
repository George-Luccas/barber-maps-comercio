
export function calculateServicePoints(serviceName: string, defaultPoints: number = 10): number {
  if (!serviceName) return defaultPoints;
  
  const name = serviceName.trim();

  // Rules defined by user
  // "Corte + Barba" -> 20 points
  if (name.includes("Corte") && name.includes("Barba")) {
    return 20;
  } 
  
  // "Pigmentação" -> 10 points
  if (name.includes("Pigmentação")) {
    return 10;
  }
  
  // "Corte" -> 10 points
  if (name.includes("Corte")) {
    return 10;
  }
  
  // "Barba/Sobrancelha..." -> 5 points
  if (name.includes("Barba") || name.includes("Sobrancelha") || name.includes("Pezinho")) {
    return 5;
  }

  // Fallback to database value or default
  return defaultPoints;
}
