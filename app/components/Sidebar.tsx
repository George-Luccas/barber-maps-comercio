"use client"

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Menu, X, DollarSign, Scissors, Palette, LogOut, Home, Sparkles, LayoutGrid, Calendar, BarChart3, Lightbulb, Settings, Package, Briefcase, AlertCircle, List } from 'lucide-react'
import { useTheme } from 'next-themes'

import { usePathname } from 'next/navigation'

import { ThemeToggle } from './ThemeToggle'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (pathname === '/login') return null

  const isPro = theme === 'pro' && mounted

  // Itens padrão para Light/Dark
  const standardMenuItems = [
    { name: 'Início', icon: Home, href: '/' },
    { name: 'Financeiro', icon: DollarSign, href: '/financeiro' },
    { name: 'Estoque', icon: Package, href: '/estoque' },
    { name: 'Insights', icon: Sparkles, href: '/insights' },
    { name: 'Minha Barbearia', icon: Scissors, href: '/barbearia' },
    { name: 'Agendamentos', icon: Calendar, href: '/agenda' },
  ]

  // Itens específicos do PRO (como na imagem)
  const proMenuItems = [
    { name: 'Dashboard', icon: LayoutGrid, href: '/' },
    { name: 'Agenda', icon: Calendar, href: '/agenda' },
    { name: 'Analytics', icon: BarChart3, href: '/insights' },
    { name: 'Insights', icon: Lightbulb, href: '/insights' },
    { name: 'Gerenciador', icon: Settings, href: '/barbearia' },
    { name: 'Estoques', icon: Package, href: '/estoque' },
  ]

  const extraItems = [
    { name: 'Analytics', icon: BarChart3, href: '#' },
    { name: 'Management', icon: Briefcase, href: '#' },
    { name: 'Estragos', icon: AlertCircle, href: '#' },
    { name: 'Menus seleis', icon: List, href: '#' },
  ]

  const itemsToRender = isPro ? proMenuItems : standardMenuItems

  return (
    <>
      {/* MOBILE TOGGLE (Hidden on Pro Desktop) */}
      <div className={`fixed top-6 left-4 md:top-20 md:left-0 h-auto w-12 flex flex-col items-center z-[100] ${isPro ? 'md:hidden' : ''}`}>
        {!isOpen && (
          <button 
            onClick={() => setIsOpen(true)}
            className="p-3 bg-card border border-border text-foreground rounded-xl md:rounded-l-none md:rounded-r-xl hover:bg-brand-primary hover:text-primary-foreground transition-all shadow-2xl active:scale-95"
          >
            <Menu size={24} />
          </button>
        )}
      </div>

      {/* OVERLAY */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-md"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <div className={`
        fixed top-0 left-0 h-full bg-card text-foreground z-[95] border-r border-border transition-all duration-500
        ${isPro ? 'w-64 translate-x-0 hidden md:flex' : 'w-64 transform ' + (isOpen ? 'translate-x-0' : '-translate-x-full')}
        ${isOpen && isPro ? '!flex !translate-x-0 shadow-2xl' : ''}
        ${!isPro && 'shadow-2xl'}
      `}>
        <div className="flex flex-col w-full h-full">
          
          {/* HEADER (Fluxo Pro style vs Standard) */}
          <div className="p-8 flex items-center justify-between">
            {isPro ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center group-hover:bg-brand-primary/20 transition-all">
                    <Sparkles className="text-brand-primary animate-pulse" size={24} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xl font-black italic tracking-tighter text-foreground leading-none">Barber <span className="text-brand-primary">Maps</span></span>
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-1">v2.0</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="scale-75 -mr-2">
                    <ThemeToggle />
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <img src="/logo.png" alt="Logo" className="h-28 w-auto object-contain" />
                <button onClick={() => setIsOpen(false)} className="md:hidden text-muted-foreground hover:text-foreground transition-colors">
                  <X size={24} />
                </button>
              </>
            )}
          </div>

          {/* MAIN NAV */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide">
             {itemsToRender.map((item) => {
               const isActive = pathname === item.href
               return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => !isPro && setIsOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group ${
                        isActive 
                        ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-sm shadow-brand-primary/10' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <item.icon size={20} className={`transition-colors duration-300 ${isActive ? 'text-brand-primary' : 'group-hover:text-brand-primary'}`} />
                    <span className={`font-bold uppercase tracking-[0.2em] ${isPro ? 'text-[10px]' : 'text-xs'}`}>{item.name}</span>
                    {isActive && isPro && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_10px_rgba(204,255,0,0.5)]" />}
                  </Link>
               )
             })}

             {/* EXTRA SECTION (PRO ONLY) */}
             {isPro && (
                <>
                  <div className="pt-8 pb-4">
                      <span className="px-4 text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-50">Donate</span>
                  </div>
                  {extraItems.map((item) => (
                      <Link
                        key={item.name + 'extra'}
                        href={item.href}
                        className="flex items-center gap-4 px-4 py-2.5 rounded-2xl transition-all group text-muted-foreground/60 hover:text-foreground hover:bg-muted/30"
                      >
                        <item.icon size={18} className="group-hover:text-brand-primary transition-colors" />
                        <span className="font-bold uppercase text-[10px] tracking-[0.2em]">{item.name}</span>
                      </Link>
                  ))}
                </>
             )}
          </nav>

          {/* FOOTER / LOGOUT */}
          <div className="p-6 border-t border-border/50">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className={`flex items-center gap-3 w-full p-4 text-muted-foreground hover:text-red-500 hover:bg-red-500/5 transition-all group ${isPro ? 'rounded-2xl' : 'rounded-lg'}`}
            >
              <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="font-bold uppercase tracking-[0.2em] text-[10px]">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
