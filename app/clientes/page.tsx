"use client";

import { useState, useEffect } from "react";
import { getClients } from "./_actions/client-actions";
import { Loader2, Download, User, ArrowLeft, Search } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Link from "next/link";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState("");

  useEffect(() => {
    async function load() {
      const res = await getClients();
      if (res.success && res.clients) {
        setClients(res.clients);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(term.toLowerCase()) || 
    c.phone.includes(term) ||
    (c.instagram && c.instagram.toLowerCase().includes(term.toLowerCase()))
  );

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(234, 179, 8); // Brand primary color (approx)
    doc.text("BARBER MAPS - LISTA DE CLIENTES", 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 28);
    
    const tableData = filteredClients.map(c => [
        c.name,
        c.phone,
        c.instagram || "-",
        c.tier,
        c.totalCuts
    ]);

    autoTable(doc, {
        startY: 35,
        head: [['Nome', 'Telefone', 'Instagram', 'Nível', 'Cortes']],
        body: tableData,
        headStyles: { fillColor: [234, 179, 8], textColor: [0, 0, 0], fontStyle: 'bold' },
        styles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save("clientes.pdf");
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-10 font-sans max-w-7xl mx-auto transition-colors duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
             <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group w-fit">
                <div className="p-2 bg-card rounded-xl group-hover:bg-muted transition-all border border-border shadow-sm">
                    <ArrowLeft size={20} />
                </div>
                <span className="font-bold uppercase text-xs tracking-widest">Voltar ao Painel</span>
            </Link>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
                Meus <span className="text-brand-primary">Clientes</span>
            </h1>
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs mt-2">
                Gerenciamento e Exportação
            </p>
        </div>

        <button 
            onClick={exportPDF}
            disabled={loading || filteredClients.length === 0}
            className="flex items-center gap-2 bg-brand-primary text-black px-6 py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Download size={18} />
            Exportar PDF
        </button>
      </div>

      <div className="bg-card border border-border rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
         <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-2xl mb-6 border border-border/50">
            <Search className="text-muted-foreground" size={20} />
            <input 
                type="text"
                placeholder="Buscar por nome, telefone ou instagram..."
                className="bg-transparent w-full outline-none font-bold uppercase text-sm placeholder:text-muted-foreground/50"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
            />
         </div>

         {loading ? (
             <div className="flex justify-center py-20">
                 <Loader2 className="animate-spin text-brand-primary" size={40} />
             </div>
         ) : (
             <div className="overflow-x-auto">
                 <table className="w-full text-left">
                     <thead>
                         <tr className="border-b border-border/50 text-muted-foreground text-[10px] uppercase font-black tracking-widest">
                             <th className="pb-4 pl-4">Cliente</th>
                             <th className="pb-4">Contato</th>
                             <th className="pb-4">Fidelidade</th>
                             <th className="pb-4 text-center">Cortes</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-border/30">
                         {filteredClients.length === 0 ? (
                             <tr>
                                 <td colSpan={4} className="py-8 text-center text-muted-foreground font-bold uppercase text-xs">
                                     Nenhum cliente encontrado.
                                 </td>
                             </tr>
                         ) : (
                             filteredClients.map((client) => (
                                 <tr key={client.id} className="group hover:bg-muted/30 transition-colors">
                                     <td className="py-4 pl-4">
                                         <div className="flex items-center gap-3">
                                             <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold">
                                                 {client.name.charAt(0).toUpperCase()}
                                             </div>
                                             <div>
                                                 <p className="font-bold text-sm uppercase">{client.name}</p>
                                                 {client.instagram && <p className="text-[10px] text-brand-primary font-bold">{client.instagram}</p>}
                                             </div>
                                         </div>
                                     </td>
                                     <td className="py-4">
                                         <p className="text-xs font-medium text-muted-foreground">{client.phone}</p>
                                         <p className="text-[10px] text-muted-foreground/50">{client.email && !client.email.includes("sememail") ? client.email : ""}</p>
                                     </td>
                                     <td className="py-4">
                                         <span className={`
                                            px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                                            ${client.tier === 'GOLD' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' : 
                                              client.tier === 'SILVER' ? 'bg-gray-300/20 text-gray-300 border-gray-300/30' : 
                                              'bg-orange-700/20 text-orange-700 border-orange-700/30'}
                                         `}>
                                             {client.tier}
                                         </span>
                                     </td>
                                     <td className="py-4 text-center">
                                         <span className="font-black text-lg italic">{client.totalCuts}</span>
                                     </td>
                                 </tr>
                             ))
                         )}
                     </tbody>
                 </table>
             </div>
         )}
      </div>
    </div>
  );
}
