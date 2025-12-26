"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, RefreshCw, Sparkles, ArrowLeft, ShieldCheck, Zap, Check } from "lucide-react";
import Link from "next/link";

// Tabela de durações conforme as regras de negócio
const ESTILOS_CORTE = [
  { id: "low-fade", nome: "Low Fade (Hair)", prompt: "men with modern low fade haircut, professional barber shop style", duracao: 40 },
  { id: "platinado", nome: "Nevou / Platinado", prompt: "men with platinum white bleached hair, snowy white hair style", duracao: 120 },
  { id: "mullet", nome: "Mullet Moderno", prompt: "men with modern mullet haircut, burst fade on sides", duracao: 50 },
  { id: "buzz-cut", nome: "Buzz Cut", prompt: "men with very short buzz cut haircut, clean hairline", duracao: 30 },
  { id: "social", nome: "Corte Social", prompt: "men with classic scissor haircut, clean and professional", duracao: 40 },
];

export default function MestreDoCorte() {
  const [hasMounted, setHasMounted] = useState(false);
  const [fotoOriginal, setFotoOriginal] = useState<string | null>(null);
  const [fotoGerada, setFotoGerada] = useState<string | null>(null);
  const [estilo, setEstilo] = useState(ESTILOS_CORTE[0]);
  const [analisando, setAnalisando] = useState(false);
  const [resultado, setResultado] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Previne erro de Hydration: garante que o código só renderize no cliente
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const ligarCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Erro ao ligar câmera", err);
    }
  };

  useEffect(() => {
    if (hasMounted && !fotoOriginal && !resultado) {
      ligarCamera();
    }
  }, [hasMounted, fotoOriginal, resultado]);

  const tirarFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      setFotoOriginal(canvasRef.current.toDataURL("image/png"));
      
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    }
  };

  const gerarIA = async () => {
    if (!fotoOriginal) {
      alert("Tire uma foto primeiro!");
      return;
    }

    setAnalisando(true);
    try {
      const res = await fetch("/api/gerar-corte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Enviando 'image' e 'prompt' corretamente
        body: JSON.stringify({ 
          image: fotoOriginal, 
          prompt: estilo.prompt 
        }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setFotoGerada(data.url);
        setResultado(true); // Ativa a tela de visualização do resultado
      } else {
        alert(data.error || "Erro ao gerar imagem. Verifique seu saldo ou conexão.");
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
      alert("Erro de conexão com o servidor.");
    } finally {
      setAnalisando(false);
    }
  };

  if (!hasMounted) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 font-sans">
      <header className="flex justify-between items-center mb-6 px-2">
        <Link href="/" className="p-2 bg-zinc-900 rounded-lg border border-zinc-800"><ArrowLeft size={20}/></Link>
        <div className="text-center">
          <p className="text-[10px] font-black tracking-widest uppercase text-yellow-500">Mestre do Corte</p>
          <h1 className="text-lg font-black italic uppercase">Barber <span className="text-white">Maps AI</span></h1>
        </div>
        <div className="w-10 h-10 bg-yellow-500/20 border border-yellow-500/40 rounded-xl flex items-center justify-center text-yellow-500"><Zap size={20}/></div>
      </header>

      {!resultado ? (
        <div className="max-w-md mx-auto space-y-4">
          <div className="relative aspect-[4/5] bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-zinc-800 shadow-2xl">
            {!fotoOriginal ? (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-80" />
            ) : (
              <img src={fotoOriginal} className="w-full h-full object-cover" alt="Sua foto" />
            )}
            
            {analisando && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-30">
                <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-yellow-500 text-xs font-black uppercase tracking-widest animate-pulse">
                  Mestre do Corte está criando seu novo estilo...
                </p>
              </div>
            )}
          </div>

          {!fotoOriginal ? (
            <button onClick={tirarFoto} className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
              Tirar Foto para Análise
            </button>
          ) : !analisando && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {ESTILOS_CORTE.map((e) => (
                  <button 
                    key={e.id} 
                    onClick={() => setEstilo(e)} 
                    className={`p-3 rounded-2xl border text-left transition-all ${estilo.id === e.id ? 'border-yellow-500 bg-yellow-500/10' : 'border-zinc-800 bg-zinc-900/50 text-zinc-400'}`}
                  >
                    <p className={`text-[10px] font-black uppercase mb-1 ${estilo.id === e.id ? 'text-yellow-500' : 'text-white'}`}>{e.nome}</p>
                    <p className="text-[9px] opacity-60">{e.duracao} min</p>
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <button onClick={() => setFotoOriginal(null)} className="flex-1 py-5 bg-zinc-900 text-zinc-500 rounded-3xl font-bold text-xs uppercase border border-zinc-800">Refazer</button>
                <button onClick={gerarIA} className="flex-[2] py-5 bg-yellow-500 text-black rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20">
                  <Sparkles size={18}/> Gerar Visual
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-md mx-auto space-y-6 animate-in zoom-in-95 duration-500">
          <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border-2 border-yellow-500 shadow-2xl bg-zinc-900">
            <img 
              src={fotoGerada!} 
              className="w-full h-full object-cover" 
              alt="Seu novo estilo"
            />
            <div className="absolute top-4 right-4 bg-yellow-500 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Sugestão Mestre</div>
          </div>

          <div className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Recomendação</p>
                <h2 className="text-2xl font-black text-white italic">{estilo.nome}</h2>
              </div>
              <div className="bg-green-500/10 p-3 rounded-2xl text-green-500 border border-green-500/20">
                <ShieldCheck size={24}/>
              </div>
            </div>
            
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Baseado na análise, o tempo estimado é de <span className="text-yellow-500 font-bold">{estilo.duracao} minutos</span>.
            </p>

            <button 
              onClick={() => alert(`Agendando ${estilo.nome} (${estilo.duracao} min)`)}
              className="w-full py-5 mb-3 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Check size={20}/> Confirmar Agendamento
            </button>

            <button onClick={() => {setResultado(false); setFotoOriginal(null);}} className="w-full py-4 bg-zinc-800 text-zinc-400 rounded-2xl font-bold text-xs uppercase flex items-center justify-center gap-2">
              <RefreshCw size={14}/> Testar Outro Corte
            </button>
          </div>
        </div>
      )}
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}