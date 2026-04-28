'use client'

import * as React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
  useTheme as useNextTheme,
} from 'next-themes'

// Types personnalisés
type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
  isDark: boolean
  isLight: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}

interface ExtendedThemeProviderProps extends ThemeProviderProps {
  enableSystem?: boolean
  storageKey?: string
  defaultTheme?: Theme
}

export function ThemeProvider({ 
  children, 
  enableSystem = true,
  storageKey = 'hinos-theme',
  defaultTheme = 'system',
  ...props 
}: ExtendedThemeProviderProps) {
  const [mounted, setMounted] = useState(false)

  // Éviter l'hydratation mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }}>
        <NextThemesProvider
          enableSystem={enableSystem}
          storageKey={storageKey}
          defaultTheme={defaultTheme}
          {...props}
        >
          {children}
        </NextThemesProvider>
      </div>
    )
  }

  return (
    <NextThemesProvider
      enableSystem={enableSystem}
      storageKey={storageKey}
      defaultTheme={defaultTheme}
      {...props}
    >
      <ThemeProviderInner>{children}</ThemeProviderInner>
    </NextThemesProvider>
  )
}

// Composant interne pour fournir le contexte
function ThemeProviderInner({ children }: { children: React.ReactNode }) {
  const { theme, setTheme, resolvedTheme } = useNextTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === 'dark'
  const isLight = resolvedTheme === 'light'

  const toggleTheme = () => {
    if (isDark) {
      setTheme('light')
    } else {
      setTheme('dark')
    }
  }

  const value: ThemeContextType = {
    theme: (theme as Theme) || 'system',
    setTheme,
    resolvedTheme: (resolvedTheme as 'light' | 'dark') || 'light',
    isDark,
    isLight,
    toggleTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook simplifié pour utiliser le thème
export function useTheme() {
  const context = useThemeContext()
  const { theme, setTheme, resolvedTheme, isDark, isLight, toggleTheme } = context
  return { theme, setTheme, resolvedTheme, isDark, isLight, toggleTheme }
}

// Composant ThemeToggle pour basculer facilement
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { isDark, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className={`w-9 h-9 rounded-lg bg-gray-200 animate-pulse ${className}`} />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${className}`}
      aria-label="Changer de thème"
    >
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 to-emerald-500 opacity-0 hover:opacity-100 transition-opacity" />
      <span className="relative z-10 text-lg">
        {isDark ? '☀️' : '🌙'}
      </span>
    </button>
  )
}

// Composant ThemeSelector avec options
export function ThemeSelector({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-24 h-9 bg-gray-200 rounded-lg animate-pulse" />
  }

  const themes: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: 'Clair', icon: '☀️' },
    { value: 'dark', label: 'Sombre', icon: '🌙' },
    { value: 'system', label: 'Système', icon: '💻' },
  ]

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        <span>{themes.find(t => t.value === theme)?.icon || '🎨'}</span>
        <span>{themes.find(t => t.value === theme)?.label || 'Thème'}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  setTheme(t.value)
                  setOpen(false)
                }}
                className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                  theme === t.value ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : ''
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
                {theme === t.value && (
                  <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
