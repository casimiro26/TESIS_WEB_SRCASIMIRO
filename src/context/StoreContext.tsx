"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { products as initialProducts } from "../data/products"
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
}

interface StoreContextType {
  products: Product[]
  orders: Order[]
  addProduct: (product: Omit<Product, "id">) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  addOrder: (order: Omit<Order, "id" | "date" | "hasReceipt">) => void
  updateOrder: (id: number, order: Partial<Order>) => void
  confirmReceipt: (orderId: number) => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const savedProducts = localStorage.getItem("sr-robot-products")
    const savedOrders = localStorage.getItem("sr-robot-orders")

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts))
    } else {
      setProducts(initialProducts)
      localStorage.setItem("sr-robot-products", JSON.stringify(initialProducts))
    }

    if (savedOrders) {
      setOrders(JSON.parse(savedOrders))
    }
  }, [])

  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem("sr-robot-products", JSON.stringify(products))
      window.dispatchEvent(new CustomEvent("products-updated", { detail: products }))
    }
  }, [products])

  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem("sr-robot-orders", JSON.stringify(orders))
      window.dispatchEvent(new CustomEvent("orders-updated", { detail: orders }))
    }
  }, [orders])

  useEffect(() => {
    const handleProductsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent
      setProducts(customEvent.detail)
    }

    const handleOrdersUpdate = (e: Event) => {
      const customEvent = e as CustomEvent
      setOrders(customEvent.detail)
    }

    window.addEventListener("products-updated", handleProductsUpdate)
    window.addEventListener("orders-updated", handleOrdersUpdate)

    return () => {
      window.removeEventListener("products-updated", handleProductsUpdate)
      window.removeEventListener("orders-updated", handleOrdersUpdate)
    }
  }, [])

  const addProduct = (product: Omit<Product, "id">) => {
    const newId = String(Math.max(...products.map((p) => Number(p.id)), 0) + 1)
    const newProduct: Product = {
      ...product,
      id: newId,
    }
    setProducts((prev) => [...prev, newProduct])
  }

  const updateProduct = (id: string, updatedProduct: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedProduct } : p)))
  }

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const addOrder = (order: Omit<Order, "id" | "date" | "hasReceipt">) => {
    const newId = Math.max(...orders.map((o) => o.id), 0) + 1
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

  const value: StoreContextType = {
    products,
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
    addOrder,
    updateOrder,
    confirmReceipt,
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
