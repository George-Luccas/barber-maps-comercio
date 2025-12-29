"use client";

import { useState } from "react";
import { testDatabaseConnection } from "./_actions";

export default function TestDbPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    try {
      const res = await testDatabaseConnection();
      setResult(res);
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 font-mono text-sm max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Diagnóstico de Banco de Dados</h1>
      <p className="mb-4 text-gray-500">Este teste verifica se a aplicação Vercel consegue falar com o Banco de Dados.</p>
      
      <button 
        onClick={runTest} 
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Testando Conexão..." : "Executar Teste de Conexão"}
      </button>

      {result && (
        <div className={`mt-6 p-4 rounded border ${result.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <h2 className="font-bold mb-2">{result.success ? "✅ Conexão Bem Sucedida" : "❌ Falha na Conexão"}</h2>
          <pre className="whitespace-pre-wrap overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
          {result.error && (
            <div className="mt-4">
                <p className="font-bold">Dica de Solução:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
                    {result.error.includes("Timed out") && <li>O banco demorou muito para responder. Verifique se o banco permite acesso externo (0.0.0.0/0) ou se a Vercel está na whitelist.</li>}
                    {result.error.includes("SSL") && <li>Erro de SSL. Tente adicionar <code>?sslmode=require</code> ao final da DATABASE_URL na Vercel.</li>}
                    {result.error.includes("password") && <li>Senha incorreta na DATABASE_URL.</li>}
                    {result.error.includes("does not exist") && <li>O banco de dados (schema) não existe ou o nome está errado.</li>}
                </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
