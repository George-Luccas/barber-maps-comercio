'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Menu, X, DollarSign, Scissors, Palette, LogOut, Home, Sparkles } from 'lucide-react'

import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  if (pathname === '/login') return null

  const menuItems = [
    { name: 'Início', icon: Home, href: '/' },
    { name: 'Financeiro', icon: DollarSign, href: '/financeiro' },
    { name: 'Insights', icon: Sparkles, href: '/insights' },
    { name: 'Minha Barbearia', icon: Scissors, href: '/barbearia' },
    { name: 'Estilo', icon: Palette, href: '/galeria-estilos' },
  ]

  return (
    <>
  {/* Botão para abrir (Aba Lateral) */}
{!isOpen && (
  // Mudei o top-0 para top-20 (80px para baixo)
  <div className="fixed top-6 right-0 md:left-0 md:top-20 md:right-auto h-auto w-12 flex flex-col items-center z-40">
    <button 
      onClick={() => setIsOpen(true)}
      className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-l-xl md:rounded-l-none md:rounded-r-xl rounded-r-none hover:bg-yellow-500 hover:text-black transition-all shadow-2xl"
    >
      <Menu size={24} />
    </button>
  </div>
)}

      {/* Overlay (fundo escuro quando aberto) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu Lateral */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-card text-foreground z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-border shadow-2xl transition-colors duration-500`}>
        <div className="p-6 flex flex-col h-full">
          
          {/* Cabeçalho do Menu */}
          <div className="flex items-center justify-between mb-10">
            <img src="/logo.png" alt="Barber Maps Logo" className="h-32 md:h-40 w-auto object-contain drop-shadow-xl" />
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Links de Navegação */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all group ${
                    pathname === item.href 
                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-sm shadow-brand-primary/10' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <item.icon size={20} className={pathname === item.href ? 'text-brand-primary' : 'group-hover:text-brand-primary transition-colors'} />
                <span className="font-bold uppercase text-xs tracking-widest">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Botão de Logout */}
          <div className="mt-auto pt-6 border-t border-border">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-3 w-full p-3 text-red-500/80 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
            >
              <LogOut size={20} />
              <span className="font-bold uppercase text-xs tracking-widest">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )

}