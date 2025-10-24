"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { CartContextType, CartItem, Product } from "../types"
import { useAuth } from "../context/AuthContext"

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const [favorites, setFavorites] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  // API base URL
  const API_BASE = "https://api-web-egdy.onrender.com/api"

  // Función para hacer requests autenticados
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("sr-robot-token")
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Cargar carrito desde el backend cuando el usuario cambie
  useEffect(() => {
    if (user) {
      // Usuario autenticado: cargar desde backend
      loadCartFromBackend()
      loadFavoritesFromBackend()
    } else {
      // Usuario no autenticado: NO cargar carrito persistente
      // Solo mantener en memoria durante la sesión actual
      setItems([])
    }
  }, [user])

  // Cargar carrito desde backend
  const loadCartFromBackend = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const data = await authFetch("/cart")
      // Transformar la respuesta del backend al formato que espera tu frontend
      const transformedItems = data.items.map((item: any) => ({
        id: item.productoId.toString(),
        id_producto: item.productoId,
        name: item.name,
        category: "", // Se puede obtener si está disponible en la API
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        inStock: item.inStock,
        productCode: item.productCode,
        description: "", // Campos opcionales
        characteristics: "",
        rating: 4.5,
        reviews: 0,
        featured: false,
        reviewsList: []
      }))
      setItems(transformedItems)
    } catch (error) {
      console.error("Error loading cart from backend:", error)
      setItems([]) // En caso de error, vaciar carrito
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar favoritos desde backend (si tienes endpoints para favoritos)
  const loadFavoritesFromBackend = async () => {
    if (!user) return

    try {
      // Por ahora mantenemos localStorage para favoritos
      const savedFavorites = localStorage.getItem("sr-robot-favorites")
      if (savedFavorites) {
        const parsedFavorites = JSON.parse(savedFavorites)
        setFavorites(parsedFavorites)
      }
    } catch (error) {
      console.error("Error loading favorites:", error)
    }
  }

  // Migrar carrito temporal a usuario autenticado
  const migrateGuestCart = async (guestItems: CartItem[]) => {
    if (!user || guestItems.length === 0) return

    try {
      // Agregar cada item del carrito temporal al carrito del usuario
      for (const item of guestItems) {
        await addToCartBackend({
          id: item.id,
          id_producto: parseInt(item.id),
          name: item.name,
          category: item.category || "",
          price: item.price,
          image: item.image,
          inStock: item.inStock,
          productCode: item.productCode || "",
          description: item.description || "",
          characteristics: item.characteristics || "",
          rating: item.rating || 4.5,
          reviews: item.reviews || 0,
          featured: item.featured || false,
          reviewsList: item.reviewsList || []
        }, item.quantity)
      }
      
      console.log("Carrito temporal migrado exitosamente al usuario")
    } catch (error) {
      console.error("Error migrating guest cart:", error)
    }
  }

  // Agregar al carrito en el backend
  const addToCartBackend = async (product: Product, quantity: number = 1) => {
    if (!user) {
      // Si no hay usuario, agregar al carrito temporal (solo en memoria)
      addToCartTemporal(product)
      return
    }

    try {
      setIsLoading(true)
      await authFetch("/cart", {
        method: "POST",
        body: JSON.stringify({
          productoId: product.id_producto || parseInt(product.id),
          cantidad: quantity
        })
      })
      // Recargar el carrito desde el backend para asegurar consistencia
      await loadCartFromBackend()
    } catch (error) {
      console.error("Error adding to cart in backend:", error)
      // Fallback al carrito temporal en caso de error
      addToCartTemporal(product)
    } finally {
      setIsLoading(false)
    }
  }

  // Agregar al carrito temporal (para usuarios no autenticados - solo en memoria)
  const addToCartTemporal = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      let newItems: CartItem[]
      
      if (existing) {
        newItems = prev.map((item) => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      } else {
        newItems = [...prev, { 
          ...product, 
          quantity: 1 
        }]
      }
      
      // IMPORTANTE: NO guardar en localStorage para invitados
      // El carrito temporal solo existe durante esta sesión
      
      return newItems
    })
  }

  // Actualizar cantidad en el backend
  const updateQuantityBackend = async (productId: string, quantity: number) => {
    if (!user) {
      updateQuantityTemporal(productId, quantity)
      return
    }

    try {
      setIsLoading(true)
      
      if (quantity <= 0) {
        await removeFromCartBackend(productId)
        return
      }

      // Primero necesitamos obtener el id_carrito del item
      const cartData = await authFetch("/cart")
      const cartItem = cartData.items.find((item: any) => 
        item.productoId.toString() === productId
      )
      
      if (cartItem) {
        await authFetch(`/cart/${cartItem.id}`, {
          method: "PUT",
          body: JSON.stringify({ cantidad: quantity })
        })
        await loadCartFromBackend()
      }
    } catch (error) {
      console.error("Error updating quantity in backend:", error)
      updateQuantityTemporal(productId, quantity)
    } finally {
      setIsLoading(false)
    }
  }

  // Actualizar cantidad temporal
  const updateQuantityTemporal = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCartTemporal(productId)
      return
    }

    setItems((prev) => {
      const newItems = prev.map((item) => 
        item.id === productId ? { ...item, quantity } : item
      )
      
      return newItems
    })
  }

  // Eliminar del carrito en el backend
  const removeFromCartBackend = async (productId: string) => {
    if (!user) {
      removeFromCartTemporal(productId)
      return
    }

    try {
      setIsLoading(true)
      
      // Primero necesitamos obtener el id_carrito del item
      const cartData = await authFetch("/cart")
      const cartItem = cartData.items.find((item: any) => 
        item.productoId.toString() === productId
      )
      
      if (cartItem) {
        await authFetch(`/cart/${cartItem.id}`, {
          method: "DELETE"
        })
        await loadCartFromBackend()
      }
    } catch (error) {
      console.error("Error removing from cart in backend:", error)
      removeFromCartTemporal(productId)
    } finally {
      setIsLoading(false)
    }
  }

  // Eliminar del carrito temporal
  const removeFromCartTemporal = (productId: string) => {
    setItems((prev) => {
      const newItems = prev.filter((item) => item.id !== productId)
      return newItems
    })
  }

  // Vaciar carrito en el backend
  const clearCartBackend = async () => {
    if (!user) {
      clearCartTemporal()
      return
    }

    try {
      setIsLoading(true)
      await authFetch("/cart", {
        method: "DELETE"
      })
      setItems([])
    } catch (error) {
      console.error("Error clearing cart in backend:", error)
      clearCartTemporal()
    } finally {
      setIsLoading(false)
    }
  }

  // Vaciar carrito temporal
  const clearCartTemporal = () => {
    setItems([])
  }

  // Funciones principales que exporta el contexto
  const addToCart = (product: Product) => {
    return addToCartBackend(product, 1)
  }

  const removeFromCart = (productId: string) => {
    return removeFromCartBackend(productId)
  }

  const updateQuantity = (productId: string, quantity: number) => {
    return updateQuantityBackend(productId, quantity)
  }

  const clearCart = () => {
    return clearCartBackend()
  }

  // Funciones para favoritos (mantenemos localStorage por ahora)
  const addToFavorites = (product: Product) => {
    setFavorites((prev) => {
      const exists = prev.find((fav) => fav.id === product.id)
      if (exists) return prev
      const newFavorites = [...prev, product]
      // Favoritos sí se guardan en localStorage para todos los usuarios
      localStorage.setItem("sr-robot-favorites", JSON.stringify(newFavorites))
      return newFavorites
    })
  }

  const removeFromFavorites = (productId: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.filter((fav) => fav.id !== productId)
      localStorage.setItem("sr-robot-favorites", JSON.stringify(newFavorites))
      return newFavorites
    })
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
    isLoading,
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