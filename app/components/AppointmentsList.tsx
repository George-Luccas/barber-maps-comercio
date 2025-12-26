"use client";

// Exemplo de dados - depois buscaremos do banco!
const appointments = [
  { id: 1, client: "Lucas Silva", service: "Cabelo + Barba", time: "10:30", status: "confirmado" },
  { id: 2, client: "André Santos", service: "Corte Social", time: "11:15", status: "pendente" },
  { id: 3, client: "Roberto Farias", service: "Barboterapia", time: "14:00", status: "realizado" },
];

export default function AppointmentsList() {
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
              {/* Bolinha de Status */}
              <div className={`w-3 h-3 rounded-full ${
                item.status === 'realizado' ? 'bg-green-500' : 
                item.status === 'pendente' ? 'bg-yellow-500' : 'bg-blue-500'
              }`} />
              
              <div>
                {/* Texto responsivo: text-sm no mobile, text-base no PC */}
                <p className="font-medium text-sm md:text-base text-white leading-tight">
                  {item.client}
                </p>
                <p className="text-xs text-gray-400">
                  {item.service}
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