"use client"

import * as React from "react"
import { Moon, Sun, Sparkles } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Use useEffect to ensure we only render the toggle on the client
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Avoid hydration mismatch by not rendering anything until mounted
  if (!mounted) {
    return (
        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse border border-zinc-200 dark:border-zinc-800" />
    )
  }

  const toggleTheme = () => {
    // Definimos o próximo tema explicitamente
    let nextTheme = "light"
    if (theme === "light") nextTheme = "dark"
    else if (theme === "dark") nextTheme = "pro"
    else nextTheme = "light"
    
    setTheme(nextTheme)
  }

  // Cores dinâmicas para o botão baseadas no tema ATUAL
  const getButtonStyles = () => {
    switch(theme) {
      case 'light': return 'bg-white border-zinc-200 text-yellow-500 shadow-yellow-500/10'
      case 'dark': return 'bg-zinc-900 border-zinc-800 text-purple-400 shadow-purple-500/10'
      case 'pro': return 'bg-[#0f172a] border-[#38bdf8]/30 text-[#ccff00] shadow-[#ccff00]/20'
      default: return 'bg-card border-border text-foreground'
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className={`relative p-3 rounded-2xl border transition-all active:scale-90 group shadow-lg z-50 cursor-pointer flex items-center justify-center h-12 w-12 ${getButtonStyles()}`}
      aria-label="Alternar Tema"
    >
      <div className="relative z-10 transition-transform duration-500 group-hover:scale-110">
          {theme === "light" && <Sun size={22} className="animate-in fade-in zoom-in duration-300" />}
          {theme === "dark" && <Moon size={22} className="animate-in fade-in zoom-in duration-300" />}
          {theme === "pro" && <Sparkles size={22} className="animate-in fade-in zoom-in duration-300" />}
          {/* Caso caia no tema 'system' ou indefinido momentaneamente */}
          {!['light', 'dark', 'pro'].includes(theme || '') && <Sun size={22} />}
      </div>
      
      {/* Glow Effect dinâmico */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-lg -z-10
        ${theme === 'light' ? 'bg-yellow-400' : ''}
        ${theme === 'dark' ? 'bg-purple-500' : ''}
        ${theme === 'pro' ? 'bg-[#ccff00]' : ''}
      `} />
    </button>
  )
}
