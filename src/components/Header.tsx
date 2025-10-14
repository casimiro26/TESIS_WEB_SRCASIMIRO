"use client"

import type React from "react"
import { useState } from "react"
import { Search, Heart, ShoppingCart, User, Menu, X, Sun, Moon } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { categories } from "../data/products"
import { CartModal } from "./CartModal"
import { FavoritesModal } from "./FavoritesModal"
import { OrdersModal } from "./OrdersModal"

interface HeaderProps {
  onCategoryChange: (category: string) => void
  searchTerm: string
  onSearchChange: (term: string) => void
  onShowAuth: (type: "login" | "register") => void
  onShowAdmin: () => void
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

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-lg">
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-red-700 to-red-500 text-white py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
            <div className="flex items-center gap-4"></div>
            <div className="hidden md:flex items-center gap-4"></div>
          </div>
        </div>

        {/* Main Header */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <img
                  src="../assets/images/s-r.png"
                  alt="Sr. Robot Logo"
                  className="h-10 w-10 object-contain group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 ease-in-out"
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
                            {user.isAdmin ? "Administrador" : "Cliente"}
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
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => onCategoryChange(category)}
                  className="whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-300 relative group"
                >
                  {category}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </button>
              ))}
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
