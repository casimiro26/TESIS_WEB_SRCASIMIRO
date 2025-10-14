"use client"

import type React from "react"
import { X, Heart, ShoppingCart, Trash2 } from "lucide-react"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"

interface FavoritesModalProps {
  isOpen: boolean
  onClose: () => void
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({ isOpen, onClose }) => {
  const { favorites, removeFromFavorites, addToCart } = useCart()
  const { user } = useAuth()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-red-600 fill-current" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mis Favoritos</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">{favorites.length} productos guardados</p>
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
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Heart className="mx-auto h-16 w-16" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No tienes favoritos</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Guarda productos que te gusten para verlos aquí
              </p>
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
                      {item.inStock ? "✓ En Stock" : "✗ Agotado"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {!user?.isAdmin && (
                      <button
                        onClick={() => addToCart(item)}
                        disabled={!item.inStock}
                        className="p-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-md"
                        title="Agregar al carrito"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => removeFromFavorites(item.id)}
                      className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Eliminar de favoritos"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
