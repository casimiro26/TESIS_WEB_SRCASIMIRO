"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { CartContextType, CartItem, Product } from "../types"

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const [favorites, setFavorites] = useState<Product[]>([])

  useEffect(() => {
    const savedCart = localStorage.getItem("sr-robot-cart")
    const savedFavorites = localStorage.getItem("sr-robot-favorites")

    if (savedCart) {
      setItems(JSON.parse(savedCart))
    }
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("sr-robot-cart", JSON.stringify(items))
  }, [items])

  useEffect(() => {
    localStorage.setItem("sr-robot-favorites", JSON.stringify(favorites))
  }, [favorites])

  const addToCart = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setItems((prev) => prev.map((item) => (item.id === productId ? { ...item, quantity } : item)))
  }

  const addToFavorites = (product: Product) => {
    setFavorites((prev) => {
      const exists = prev.find((fav) => fav.id === product.id)
      if (exists) return prev
      return [...prev, product]
    })
  }

  const removeFromFavorites = (productId: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== productId))
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const value: CartContextType = {
    items,
    favorites,
    addToCart,
    removeFromCart,
    updateQuantity,
    addToFavorites,
    removeFromFavorites,
    clearCart,
    getTotalPrice,
    getTotalItems,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
