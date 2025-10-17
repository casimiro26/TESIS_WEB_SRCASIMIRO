"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Product } from "../types"

export interface Customer {
  name: string
  email: string
  phone: string
  address: string
  dni: string
}

export interface Order {
  id: number
  customer: Customer
  items: Array<{
    product: Product
    quantity: number
  }>
  date: string
  total: number
  hasReceipt: boolean
  receiptUrl?: string
  status: "pending" | "confirmed" | "shipped" | "delivered"
  paymentMethod?: "stripe" | "transfer"
  stripePaymentId?: string
}

interface StoreContextType {
  products: Product[]
  orders: Order[]
  loading: boolean
  error: string | null
  addProduct: (product: Omit<Product, "id">) => Promise<boolean>
  updateProduct: (id: string, product: Partial<Product>) => Promise<boolean>
  deleteProduct: (id: string) => Promise<boolean>
  addOrder: (order: Omit<Order, "id" | "date" | "hasReceipt">) => void
  updateOrder: (id: number, order: Partial<Order>) => void
  confirmReceipt: (orderId: number) => void
  loadProducts: () => Promise<void>
  clearError: () => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

// Función para obtener el token de autenticación
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("sr-robot-token")
  }
  return null
}

// Función para normalizar producto de API a frontend
const normalizeProductFromAPI = (apiProduct: any): Product => {
  return {
    id: apiProduct.id_producto?.toString() || apiProduct._id || apiProduct.id,
    id_producto: apiProduct.id_producto,
    name: apiProduct.nombre || apiProduct.name,
    category: apiProduct.categoria || apiProduct.category,
    price: apiProduct.price,
    originalPrice: apiProduct.originalPrice,
    discount: apiProduct.discount,
    image: apiProduct.image,
    description: apiProduct.description,
    characteristics: apiProduct.characteristics || "",
    productCode: apiProduct.productCode || "",
    rating: apiProduct.rating || 4.5,
    reviews: apiProduct.reviews || 0,
    inStock: apiProduct.inStock !== undefined ? apiProduct.inStock : true,
    featured: apiProduct.featured || false,
    reviewsList: apiProduct.reviewsList || [],
    createdAt: apiProduct.createdAt
  }
}

// Función para normalizar producto a formato API
const normalizeProductToAPI = (product: Omit<Product, "id"> | Partial<Product>) => {
  return {
    nombre: product.name,
    categoria: product.category,
    price: product.price,
    originalPrice: product.originalPrice,
    discount: product.discount,
    image: product.image,
    description: product.description,
    characteristics: product.characteristics,
    productCode: product.productCode,
    inStock: product.inStock
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Productos de ejemplo para testing
  const sampleProducts: Product[] = [
    {
      id: "1",
      id_producto: 1,
      name: "Laptop Gaming HP Omen",
      category: "Laptops",
      price: 3200,
      originalPrice: 3800,
      discount: 16,
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500",
      description: "Laptop gaming de alto rendimiento para jugadores profesionales",
      characteristics: "RTX 4060, 16GB RAM, 1TB SSD, Intel i7-13700H",
      productCode: "LAP001",
      rating: 4.8,
      reviews: 124,
      inStock: true,
      featured: true,
      reviewsList: []
    },
    {
      id: "2",
      id_producto: 2,
      name: "Teclado Mecánico RGB",
      category: "Periféricos",
      price: 189,
      originalPrice: 220,
      discount: 14,
      image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500",
      description: "Teclado mecánico con retroiluminación RGB personalizable",
      characteristics: "Switches Blue, Anti-ghosting, USB-C",
      productCode: "TEC001",
      rating: 4.5,
      reviews: 89,
      inStock: true,
      featured: false,
      reviewsList: []
    },
    {
      id: "3",
      id_producto: 3,
      name: "Monitor Curvo 27\"",
      category: "Monitores",
      price: 850,
      originalPrice: 999,
      discount: 15,
      image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500",
      description: "Monitor curvo gaming con alta tasa de refresco",
      characteristics: "165Hz, 1ms, QHD, FreeSync",
      productCode: "MON001",
      rating: 4.7,
      reviews: 67,
      inStock: true,
      featured: true,
      reviewsList: []
    },
    {
      id: "4",
      id_producto: 4,
      name: "Mouse Inalámbrico",
      category: "Periféricos",
      price: 95,
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
      description: "Mouse ergonómico inalámbrico para gaming",
      characteristics: "16000 DPI, 6 botones, 50h batería",
      productCode: "MOU001",
      rating: 4.3,
      reviews: 156,
      inStock: true,
      featured: false,
      reviewsList: []
    }
  ]

  // Cargar productos desde la API o usar datos de ejemplo
  const loadProducts = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      const token = getAuthToken()
      if (!token) {
        console.log("🔐 No hay token, usando productos de ejemplo...")
        setProducts(sampleProducts)
        localStorage.setItem("sr-robot-products", JSON.stringify(sampleProducts))
        return
      }

      const response = await fetch("https://api-web-egdy.onrender.com/api/productos", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (response.status === 401 || response.status === 403) {
        console.log("🔐 Token inválido, usando productos de ejemplo")
        setProducts(sampleProducts)
        localStorage.setItem("sr-robot-products", JSON.stringify(sampleProducts))
        return
      }

      if (!response.ok) {
        console.log("🌐 Error de conexión, usando productos locales")
        // Usar datos locales si hay error
        if (typeof window !== "undefined") {
          const savedProducts = localStorage.getItem("sr-robot-products")
          if (savedProducts) {
            setProducts(JSON.parse(savedProducts))
          } else {
            setProducts(sampleProducts)
          }
        }
        return
      }

      const apiProducts = await response.json()
      
      if (!Array.isArray(apiProducts)) {
        throw new Error("Invalid response format from server")
      }

      const normalizedProducts = apiProducts.map(normalizeProductFromAPI)
      
      setProducts(normalizedProducts)
      
      // Guardar en localStorage como backup
      if (typeof window !== "undefined") {
        localStorage.setItem("sr-robot-products", JSON.stringify(normalizedProducts))
      }
      
    } catch (err: any) {
      console.error("Error loading products:", err)
      // Usar datos locales en caso de error
      if (typeof window !== "undefined") {
        const savedProducts = localStorage.getItem("sr-robot-products")
        if (savedProducts) {
          setProducts(JSON.parse(savedProducts))
        } else {
          setProducts(sampleProducts)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  // Cargar productos al inicializar
  useEffect(() => {
    loadProducts()
  }, [])

  // Cargar órdenes desde localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedOrders = localStorage.getItem("sr-robot-orders")
      if (savedOrders) {
        try {
          setOrders(JSON.parse(savedOrders))
        } catch (error) {
          console.error("Error parsing saved orders:", error)
        }
      }
    }
  }, [])

  // Guardar órdenes en localStorage cuando cambien
  useEffect(() => {
    if (typeof window !== "undefined" && orders.length > 0) {
      localStorage.setItem("sr-robot-orders", JSON.stringify(orders))
    }
  }, [orders])

  // Agregar producto
  const addProduct = async (product: Omit<Product, "id">): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const token = getAuthToken()
      if (!token) {
        throw new Error("No authentication token found. Please log in.")
      }

      const productData = normalizeProductToAPI(product)
      
      console.log("🔄 Enviando producto a la API:", productData)

      const response = await fetch("https://api-web-egdy.onrender.com/api/productos", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(productData)
      })

      if (response.status === 401) {
        throw new Error("Authentication failed. Please log in again.")
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ mensaje: "Error creating product" }))
        console.error("❌ Error del servidor:", errorData)
        throw new Error(errorData.mensaje || `HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()
      console.log("✅ Respuesta del servidor:", responseData)
      
      const productFromResponse = responseData.product || responseData
      
      if (!productFromResponse) {
        console.error("❌ No hay datos de producto en la respuesta")
        throw new Error("Invalid response from server: no product data")
      }

      const normalizedProduct = normalizeProductFromAPI(productFromResponse)
      console.log("✅ Producto normalizado:", normalizedProduct)
      
      // Actualizar estado local
      setProducts(prev => {
        const updatedProducts = [...prev, normalizedProduct]
        console.log("🔄 Actualizando productos:", updatedProducts.length)
        return updatedProducts
      })
      
      // Actualizar localStorage
      if (typeof window !== "undefined") {
        const updatedProducts = [...products, normalizedProduct]
        localStorage.setItem("sr-robot-products", JSON.stringify(updatedProducts))
        console.log("💾 Guardado en localStorage")
      }
      
      return true
    } catch (err: any) {
      console.error("❌ Error adding product:", err)
      setError(err.message || "Error adding product")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Actualizar producto
  const updateProduct = async (id: string, updatedProduct: Partial<Product>): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const token = getAuthToken()
      if (!token) {
        throw new Error("No authentication token found. Please log in.")
      }

      // Para la API necesitamos el id_producto numérico
      const productToUpdate = products.find(p => p.id === id)
      if (!productToUpdate) {
        throw new Error("Product not found")
      }

      const productId = productToUpdate.id_producto
      if (!productId) {
        throw new Error("Product ID not found")
      }

      const productData = normalizeProductToAPI(updatedProduct)

      const response = await fetch(`https://api-web-egdy.onrender.com/api/productos/${productId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(productData)
      })

      if (response.status === 401) {
        throw new Error("Authentication failed. Please log in again.")
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ mensaje: "Error updating product" }))
        throw new Error(errorData.mensaje || `HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()
      const updatedProductData = responseData.product || updatedProduct

      // Actualizar estado local
      setProducts(prev => prev.map(p => 
        p.id === id ? { ...p, ...updatedProductData } : p
      ))

      // Actualizar localStorage
      if (typeof window !== "undefined") {
        const updatedProducts = products.map(p => 
          p.id === id ? { ...p, ...updatedProductData } : p
        )
        localStorage.setItem("sr-robot-products", JSON.stringify(updatedProducts))
      }
      
      return true
    } catch (err: any) {
      console.error("Error updating product:", err)
      setError(err.message || "Error updating product")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Eliminar producto
  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const token = getAuthToken()
      if (!token) {
        throw new Error("No authentication token found. Please log in.")
      }

      // Para la API necesitamos el id_producto numérico
      const productToDelete = products.find(p => p.id === id)
      if (!productToDelete) {
        throw new Error("Product not found")
      }

      const productId = productToDelete.id_producto
      if (!productId) {
        throw new Error("Product ID not found")
      }

      const response = await fetch(`https://api-web-egdy.onrender.com/api/productos/${productId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (response.status === 401) {
        throw new Error("Authentication failed. Please log in again.")
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ mensaje: "Error deleting product" }))
        throw new Error(errorData.mensaje || `HTTP error! status: ${response.status}`)
      }

      // Actualizar estado local
      setProducts(prev => prev.filter(p => p.id !== id))

      // Actualizar localStorage
      if (typeof window !== "undefined") {
        const updatedProducts = products.filter(p => p.id !== id)
        localStorage.setItem("sr-robot-products", JSON.stringify(updatedProducts))
      }
      
      return true
    } catch (err: any) {
      console.error("Error deleting product:", err)
      setError(err.message || "Error deleting product")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Órdenes
  const addOrder = (order: Omit<Order, "id" | "date" | "hasReceipt">) => {
    const newId = orders.length > 0 ? Math.max(...orders.map((o) => o.id), 0) + 1 : 1
    const newOrder: Order = {
      ...order,
      id: newId,
      date: new Date().toISOString().split("T")[0],
      hasReceipt: false,
      status: "pending",
    }
    setOrders((prev) => [...prev, newOrder])
  }

  const updateOrder = (id: number, updatedOrder: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updatedOrder } : o)))
  }

  const confirmReceipt = (orderId: number) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, hasReceipt: true } : o)))
  }

  const clearError = () => {
    setError(null)
  }

  const value: StoreContextType = {
    products,
    orders,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    addOrder,
    updateOrder,
    confirmReceipt,
    loadProducts,
    clearError,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore = () => {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return context
}