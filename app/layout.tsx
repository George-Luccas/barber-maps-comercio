import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

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
    <html lang="pt-br">
      <body className={inter.className}>
        {/* O SessionProvider deve envolver o children */}
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}