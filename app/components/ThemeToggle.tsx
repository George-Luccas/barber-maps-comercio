"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-95 group shadow-lg"
      aria-label="Alternar Tema"
    >
      <div className="relative z-10 text-yellow-500 dark:text-yellow-400">
          {theme === "dark" ? (
             <Sun size={20} className="group-hover:rotate-90 transition-transform duration-500" />
          ) : (
             <Moon size={20} className="group-hover:-rotate-12 transition-transform duration-500 text-purple-600" />
          )}
      </div>
      
      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md bg-yellow-400/20 dark:bg-yellow-500/10" />
    </button>
  )
}
