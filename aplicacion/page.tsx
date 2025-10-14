"use client"

import { ThemeProvider } from "../src/context/ThemeContext"
import { AuthProvider } from "../src/context/AuthContext"
import { CartProvider } from "../src/context/CartContext"
import App from "../src/App"
import "../src/index.css"

export default function Page() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
