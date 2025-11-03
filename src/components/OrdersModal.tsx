"use client"

import type React from "react"
import { X, ShoppingCart, Package, Truck, CheckCircle, Clock, CreditCard } from "lucide-react"
import { useStore } from "../context/StoreContext"
import { useAuth } from "../context/AuthContext"
import { useEffect } from "react"

interface OrdersModalProps {
  isOpen: boolean
  onClose: () => void
}

export const OrdersModal: React.FC<OrdersModalProps> = ({ isOpen, onClose }) => {
  const { loadUserOrders, userOrders } = useStore()
  const { user } = useAuth()

  useEffect(() => {
    if (isOpen && user) {
      loadUserOrders()
    }
  }, [isOpen, user, loadUserOrders])

  if (!isOpen) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-blue-500" />
      case "shipped":
        return <Truck className="w-5 h-5 text-purple-500" />
      case "delivered":
        return <Package className="w-5 h-5 text-green-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "confirmed":
        return "Confirmado"
      case "shipped":
        return "Enviado"
      case "delivered":
        return "Entregado"
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "confirmed":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case "shipped":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
      case "delivered":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getPaymentMethodIcon = (method?: string) => {
    switch (method) {
      case "stripe":
        return <CreditCard className="w-4 h-4 text-purple-500" />
      case "transfer":
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      default:
        return null
    }
  }

  const getPaymentMethodText = (method?: string) => {
    switch (method) {
      case "stripe":
        return "Stripe"
      case "transfer":
        return "Transferencia"
      default:
        return "No especificado"
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mis Pedidos</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">{userOrders.length} pedidos realizados</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {userOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <ShoppingCart className="mx-auto h-16 w-16" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No tienes pedidos</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Tus compras aparecerán aquí una vez que realices un pedido
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {userOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-600 overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Pedido #{order.id}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{order.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>
                    {order.paymentMethod && (
                      <div className="flex items-center gap-2 mt-2">
                        {getPaymentMethodIcon(order.paymentMethod)}
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          Pagado con {getPaymentMethodText(order.paymentMethod)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="p-4 space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <img
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-lg shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Cantidad: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-red-600 dark:text-red-400">
                          S/ {(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total:</span>
                      <span className="text-lg font-bold text-red-600 dark:text-red-400">
                        S/ {order.total.toFixed(2)}
                      </span>
                    </div>
                    {order.hasReceipt && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>Comprobante verificado</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}