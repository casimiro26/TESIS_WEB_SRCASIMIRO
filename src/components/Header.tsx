"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, Heart, ShoppingCart, User, Menu, X, Sun, Moon } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { CartModal } from "./CartModal"
import { FavoritesModal } from "./FavoritesModal"
import { OrdersModal } from "./OrdersModal"
import axios from "axios"

interface HeaderProps {
  onCategoryChange: (category: string) => void
  searchTerm: string
  onSearchChange: (term: string) => void
  onShowAuth: (type: "login" | "register") => void
  onShowAdmin: () => void
}

interface Category {
  id_categoria: number
  nombre: string
  descripcion: string
}

export const Header: React.FC<HeaderProps> = ({
  onCategoryChange,
  searchTerm,
  onSearchChange,
  onShowAuth,
  onShowAdmin,
}) => {
  const { isDarkMode, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const { getTotalItems, favorites } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showCartModal, setShowCartModal] = useState(false)
  const [showFavoritesModal, setShowFavoritesModal] = useState(false)
  const [showOrdersModal, setShowOrdersModal] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Textos para el carrusel
  const slides = [
    "Sr. Robot tu tienda de confianza donde encontrar accesorios tecnológicos de primer nivel",
    "Ven y visitanos nos encontramos en el clima del mundo Huánuco",
    "Tecnología de vanguardia al alcance de todos",
    "Los mejores precios y calidad garantizada"
  ]

  // Cargar categorías desde la API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await axios.get("https://api-web-egdy.onrender.com/api/categorias")
        const fetchedCategories = response.data.categorias
        setCategories(fetchedCategories)
      } catch (error) {
        console.error("Error loading categories:", error)
        // Fallback a categorías estáticas
        const fallbackCategories = [
          { id_categoria: 1, nombre: "Laptops", descripcion: "Computadoras portátiles" },
          { id_categoria: 2, nombre: "Smartphones", descripcion: "Teléfonos inteligentes" },
          { id_categoria: 3, nombre: "Tablets", descripcion: "Tabletas y iPads" },
          { id_categoria: 4, nombre: "Accesorios", descripcion: "Accesorios tecnológicos" },
          { id_categoria: 5, nombre: "Audio", descripcion: "Audio y sonido" },
          { id_categoria: 6, nombre: "Gaming", descripcion: "Equipos gaming" },
        ]
        setCategories(fallbackCategories)
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  // Efecto para el carrusel automático
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000) // Cambia cada 4 segundos

    return () => clearInterval(interval)
  }, [slides.length])

  // Función para obtener el texto del rol correctamente
  const getRoleText = (user: any) => {
    if (user.rol === "superadmin") return "Super Administrador"
    if (user.rol === "admin") return "Administrador"
    return "Cliente"
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-lg">
        {/* Top Bar - Carrusel de Texto */}
        <div className="bg-gradient-to-r from-red-700 to-red-500 text-white py-2 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative h-6 flex items-center justify-center">
              <div className="flex-1 text-center">
                <div
                  className="flex transition-all duration-1000 ease-in-out transform"
                  style={{
                    transform: `translateX(-${currentSlide * 100}%)`,
                  }}
                >
                  {slides.map((slide, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-full text-center px-4"
                    >
                      <span
                        className={`text-sm font-medium inline-block transition-all duration-700 ${
                          currentSlide === index
                            ? "opacity-100 transform translate-y-0"
                            : "opacity-0 transform translate-y-2"
                        }`}
                      >
                        {slide}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="relative h-10 w-10 rounded-full overflow-hidden group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 ease-in-out">
                <img
                  src="/../assets/images/s-r.png"
                  alt="Sr. Robot Logo"
                  className="h-full w-full object-cover"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent animate-pulse">
                  Sr. Robot
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tech Store</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="Buscar productos tecnológicos..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300 hover:scale-110"
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-red-400 animate-spin-slow" />
                ) : (
                  <Moon className="h-5 w-5 text-red-600 animate-spin-slow" />
                )}
              </button>

              {/* Favorites */}
              <button
                onClick={() => {
                  if (!user) {
                    onShowAuth("login")
                  } else {
                    setShowFavoritesModal(true)
                  }
                }}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300 hover:scale-110"
              >
                <Heart className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:fill-red-500 transition-all duration-300" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {favorites.length}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                onClick={() => {
                  if (!user) {
                    onShowAuth("login")
                  } else if (user.isAdmin) {
                    return // Admin cannot access cart
                  } else {
                    setShowCartModal(true)
                  }
                }}
                disabled={user?.isAdmin}
                className={`relative p-2 rounded-full transition-colors duration-300 hover:scale-110 ${
                  user?.isAdmin ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <ShoppingCart className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:fill-red-500 transition-all duration-300" />
                {getTotalItems() > 0 && !user?.isAdmin && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    if (!user) {
                      onShowAuth("login")
                    } else {
                      setShowUserMenu(!showUserMenu)
                    }
                  }}
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300 hover:scale-110"
                >
                  <User className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:fill-red-500 transition-all duration-300" />
                  {user && <span className="hidden md:block text-sm font-medium">{user.name}</span>}
                </button>

                {showUserMenu && user && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-slide-down">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                          <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
                            {getRoleText(user)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {user.isAdmin ? (
                      <button
                        onClick={() => {
                          onShowAdmin()
                          setShowUserMenu(false)
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 flex items-center gap-2"
                      >
                        <span className="text-lg">⚙️</span>
                        Dashboard Admin
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setShowOrdersModal(true)
                            setShowUserMenu(false)
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 flex items-center gap-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Mis Pedidos
                        </button>
                        <button
                          onClick={() => {
                            setShowFavoritesModal(true)
                            setShowUserMenu(false)
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 flex items-center gap-2"
                        >
                          <Heart className="w-4 h-4" />
                          Mis Favoritos
                        </button>
                      </>
                    )}

                    <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                      <button
                        onClick={() => {
                          logout()
                          setShowUserMenu(false)
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-300 flex items-center gap-2 font-medium"
                      >
                        <span className="text-lg">🚪</span>
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300 hover:scale-110"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Categories Navigation */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4">
            <div
              className={`flex items-center gap-8 py-4 overflow-x-auto scrollbar-hide ${isMenuOpen ? "flex-col md:flex-row items-start" : "hidden md:flex"}`}
            >
              <button
                onClick={() => onCategoryChange("")}
                className="whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-300 relative group"
              >
                Todos
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </button>
              {!loadingCategories && categories.map((category) => (
                <button
                  key={category.id_categoria}
                  onClick={() => onCategoryChange(category.nombre)}
                  className="whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-300 relative group"
                >
                  {category.nombre}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </button>
              ))}
              {loadingCategories && (
                <div className="flex gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Cart Modal */}
      {!user?.isAdmin && <CartModal isOpen={showCartModal} onClose={() => setShowCartModal(false)} />}

      <FavoritesModal isOpen={showFavoritesModal} onClose={() => setShowFavoritesModal(false)} />

      {user && !user.isAdmin && <OrdersModal isOpen={showOrdersModal} onClose={() => setShowOrdersModal(false)} />}
    </>
  )
}