import FinancialManager from "../components/financial-manager";

export default function FinanceiroPage() {
  return (
    <main className="min-h-screen bg-background transition-colors duration-500">
       {/* Chamamos apenas o componente. O Header já está lá dentro! */}
       <FinancialManager />
    </main>
  );
}