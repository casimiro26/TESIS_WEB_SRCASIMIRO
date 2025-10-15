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
      try {
        const parsedCart = JSON.parse(savedCart)
        // Asegurar que los IDs sean strings para compatibilidad
        const normalizedCart = parsedCart.map((item: any) => ({
          ...item,
          id: item.id.toString() // Convertir a string si es número
        }))
        setItems(normalizedCart)
      } catch (error) {
        console.error("Error parsing cart:", error)
        setItems([])
      }
    }
    if (savedFavorites) {
      try {
        const parsedFavorites = JSON.parse(savedFavorites)
        // Asegurar que los IDs sean strings para compatibilidad
        const normalizedFavorites = parsedFavorites.map((item: any) => ({
          ...item,
          id: item.id.toString() // Convertir a string si es número
        }))
        setFavorites(normalizedFavorites)
      } catch (error) {
        console.error("Error parsing favorites:", error)
        setFavorites([])
      }
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
      const existing = prev.find((item) => item.id === product.id.toString())
      if (existing) {
        return prev.map((item) => 
          item.id === product.id.toString() 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      }
      return [...prev, { 
        ...product, 
        id: product.id.toString(), // Asegurar string
        quantity: 1 
      }]
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

    setItems((prev) => 
      prev.map((item) => 
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const addToFavorites = (product: Product) => {
    setFavorites((prev) => {
      const exists = prev.find((fav) => fav.id === product.id.toString())
      if (exists) return prev
      return [...prev, { ...product, id: product.id.toString() }]
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