"use client";

import { useEffect, useState } from "react";
import { runDiagnostics } from "./_actions";

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleRun() {
    setLoading(true);
    setLogs(["Iniciando diagnósticos..."]);
    try {
      const results = await runDiagnostics();
      setLogs(results);
    } catch (e: any) {
      setLogs(prev => [...prev, "ERRO FATAL NO CLIENT: " + e.message]);
    }
    setLoading(false);
  }

  return (
    <div className="p-8 bg-black text-green-500 font-mono text-sm min-h-screen">
      <h1 className="text-xl font-bold mb-4">Ferramenta de Diagnóstico - Admin</h1>
      <button 
        onClick={handleRun}
        disabled={loading}
        className="bg-green-700 text-white px-4 py-2 rounded mb-4 hover:bg-green-600 disabled:opacity-50"
      >
        {loading ? "Rodando..." : "EXECUTAR DIAGNÓSTICO (Production)"}
      </button>

      <div className="bg-gray-900/50 p-4 rounded border border-green-500/30 whitespace-pre-wrap">
        {logs.map((log, i) => (
            <div key={i} className="mb-1 border-b border-gray-800 pb-1">{log}</div>
        ))}
        {logs.length === 0 && <span className="opacity-50">Aguardando execução...</span>}
      </div>
    </div>
  );
}
