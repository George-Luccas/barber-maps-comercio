"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowLeft, Upload, ChevronLeft, ChevronRight, X, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { UploadButton } from "@uploadthing/react";
import { useSession } from "next-auth/react";
import { getStyles, createStyle, deleteStyle } from "../barbearia/_actions/gallery";

export default function GaleriaEstilos() {
  const { data: session } = useSession();
  const [estilos, setEstilos] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // States para o novo upload
  const [novoNome, setNovoNome] = useState("");
  const [novaImagem, setNovaImagem] = useState("");

  const barbershopId = (session?.user as any)?.barbershopId;

  // Carregar estilos do banco
  useEffect(() => {
    if (barbershopId) {
      loadStyles();
    }
  }, [barbershopId]);

  const loadStyles = async () => {
    setLoading(true);
    const res = await getStyles(barbershopId);
    if (res.success && res.styles) {
      // Mapear para o formato esperado (imageUrl -> url)
      const mapped = res.styles.map((s: any) => ({
        id: s.id,
        nome: s.name,
        url: s.imageUrl
      }));
      setEstilos(mapped);
    }
    setLoading(false);
  };

  const nextSlide = () => {
    if (estilos.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % estilos.length);
  };

  const prevSlide = () => {
    if (estilos.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + estilos.length) % estilos.length);
  };

  // Lógica de Swipe
  const onDragEnd = (event: any, info: any) => {
    const threshold = 50; // Distância mínima para considerar swipe
    if (info.offset.x < -threshold) {
      nextSlide();
    } else if (info.offset.x > threshold) {
      prevSlide();
    }
  };

  const adicionarEstilo = async () => {
    if (!novoNome.trim()) return alert("Digite o nome do estilo!");
    if (!novaImagem) return alert("Faça o upload da imagem!");

    // Salvar no banco
    const res = await createStyle({
      name: novoNome,
      imageUrl: novaImagem,
      barbershopId
    });

    if (res.success && res.style) {
      // Atualizar lista local
      setEstilos(prev => [
        ...prev,
        {
          id: res.style.id,
          nome: res.style.name,
          url: res.style.imageUrl
        }
      ]);

      // Limpa e foca no novo slide
      setNovoNome("");
      setNovaImagem("");
      setShowInput(false);
      setCurrentIndex(estilos.length); // Vai para o último (que acabou de ser adicionado)
    } else {
      alert("Erro ao salvar estilo: " + res.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-zinc-900 dark:text-white p-6 font-sans flex flex-col relative overflow-hidden transition-colors duration-300">
      {/* Background Glows (Dark Mode Only) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none hidden dark:block" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none hidden dark:block" />

      <header className="flex justify-between items-center mb-8 relative z-10">
        <Link href="/" className="p-3 bg-white dark:bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-purple-500/50 transition-all group shadow-sm dark:shadow-none">
            <ArrowLeft size={20} className="text-zinc-600 dark:text-white group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors"/>
        </Link>
        <div className="text-center">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">Galeria Exclusiva</p>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-purple-200 dark:to-white dark:drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            Meus <span className="text-purple-600 dark:text-purple-500">Estilos</span>
          </h1>
        </div>
        <div className="w-12 h-12 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-500 shadow-sm dark:shadow-[0_0_15px_rgba(168,85,247,0.2)] backdrop-blur-md">
            <Sparkles size={20} className="animate-pulse"/>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full relative z-10">
        
        {/* CARROUSEL AREA */}
        <div className="relative aspect-[3/4] mb-8 group">
          {loading ? (
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
             </div>
          ) : estilos.length > 0 ? (
            <AnimatePresence mode="wait">
                <motion.div
                key={estilos[currentIndex].id}
                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)", x: 100 }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)", x: 0 }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)", x: -100 }}
                transition={{ duration: 0.4, ease: "circOut" }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={onDragEnd}
                className="absolute inset-0 rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl dark:shadow-[0_0_30px_rgba(168,85,247,0.15)] ring-1 ring-black/5 dark:ring-white/10 cursor-grab active:cursor-grabbing"
                >
                <img 
                    src={estilos[currentIndex].url} 
                    className="w-full h-full object-cover pointer-events-none" 
                    alt={estilos[currentIndex].nome} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90 pointer-events-none" />
                
                <div className="absolute top-4 right-4 z-20">
                     <button
                        onClick={async (e) => {
                           e.stopPropagation();
                           if(!confirm("Excluir este estilo?")) return;
                           
                           setLoading(true);
                           const res = await deleteStyle(estilos[currentIndex].id);
                           if(res.success) {
                              const newEstilos = estilos.filter(s => s.id !== estilos[currentIndex].id);
                              setEstilos(newEstilos);
                              if(newEstilos.length > 0) {
                                 setCurrentIndex(0);
                              }
                           } else {
                              alert("Erro ao excluir");
                           }
                           setLoading(false);
                        }}
                        className="p-2 bg-black/50 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-all border border-white/20"
                     >
                        <X size={20} />
                     </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 pb-10 pointer-events-none">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <p className="text-purple-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">
                            Estilo #{currentIndex + 1}
                        </p>
                        <h2 className="text-4xl font-black italic text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] uppercase">
                            {estilos[currentIndex].nome}
                        </h2>
                    </motion.div>
                </div>
                </motion.div>
            </AnimatePresence>
          ) : (
            <div className="absolute inset-0 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 flex flex-col items-center justify-center p-8 text-center text-zinc-400 dark:text-zinc-500">
                <ImageIcon size={48} className="mb-4 opacity-50" />
                <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">Nenhum estilo na galeria</p>
                <p className="text-xs opacity-60 mt-2">Adicione sua primeira foto abaixo</p>
            </div>
          )}

          {/* CONTROLS (Desktop Only mainly, but visible on mobile too) */}
          {estilos.length > 1 && (
            <>
                <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/40 dark:bg-black/40 backdrop-blur-xl rounded-full text-zinc-900 dark:text-white border border-white/20 hover:bg-purple-500/80 hover:border-purple-500 transition-all opacity-0 group-hover:opacity-100 active:scale-95 shadow-lg z-20">
                    <ChevronLeft size={24} />
                </button>
                <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/40 dark:bg-black/40 backdrop-blur-xl rounded-full text-zinc-900 dark:text-white border border-white/20 hover:bg-purple-500/80 hover:border-purple-500 transition-all opacity-0 group-hover:opacity-100 active:scale-95 shadow-lg z-20">
                    <ChevronRight size={24} />
                </button>
            </>
          )}
          
          {/* INDICATORS */}
          {estilos.length > 0 && (
            <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2">
                {estilos.map((_, idx) => (
                <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-8 bg-purple-600 dark:bg-purple-500 shadow-md dark:shadow-[0_0_10px_rgba(168,85,247,0.8)]' : 'w-2 bg-zinc-300 dark:bg-zinc-800'}`} 
                />
                ))}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="mt-8">
          {showInput ? (
            <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[2rem] backdrop-blur-md shadow-2xl animate-in slide-in-from-bottom-6 ring-1 ring-black/5 dark:ring-white/5">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-widest drop-shadow-none dark:drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">
                    Novo Estilo
                </span>
                <button 
                    onClick={() => {
                        setShowInput(false);
                        setNovaImagem("");
                        setNovoNome("");
                    }}
                    className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <X size={16} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white"/>
                </button>
              </div>

              {!novaImagem ? (
                  <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl p-8 mb-4 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-center group cursor-pointer relative">
                    <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                            setNovaImagem(res[0].url);
                        }}
                        onUploadError={(error: Error) => {
                            alert(`Erro: ${error.message}`);
                        }}
                        appearance={{
                            button: "bg-transparent text-transparent absolute inset-0 w-full h-full z-10 cursor-pointer",
                            container: "w-full h-full",
                            allowedContent: "hidden"
                        }}
                        content={{
                            button({ ready }) { return "" }
                        }}
                    />
                    <div className="pointer-events-none">
                        <Upload size={32} className="mx-auto text-zinc-400 dark:text-zinc-600 group-hover:text-purple-500 dark:group-hover:text-purple-400 mb-2 transition-colors"/>
                        <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 uppercase tracking-wide">Toque para Upload</p>
                    </div>
                  </div>
              ) : (
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-4 border border-purple-500/30 group">
                      <img src={novaImagem} className="w-full h-full object-cover" alt="Preview"/>
                      <button 
                        onClick={() => setNovaImagem("")}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                          <X size={14}/>
                      </button>
                  </div>
              )}

              <input 
                type="text" 
                placeholder="NOME DO ESTILO..." 
                className="w-full bg-gray-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-700/50 rounded-xl p-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-700 outline-none focus:border-purple-500 focus:bg-white dark:focus:bg-black/60 focus:shadow-[0_0_15px_rgba(168,85,247,0.1)] transition-all uppercase font-black text-sm tracking-wide mb-4"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
              />

              <button 
                onClick={adicionarEstilo}
                className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-purple-600 dark:hover:bg-purple-400 hover:text-white rounded-xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-lg dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-xl dark:hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!novoNome || !novaImagem}
              >
                Salvar na Galeria
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowInput(true)}
              className="w-full py-6 bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-purple-500/30 hover:shadow-lg dark:hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] active:scale-95 transition-all group"
            >
              <Plus size={24} className="text-purple-500 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]"/> 
              <span className="group-hover:text-purple-200 transition-colors">Adicionar Estilo</span>
            </button>
          )}
        </div>

      </main>
    </div>
  );
}