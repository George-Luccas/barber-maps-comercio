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
    <div className="min-h-screen bg-background text-foreground p-6 font-sans flex flex-col relative overflow-hidden transition-colors duration-500 selection:bg-brand-primary/30">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none hidden dark:block pro:bg-brand-primary/20" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-brand-secondary/10 blur-[100px] rounded-full pointer-events-none hidden dark:block" />

      {/* Grid Pattern para o modo Pro */}
      <div className="hidden pro:block absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(var(--brand-secondary) 1px, transparent 1px), linear-gradient(90deg, var(--brand-secondary) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <header className="flex justify-between items-center mb-8 relative z-10">
        <Link href="/" className="p-3 bg-card backdrop-blur-md rounded-xl border border-border hover:border-brand-primary/50 transition-all group shadow-sm">
            <ArrowLeft size={20} className="text-muted-foreground group-hover:text-brand-primary transition-colors"/>
        </Link>
        <div className="text-center">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-brand-primary drop-shadow-[0_0_10px_rgba(234,179,8,0.3)] pro:drop-shadow-[0_0_10px_rgba(204,255,0,0.5)]">Galeria Exclusiva</p>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-foreground italic">
            Meus <span className="text-brand-primary">Estilos</span>
          </h1>
        </div>
        <div className="w-12 h-12 bg-card border border-border rounded-2xl flex items-center justify-center text-brand-primary shadow-sm backdrop-blur-md">
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
                className="absolute inset-0 rounded-[2.5rem] overflow-hidden border border-border bg-card shadow-xl dark:shadow-[0_0_30px_rgba(234,179,8,0.15)] pro:shadow-[0_0_30px_rgba(204,255,0,0.15)] ring-1 ring-black/5 dark:ring-white/10 cursor-grab active:cursor-grabbing"
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
                        <p className="text-brand-primary text-[10px] font-black uppercase tracking-[0.3em] mb-2 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)] pro:drop-shadow-[0_0_8px_rgba(204,255,0,0.8)]">
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
            <div className="absolute inset-0 rounded-[2.5rem] border-2 border-dashed border-border bg-card/30 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <ImageIcon size={48} className="mb-4 opacity-50" />
                <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">Nenhum estilo na galeria</p>
                <p className="text-xs opacity-60 mt-2">Adicione sua primeira foto abaixo</p>
            </div>
          )}

          {/* CONTROLS (Desktop Only mainly, but visible on mobile too) */}
          {estilos.length > 1 && (
            <>
                <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-background/40 backdrop-blur-xl rounded-full text-foreground border border-white/20 hover:bg-brand-primary hover:border-brand-primary hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100 active:scale-95 shadow-lg z-20">
                    <ChevronLeft size={24} />
                </button>
                <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-background/40 backdrop-blur-xl rounded-full text-foreground border border-white/20 hover:bg-brand-primary hover:border-brand-primary hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100 active:scale-95 shadow-lg z-20">
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
                    className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-8 bg-brand-primary shadow-md dark:shadow-[0_0_10px_rgba(234,179,8,0.8)] pro:shadow-[0_0_10px_rgba(204,255,0,0.8)]' : 'w-2 bg-muted'}`} 
                />
                ))}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="mt-8">
          {showInput ? (
            <div className="bg-card border border-border p-6 rounded-[2rem] backdrop-blur-md shadow-2xl animate-in slide-in-from-bottom-6 ring-1 ring-black/5 dark:ring-white/5">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black uppercase text-brand-primary tracking-widest drop-shadow-none dark:drop-shadow-[0_0_5px_rgba(234,179,8,0.5)] pro:drop-shadow-[0_0_5px_rgba(204,255,0,0.5)]">
                    Novo Estilo
                </span>
                <button 
                    onClick={() => {
                        setShowInput(false);
                        setNovaImagem("");
                        setNovoNome("");
                    }}
                    className="p-1 rounded-full hover:bg-muted transition-colors"
                >
                    <X size={16} className="text-muted-foreground hover:text-foreground"/>
                </button>
              </div>

              {!novaImagem ? (
                  <div className="border-2 border-dashed border-border rounded-xl p-8 mb-4 hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all text-center group cursor-pointer relative">
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
                        <Upload size={32} className="mx-auto text-muted-foreground group-hover:text-brand-primary mb-2 transition-colors"/>
                        <p className="text-xs font-bold text-muted-foreground group-hover:text-foreground uppercase tracking-wide">Toque para Upload</p>
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
                className="w-full bg-muted border border-border rounded-xl p-4 text-foreground placeholder:text-muted-foreground outline-none focus:border-brand-primary focus:bg-background focus:shadow-[0_0_15px_rgba(234,179,8,0.1)] transition-all uppercase font-black text-sm tracking-wide mb-4"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
              />

              <button 
                onClick={adicionarEstilo}
                className="w-full py-4 bg-brand-primary text-primary-foreground hover:opacity-90 rounded-xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-lg shadow-brand-primary/10 hover:shadow-xl hover:shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!novoNome || !novaImagem}
              >
                Salvar na Galeria
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowInput(true)}
              className="w-full py-6 bg-card backdrop-blur-md border border-border text-foreground rounded-[2.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-muted hover:border-brand-primary/30 hover:shadow-lg dark:hover:shadow-[0_0_30px_rgba(234,179,8,0.15)] pro:hover:shadow-[0_0_30px_rgba(204,255,0,0.15)] active:scale-95 transition-all group"
            >
              <Plus size={24} className="text-brand-primary group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(234,179,8,0.8)] pro:drop-shadow-[0_0_8px_rgba(204,255,0,0.8)]"/> 
              <span className="group-hover:text-brand-primary/80 transition-colors">Adicionar Estilo</span>
            </button>
          )}
        </div>

      </main>
    </div>
  );
}