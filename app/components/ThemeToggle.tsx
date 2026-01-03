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
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("pro")
    else setTheme("light")
  }

  return (
    <button
      onClick={toggleTheme}
      className={`relative p-2.5 rounded-xl border transition-all active:scale-95 group shadow-lg z-50 cursor-pointer
        ${theme === 'light' ? 'bg-white border-zinc-200 hover:bg-zinc-100' : ''}
        ${theme === 'dark' ? 'bg-black/50 border-zinc-800 hover:bg-zinc-800' : ''}
        ${theme === 'pro' ? 'bg-[#0f172a]/80 border-[#38bdf8]/30 hover:bg-[#1e293b]' : ''}
      `}
      aria-label="Alternar Tema"
    >
      <div className="relative z-10">
          {theme === "light" ? (
             <Sun size={20} className="text-yellow-500 group-hover:rotate-90 transition-transform duration-500" />
          ) : theme === "dark" ? (
             <Moon size={20} className="text-purple-400 group-hover:-rotate-12 transition-transform duration-500" />
          ) : (
             <Sparkles size={20} className="text-[#ccff00] animate-pulse group-hover:scale-110 transition-transform duration-500" />
          )}
      </div>
      
      {/* Glow Effect */}
      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md
        ${theme === 'light' ? 'bg-yellow-400/20' : ''}
        ${theme === 'dark' ? 'bg-purple-500/10' : ''}
        ${theme === 'pro' ? 'bg-[#ccff00]/20' : ''}
      `} />
    </button>
  )
}
