"use client"

import type React from "react"
import { X, Plus, Minus, Trash2, ShoppingBag, Heart } from "lucide-react"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { CheckoutModal } from "./CheckoutModal"
import { useState } from "react"

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart, favorites, removeFromFavorites, addToCart } =
    useCart()
  const { user } = useAuth()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"cart" | "favorites">("cart")

  if (!isOpen) return null

  const handleProceedToCheckout = () => {
    if (!user) {
      alert("Debes iniciar sesión para proceder con la compra")
      onClose()
      return
    }

    if (user.isAdmin) {
      alert("Los administradores no pueden realizar compras")
      return
    }

    setIsCheckoutOpen(true)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

        <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {activeTab === "cart" ? "Carrito" : "Favoritos"}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("cart")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    activeTab === "cart"
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 inline mr-1" />
                  {items.length}
                </button>
                <button
                  onClick={() => setActiveTab("favorites")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    activeTab === "favorites"
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <Heart className="w-4 h-4 inline mr-1" />
                  {favorites.length}
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "cart" ? (
              // Cart Items
              items.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <ShoppingBag className="mx-auto h-16 w-16" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Tu carrito está vacío</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Agrega productos para comenzar tu compra
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-600"
                    >
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg shadow-md"
                      />

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{item.name}</h3>
                        <p className="text-red-600 dark:text-red-400 font-bold text-lg">
                          ${item.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Subtotal: ${(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg p-1 shadow-inner">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>

                          <span className="w-8 text-center font-bold text-gray-900 dark:text-white">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : // Favorites Items
            favorites.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Heart className="mx-auto h-16 w-16" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No tienes favoritos</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Guarda productos que te gusten aquí</p>
              </div>
            ) : (
              <div className="space-y-4">
                {favorites.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-red-200 dark:border-red-800"
                  >
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg shadow-md"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{item.name}</h3>
                      <p className="text-red-600 dark:text-red-400 font-bold text-lg">${item.price.toLocaleString()}</p>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full inline-block mt-1 ${
                          item.inStock
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {item.inStock ? "En Stock" : "Agotado"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {!user?.isAdmin && (
                        <button
                          onClick={() => addToCart(item)}
                          disabled={!item.inStock}
                          className="p-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-md"
                        >
                          <ShoppingBag className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => removeFromFavorites(item.id)}
                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {activeTab === "cart" && items.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-6 space-y-4 bg-gray-50 dark:bg-gray-800">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${getTotalPrice().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Envío:</span>
                  <span className="font-semibold text-green-600">Gratis</span>
                </div>
                <div className="border-t border-gray-300 dark:border-gray-600 pt-2 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Total:</span>
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                    ${getTotalPrice().toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={clearCart}
                className="text-sm text-red-500 hover:text-red-700 transition-colors w-full text-center py-2"
              >
                Vaciar carrito
              </button>

              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Proceder al Pago
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </>
  )
}
