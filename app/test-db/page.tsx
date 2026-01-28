"use client";

import { useState } from "react";

import { testDatabaseConnection, resetDatabase, getRecentBookings } from "./_actions";

export default function TestDbPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

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

  const handleReset = async () => {
    if (!confirm("TEM CERTEZA? Isso apagará TODOS os usuários e dados!")) return;
    
    setResetLoading(true);
    try {
      const res = await resetDatabase();
      alert(res.message || res.error);
      runTest(); // Re-run test to update count
    } catch (error: any) {
      alert("Erro ao resetar: " + error.message);
    } finally {
      setResetLoading(false);
    }
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
        const data = await getRecentBookings();
        setBookings(data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoadingBookings(false);
    }
  }

  const simulateApiCall = async (bookingId: string) => {
    const confirm = window.confirm("Simular chamada da API externa para completar este agendamento?");
    if(!confirm) return;


    try {
        const res = await fetch(`/api/bookings/${bookingId}/complete`, { 
            method: "POST",
            headers: {
                "Authorization": "Bearer barber-secret-123"
            }
        });
        const data = await res.json();
        alert(JSON.stringify(data, null, 2));
        fetchBookings(); // refresh
    } catch (error) {
        alert("Erro na chamada: " + error);
    }
  }

  return (
    <div className="p-8 font-mono text-sm max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Diagnóstico de Banco de Dados</h1>
      <p className="mb-4 text-gray-500">Este teste verifica se a aplicação Vercel consegue falar com o Banco de Dados.</p>
      
      <div className="flex gap-4 mb-8">
        <button 
          onClick={runTest} 
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Testando..." : "Testar Conexão"}
        </button>

        <button 
          onClick={handleReset} 
          disabled={resetLoading}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {resetLoading ? "Resetando..." : "💣 RESETAR TUDO"}
        </button>
      </div>

      {result && (
        <div className={`mb-8 p-4 rounded border ${result.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
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

      <hr className="my-8 border-gray-200" />

      <h2 className="text-xl font-bold mb-4">Simulação de API Externa</h2>
      <div className="bg-gray-50 p-6 rounded border">
        <p className="mb-4 text-gray-600">
            Ferramenta para testar a rota <code>POST /api/bookings/:id/complete</code>.
            <br/>
            Crie um agendamento no app primeiro, depois clique em "Atualizar Lista" aqui.
        </p>

        <button 
            onClick={fetchBookings}
            className="mb-4 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs"
        >
            {loadingBookings ? "Carregando..." : "🔄 Atualizar Lista de Agendamentos"}
        </button>

        <div className="space-y-2">
            {bookings.length === 0 ? (
                <p className="text-gray-400 italic">Nenhum agendamento encontrado.</p>
            ) : (
                bookings.map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-white border rounded shadow-sm">
                        <div>
                            <p className="font-bold">{booking.BarbershopService?.name} <span className="text-gray-400 font-normal">({booking.id})</span></p>
                            <p className="text-xs text-gray-500">
                                Status: <span className={
                                    booking.status === 'COMPLETED' ? 'text-green-600 font-bold' : 
                                    booking.status === 'CONFIRMED' ? 'text-blue-600' : 'text-gray-600'
                                }>{booking.status}</span>
                                {' | '}
                                Data: {new Date(booking.date).toLocaleDateString()}
                            </p>
                        </div>
                        <button
                            onClick={() => simulateApiCall(booking.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition"
                            disabled={booking.status === 'COMPLETED'}
                        >
                            {booking.status === 'COMPLETED' ? "Já Concluído" : "Simular Confirmação"}
                        </button>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}
