"use client"

import * as React from "react"

// Fallback ThemeProvider if next-themes is not available
let NextThemesProvider: any
let ThemeProviderProps: any

try {
  const nextThemes = require("next-themes")
  NextThemesProvider = nextThemes.ThemeProvider
  ThemeProviderProps = nextThemes.ThemeProviderProps
} catch (error) {
  // Fallback provider
  NextThemesProvider = ({ children, ...props }: any) => {
    React.useEffect(() => {
      // Set default theme
      document.documentElement.classList.add('dark')
    }, [])

    return <>{children}</>
  }
}

interface ThemeProviderPropsType {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({ children, ...props }: ThemeProviderPropsType) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
