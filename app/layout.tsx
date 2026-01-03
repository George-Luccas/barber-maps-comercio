import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionWrapper from "./components/SessionWrapper";
import Sidebar from "./components/Sidebar";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import { NotificationWatcher } from "./components/NotificationWatcher";
import { ErrorBoundary } from "./components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BarberMaps - Admin",
  description: "Gerenciamento de Barbearia",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <SessionWrapper>
          <Providers>
            <ErrorBoundary>
              <Sidebar />
              <NotificationWatcher />
              <main className="min-h-screen bg-gray-100 dark:bg-[#0a0a0a] transition-colors duration-300">
                {children}
                <Toaster position="top-right" richColors />
              </main>
            </ErrorBoundary>
          </Providers>
        </SessionWrapper>
      </body>
    </html>
  );
}