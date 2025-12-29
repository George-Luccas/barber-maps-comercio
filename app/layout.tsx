import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionWrapper from "./components/SessionWrapper";
import Sidebar from "./components/Sidebar";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BarberMaps - Admin",
  description: "Gerenciamento de Barbearia",
};

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
            <Sidebar />
            <main className="min-h-screen bg-gray-100 dark:bg-[#0a0a0a] transition-colors duration-300">
              {children}
            </main>
          </Providers>
        </SessionWrapper>
      </body>
    </html>
  );
}