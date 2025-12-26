import FinancialManager from "../components/financial-manager";

export default function FinanceiroPage() {
  return (
    <main className="bg-black min-h-screen">
       {/* Chamamos apenas o componente. O Header já está lá dentro! */}
       <FinancialManager />
    </main>
  );
}