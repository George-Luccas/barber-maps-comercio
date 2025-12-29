import FinancialManager from "../components/financial-manager";

export default function FinanceiroPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
       {/* Chamamos apenas o componente. O Header já está lá dentro! */}
       <FinancialManager />
    </main>
  );
}