"use client"

import type React from "react"
import { Heart, ShoppingCart, Star, Zap, Eye } from "lucide-react"
import type { Product } from "../types"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"

interface ProductCardProps {
  product: Product
  onViewDetails: (product: Product) => void
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { addToCart, addToFavorites, removeFromFavorites, favorites } = useCart()
  const { user } = useAuth()
  const isFavorite = favorites.some((fav) => fav.id === product.id)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (user?.isAdmin) {
      alert("Los administradores no pueden agregar favoritos")
      return
    }
    if (isFavorite) {
      removeFromFavorites(product.id)
    } else {
      addToFavorites(product)
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (user?.isAdmin) {
      alert("Los administradores no pueden agregar productos al carrito")
      return
    }
    addToCart(product)
  }

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 transform hover:-translate-y-2 hover:scale-[1.02] w-full max-w-[280px]">
      <div className="relative overflow-hidden aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={() => onViewDetails(product)}
            className="p-2.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            title="Ver detalles"
          >
            <Eye className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          {!user?.isAdmin && (
            <button
              onClick={handleFavoriteClick}
              className="p-2.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
              title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
            >
              <Heart
                className={`w-5 h-5 transition-all duration-300 ${
                  isFavorite ? "fill-red-500 text-red-500 scale-110" : "text-gray-700 dark:text-gray-300"
                }`}
              />
            </button>
          )}
        </div>

        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.discount && (
            <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1 animate-pulse">
              -{product.discount}%
            </span>
          )}
          {product.featured && (
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current" />
              TOP
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.floor(product.rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600"
              }`}
            />
          ))}
          <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">({product.reviews})</span>
        </div>

        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-tight">
          {product.name}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{product.category}</p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-red-600">S/ {product.price}</span>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide ${
              product.inStock
                ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30"
                : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30"
            }`}
          >
            {product.inStock ? "En stock" : "Agotado"}
          </span>
        </div>

        {!user?.isAdmin && (
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Agregar al Carrito
          </button>
        )}
      </div>
    </div>
  )
}
