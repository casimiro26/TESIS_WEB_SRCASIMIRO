"use client"

import { useState, useMemo, useEffect } from "react"
import { Header } from "./components/Header"
import { HeroCarousel } from "./components/HeroCarousel"
import { ProductsCarousel } from "./components/ProductsCarousel"
import { AuthModal } from "./components/AuthModal"
import { AdminDashboard } from "./components/AdminDashboard"
import { Footer } from "./components/Footer"
import { Loader } from "./components/Loader"
import { useStore } from "./context/StoreContext"
import type { Product } from "./types"
import { Grid, List, SlidersHorizontal, Heart, ShoppingCart, X, Truck, Shield, RotateCcw, Eye } from "lucide-react"
import { useCart } from "./context/CartContext"
import { useAuth } from "./context/AuthContext"

interface Review {
  id_review: number  // Cambiado de 'id' a 'id_review'
  userName: string
  rating: number
  text: string
  likes: number
  likedBy: string[]
}

function App() {
  const { products } = useStore()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [reviews, setReviews] = useState<{ [productId: number]: Review[] }>({})
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 0, text: "" })
  const [reviewError, setReviewError] = useState("")

  const API_BASE_URL = "https://api-web-egdy.onrender.com"

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 })
  const [showInStockOnly, setShowInStockOnly] = useState(false)
  const [authModal, setAuthModal] = useState<{ type: "login" | "register"; isOpen: boolean }>({
    type: "login",
    isOpen: false,
  })
  const [showAdmin, setShowAdmin] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState<"descripcion" | "caracteristicas" | "resenas">("descripcion")

  const { addToCart, addToFavorites, removeFromFavorites, favorites } = useCart()

  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category))).sort()
  }, [products])

  // Fetch reviews when selectedProduct changes
  useEffect(() => {
    if (selectedProduct) {
      fetchReviews(selectedProduct.id)
      setNewReview({ rating: 0, text: "" })
      setReviewError("")
    }
  }, [selectedProduct])

  const fetchReviews = async (productId: number) => {
    if (!productId) return
    setLoadingReviews(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/${productId}`)
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      setReviews(prev => ({ ...prev, [productId]: data.reviews || [] }))
    } catch (error) {
      console.error("Error fetching reviews:", error)
      setReviewError("Error al cargar reseñas")
    } finally {
      setLoadingReviews(false)
    }
  }

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
    setActiveTab("descripcion")
  }

  const handleSubmitReview = async (productId: number) => {
    if (!user) {
      setAuthModal({ type: "login", isOpen: true })
      return
    }
    if (newReview.rating < 1 || newReview.rating > 5) {
      setReviewError("Por favor selecciona una calificación entre 1 y 5 estrellas")
      return
    }
    if (!user.token) {
      setReviewError("Sesión expirada. Inicia sesión nuevamente.")
      setAuthModal({ type: "login", isOpen: true })
      return
    }
    
    setSubmittingReview(true)
    setReviewError("")
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({
          rating: newReview.rating,
          text: newReview.text.trim() || "Sin comentario"
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.mensaje || `Error ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      setNewReview({ rating: 0, text: "" })
      await fetchReviews(productId)
      
      console.log("Reseña enviada exitosamente:", result)
      
    } catch (error: any) {
      console.error("Error submitting review:", error)
      setReviewError(error.message || "Error al enviar reseña")
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleToggleLike = async (productId: number, reviewId: number) => {
    if (!user || !user.token) {
      setAuthModal({ type: "login", isOpen: true })
      return
    }
    
    // Verificar que el reviewId sea válido
    if (!reviewId || isNaN(reviewId)) {
      console.error("ID de reseña inválido:", reviewId)
      setReviewError("ID de reseña inválido")
      return
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/${productId}/${reviewId}/like`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.mensaje || `Error ${response.status}: ${response.statusText}`)
      }
      
      await fetchReviews(productId)
    } catch (error: any) {
      console.error("Error toggling like:", error)
      setReviewError(error.message || "Error al dar like")
    }
  }

  // Función para verificar si el usuario actual dio like a una reseña
  const hasUserLiked = (review: Review) => {
    return user && review.likedBy.includes(user.id.toString())
  }

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !selectedCategory || product.category === selectedCategory
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max
      const matchesStock = !showInStockOnly || product.inStock

      return matchesSearch && matchesCategory && matchesPrice && matchesStock
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "rating":
          return b.rating - a.rating
        case "name":
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }, [products, searchTerm, selectedCategory, sortBy, priceRange, showInStockOnly])

  const productRows = useMemo(() => {
    const rows = []
    const firstRow = filteredProducts.slice(0, 6)
    if (firstRow.length > 0) {
      rows.push(firstRow)
    }
    for (let i = 6; i < filteredProducts.length; i += 5) {
      rows.push(filteredProducts.slice(i, i + 5))
    }
    return rows
  }, [filteredProducts])

  if (isLoading) {
    return <Loader isLoading={isLoading} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Header
        onCategoryChange={setSelectedCategory}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onShowAuth={(type) => setAuthModal({ type, isOpen: true })}
        onShowAdmin={() => setShowAdmin(true)}
      />

      <HeroCarousel />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtros
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vista:</span>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "grid"
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "list"
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                >
                  <option value="name">Ordenar por Nombre</option>
                  <option value="price-low">Precio: Menor a Mayor</option>
                  <option value="price-high">Precio: Mayor a Menor</option>
                  <option value="rating">Mejor Calificación</option>
                </select>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredProducts.length} productos encontrados
                </div>
              </div>
            </div>

            {showFilters && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rango de Precio (S/)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="0.01"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange((prev) => ({ ...prev, min: Number(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        step="0.01"
                        min="0.01"
                        max="10000"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        placeholder="10000.00"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange((prev) => ({ ...prev, max: Number(e.target.value) || 10000 }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        step="0.01"
                        min="0.01"
                        max="10000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categoría</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Todas las categorías</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={showInStockOnly}
                        onChange={(e) => setShowInStockOnly(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Solo productos en stock
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Productos</h2>
            {productRows.map((row, rowIndex) => (
              <div key={`row-${rowIndex}`} className="mb-8">
                {rowIndex === 0 ? (
                  <ProductsCarousel
                    products={row}
                    onViewDetails={handleViewProduct}
                  />
                ) : (
                  <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5" : "grid-cols-1"}`}>
                    {row.map((product) => (
                      <div
                        key={`product-${product.id}`}
                        className="bg-white dark:bg-gray-700 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-600 overflow-hidden relative group hover:shadow-[0_0_15px_rgba(255,0,0,0.5)]"
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          {product.discount && (
                            <span className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                              -{product.discount}% OFF
                            </span>
                          )}
                          <div className="absolute top-4 right-4 flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!user || user.isAdmin) {
                                  return;
                                } else {
                                  const isFav = favorites.some((fav) => fav.id === product.id);
                                  if (isFav) {
                                    removeFromFavorites(product.id);
                                  } else {
                                    addToFavorites(product);
                                  }
                                }
                              }}
                              className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Heart
                                className={`w-6 h-6 ${favorites.some((fav) => fav.id === product.id) ? "text-red-600 fill-current" : "text-gray-600 dark:text-gray-300"}`}
                              />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProduct(product);
                              }}
                              className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Eye className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                            </button>
                          </div>
                        </div>
                        <div className="p-4 space-y-2">
                          <span className="inline-block text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full uppercase tracking-wide">
                            {product.category}
                          </span>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{product.name}</h3>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={`star-${product.id}-${i}`}
                                className={`text-base ${i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                              >
                                ★
                              </span>
                            ))}
                            <span className="text-xs text-gray-600 dark:text-gray-400">({product.reviews})</span>
                          </div>
                          <div>
                            <span
                              className={`text-xs font-medium ${product.inStock ? "text-green-600" : "text-red-600"}`}
                            >
                              {product.inStock ? "En Stock" : "Agotado"}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-red-600">S/ {product.price.toFixed(2)}</span>
                            {product.originalPrice && (
                              <span className="text-xs text-gray-500 line-through">S/ {product.originalPrice.toFixed(2)}</span>
                            )}
                          </div>
                          {!user?.isAdmin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!user) {
                                  setAuthModal({ type: "login", isOpen: true });
                                } else {
                                  addToCart(product);
                                }
                              }}
                              disabled={!product.inStock}
                              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                            >
                              <ShoppingCart className="w-5 h-5" />
                              Agregar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No se encontraron productos</h3>
                <p className="text-gray-500 dark:text-gray-400">Intenta ajustar tus filtros de búsqueda</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-6xl transform animate-in slide-in-from-bottom-8 duration-500 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10 rounded-t-3xl">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Detalles del Producto</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200 hover:rotate-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="relative group">
                  <div className="relative overflow-hidden rounded-2xl shadow-xl">
                    <img
                      src={selectedProduct.image || "/placeholder.svg"}
                      alt={selectedProduct.name}
                      className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {selectedProduct.discount && (
                      <span className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                        -{selectedProduct.discount}% OFF
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="inline-block text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-4 py-2 rounded-full mb-3 uppercase tracking-wide">
                      {selectedProduct.category}
                    </span>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{selectedProduct.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Código de producto: {selectedProduct.productCode || "N/A"}</p>
                  </div>

                  <div className="flex items-baseline gap-3 py-4 border-y border-gray-200 dark:border-gray-700">
                    <span className="text-4xl font-bold text-red-600">S/ {selectedProduct.price.toFixed(2)}</span>
                    {selectedProduct.originalPrice && (
                      <span className="text-xl text-gray-500 line-through">S/ {selectedProduct.originalPrice.toFixed(2)}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={`detail-star-${i}`}
                          className={`text-2xl ${i < Math.floor(selectedProduct.rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{selectedProduct.rating}</span>
                    <span className="text-gray-600 dark:text-gray-400">({selectedProduct.reviews})</span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado</p>
                    <span
                      className={`text-sm font-medium ${
                        selectedProduct.inStock ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {selectedProduct.inStock ? "En Stock" : "Agotado"}
                    </span>
                  </div>

                  {!user?.isAdmin && (
                    <div className="flex gap-4 pt-6">
                      <button
                        onClick={() => {
                          if (!user) {
                            setAuthModal({ type: "login", isOpen: true })
                            setSelectedProduct(null)
                          } else {
                            addToCart(selectedProduct)
                          }
                        }}
                        disabled={!selectedProduct.inStock}
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-2xl transform hover:scale-105 disabled:transform-none"
                      >
                        <ShoppingCart className="w-6 h-6" />
                        Agregar al Carrito
                      </button>
                      <button
                        onClick={() => {
                          if (!user) {
                            setAuthModal({ type: "login", isOpen: true })
                            setSelectedProduct(null)
                          } else if (!user.isAdmin) {
                            const isFav = favorites.some((fav) => fav.id === selectedProduct.id)
                            if (isFav) {
                              removeFromFavorites(selectedProduct.id)
                            } else {
                              addToFavorites(selectedProduct)
                            }
                          }
                        }}
                        className={`px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-2xl transform hover:scale-105 ${
                          favorites.some((fav) => fav.id === selectedProduct.id) && !user?.isAdmin
                            ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-2 border-red-600"
                            : "border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <Heart
                          className={`w-6 h-6 ${favorites.some((fav) => fav.id === selectedProduct.id) && !user?.isAdmin ? "fill-current" : ""}`}
                        />
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3 pt-4">
                    <div className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                      <Truck className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                      <span className="text-xs font-semibold text-green-700 dark:text-green-400 text-center">
                        Envío S/. 15
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 text-center">
                        Garantía oficial
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                      <RotateCcw className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                      <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 text-center">
                        30 días devolución
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                  <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
                    <button
                      onClick={() => setActiveTab("descripcion")}
                      className={`pb-3 px-4 font-semibold transition-all duration-200 ${
                        activeTab === "descripcion"
                          ? "text-red-600 border-b-2 border-red-600"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      Descripción
                    </button>
                    <button
                      onClick={() => setActiveTab("caracteristicas")}
                      className={`pb-3 px-4 font-semibold transition-all duration-200 ${
                        activeTab === "caracteristicas"
                          ? "text-red-600 border-b-2 border-red-600"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      Características
                    </button>
                    <button
                      onClick={() => setActiveTab("resenas")}
                      className={`pb-3 px-4 font-semibold transition-all duration-200 ${
                        activeTab === "resenas"
                          ? "text-red-600 border-b-2 border-red-600"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      Reseñas
                    </button>
                  </div>

                  <div className="space-y-4">
                    {activeTab === "descripcion" && (
                      <>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                          {selectedProduct.description}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          Producto original con garantía oficial del fabricante. Incluye todos los accesorios necesarios
                          para su uso.
                        </p>
                      </>
                    )}
                    {activeTab === "caracteristicas" && (
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Características Principales
                        </h4>
                        <div className="space-y-2 text-gray-700 dark:text-gray-300">
                          {selectedProduct.characteristics
                            ? selectedProduct.characteristics
                                .split('\n')
                                .filter((char: string) => char.trim())
                                .map((char: string, i: number) => (
                                  <p key={`char-${i}`}>{char}</p>
                                ))
                            : <p>No hay características disponibles.</p>}
                        </div>
                      </div>
                    )}
                    {activeTab === "resenas" && (
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Reseñas de Clientes
                        </h4>
                        {!user?.isAdmin && (
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h5 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                              Deja tu reseña
                            </h5>
                            <div className="space-y-3">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <button
                                    key={`rating-star-${i}`}
                                    onClick={() => setNewReview({ ...newReview, rating: i + 1 })}
                                    className={`text-2xl ${
                                      i < newReview.rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
                                    } hover:text-yellow-400 transition-colors`}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>
                              <textarea
                                value={newReview.text}
                                onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                                placeholder="Escribe tu comentario (opcional)"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                                rows={3}
                              />
                              {reviewError && <p className="text-red-500 text-sm">{reviewError}</p>}
                              <button
                                onClick={() => handleSubmitReview(selectedProduct.id)}
                                disabled={submittingReview || loadingReviews}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                              >
                                {submittingReview ? "Enviando..." : "Enviar Reseña"}
                              </button>
                            </div>
                          </div>
                        )}
                        {loadingReviews ? (
                          <p className="text-gray-600 dark:text-gray-400">Cargando reseñas...</p>
                        ) : (
                          <div className="space-y-4">
                            {reviews[selectedProduct.id]?.length > 0 ? (
                              reviews[selectedProduct.id].map((review) => (
                                <div key={`review-${review.id_review}`} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                          <span
                                            key={`review-star-${review.id_review}-${i}`}
                                            className={`text-yellow-400 ${i >= review.rating ? "text-gray-300 dark:text-gray-600" : ""}`}
                                          >
                                            ★
                                          </span>
                                        ))}
                                      </div>
                                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {review.userName}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleToggleLike(selectedProduct.id, review.id_review)}
                                      className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                    >
                                      <Heart
                                        className={`w-5 h-5 ${
                                          hasUserLiked(review) ? "fill-red-600 text-red-600" : ""
                                        }`}
                                      />
                                      <span>{review.likes}</span>
                                    </button>
                                  </div>
                                  <p className="text-gray-700 dark:text-gray-300">{review.text}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500 dark:text-gray-400 text-center italic">No hay reseñas aún. ¡Sé el primero en dejar una!</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Productos Relacionados</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {products
                      .filter((p) => p.category === selectedProduct.category && p.id !== selectedProduct.id)
                      .slice(0, 3)
                      .map((product) => (
                        <div
                          key={`related-${product.id}`}
                          onClick={() => setSelectedProduct(product)}
                          className="bg-white dark:bg-gray-700 rounded-xl cursor-pointer hover:shadow-xl transition-all border border-gray-200 dark:border-gray-600 overflow-hidden group"
                        >
                          <div className="relative overflow-hidden">
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-4">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 min-h-[2.5rem]">
                              {product.name}
                            </p>
                            <p className="text-2xl font-bold text-red-600">S/ {product.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        type={authModal.type}
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal((prev) => ({ ...prev, isOpen: false }))}
        onSwitchType={(type) => setAuthModal({ type, isOpen: true })}
      />

      <AdminDashboard isOpen={showAdmin} onClose={() => setShowAdmin(false)} />

      <Footer />
    </div>
  )
}

export default App