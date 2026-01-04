
import { db } from "@/app/_lib/prisma";

export const dynamic = "force-dynamic";

export default async function DebugPage() {
  const bookings = await db.booking.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: { user: true, BarbershopService: true }
  });

  return (
    <div className="p-8 font-mono text-sm bg-black text-green-400 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Debug de Agendamentos (Raw Data)</h1>
      <table className="w-full border border-green-800">
        <thead>
          <tr className="border-b border-green-800">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Nome Usuário</th>
            <th className="p-2 text-left">RAW displayTime (DB)</th>
            <th className="p-2 text-left">RAW Date (UTC ISO)</th>
            <th className="p-2 text-left">Parsed Time (Current Logic)</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => {
             let timeString = b.displayTime;
             if (timeString) {
                const timeMatch = timeString.match(/(\d{2}:\d{2})/);
                if (timeMatch) timeString = `${timeMatch[0]} (via Regex)`;
                else timeString = `${timeString} (No Match)`;
             } else {
                timeString = "NULL - Fallback to Intl";
             }
             
             // Simula a lógica atual de fallback
             if (!b.displayTime) {
                 timeString = new Intl.DateTimeFormat('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'America/Sao_Paulo'
                 }).format(b.date) + " (via Intl)";
             }

             return (
              <tr key={b.id} className="border-b border-green-900 hover:bg-green-900/20">
                <td className="p-2">{b.id.substring(0,6)}...</td>
                <td className="p-2">{b.userName || b.user?.name || "N/A"}</td>
                <td className="p-2 border-l border-green-900 font-bold bg-green-950/30">
                    {b.displayTime === null ? "NULL" : `"${b.displayTime}"`}
                </td>
                <td className="p-2 border-l border-green-900 text-gray-400">{b.date.toISOString()}</td>
                <td className="p-2 border-l border-green-900 text-white">{timeString}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
