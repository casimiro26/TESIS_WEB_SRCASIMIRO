"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { ThemeContextType } from "../types"

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("sr-robot-theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark")
    } else {
      setIsDarkMode(prefersDark)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
    localStorage.setItem("sr-robot-theme", isDarkMode ? "dark" : "light")
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev)
  }

  const value: ThemeContextType = {
    isDarkMode,
    toggleTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}