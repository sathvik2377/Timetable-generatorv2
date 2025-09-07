"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { motion } from "framer-motion"

// Fallback theme hook if next-themes is not available
let useTheme: any

try {
  const nextThemes = require("next-themes")
  useTheme = nextThemes.useTheme
} catch (error) {
  // Fallback hook
  useTheme = () => {
    const [theme, setThemeState] = React.useState('dark')

    const setTheme = (newTheme: string) => {
      setThemeState(newTheme)
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      } else {
        document.documentElement.classList.add('light')
        document.documentElement.classList.remove('dark')
      }
    }

    React.useEffect(() => {
      // Initialize theme
      const savedTheme = localStorage.getItem('theme') || 'dark'
      setTheme(savedTheme)
    }, [])

    React.useEffect(() => {
      localStorage.setItem('theme', theme)
    }, [theme])

    return { theme, setTheme }
  }
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-10 h-10 glass-card rounded-lg flex items-center justify-center">
        <div className="w-4 h-4 bg-gray-400 rounded-full animate-pulse" />
      </div>
    )
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-10 h-10 glass-card rounded-lg flex items-center justify-center transition-colors hover:bg-white/20 dark:hover:bg-white/5"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4 text-yellow-400" />
        ) : (
          <Moon className="h-4 w-4 text-blue-400" />
        )}
      </motion.div>
    </motion.button>
  )
}
