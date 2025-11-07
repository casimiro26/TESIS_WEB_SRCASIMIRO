"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Send, MessageCircle, Eye, Heart, ShoppingCart, Bot, Trash2, Plus, Minus } from "lucide-react"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { fetchProducts, fetchCategories } from "../data/products"
import { CheckoutModal } from "./CheckoutModal"
import { AuthModal } from "./AuthModal"

const API_BASE_URL = "http://localhost:3000"

export const Footer: React.FC = () => {
  const { favorites, items, addToCart, removeFromCart, updateQuantity } = useCart()
  const { user, token } = useAuth()

  const paymentMethods = [
    { name: "yape", icon: "../assets/images/yape.png", color: "text-blue-600" },
    { name: "bcp", icon: "../assets/images/bcp.png", color: "text-red-600" },
    { name: "visa", icon: "../assets/images/visa.png", color: "text-blue-500" },
    { name: "interbank", icon: "../assets/images/interb.png", color: "text-gray-800" },
  ]

  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [activeView, setActiveView] = useState<"chat" | "products" | "favorites" | "cart">("chat")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dynamicProducts, setDynamicProducts] = useState<any[]>([])
  const [dynamicCategories, setDynamicCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas")
  const [productsLoading, setProductsLoading] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [cartTotal, setCartTotal] = useState(0)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authType, setAuthType] = useState<"login" | "register">("login")
  const [chatImages, setChatImages] = useState<string[]>([])

  interface Message {
    id: number
    text: string
    isBot: boolean
    timestamp: Date
    images?: string[]
  }

  // Fetch bienvenida inicial al abrir chat
  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      fetchBienvenida()
    }
  }, [isChatOpen])

  // Fetch productos y categorías dinámicos
  useEffect(() => {
    if (activeView === "products" && dynamicProducts.length === 0) {
      loadProductsAndCategories()
    }
  }, [activeView, token])

  // Calcular total del carrito
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setCartTotal(total)
  }, [items])

  const loadProductsAndCategories = async () => {
    setProductsLoading(true)
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetchProducts(token || undefined),
        fetchCategories(token || undefined),
      ])
      setDynamicProducts(productsRes)
      setDynamicCategories(["Todas", ...categoriesRes])
    } catch (err) {
      console.error("Error loading products/categories:", err)
    } finally {
      setProductsLoading(false)
    }
  }

  const fetchBienvenida = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bienvenida`)
      if (response.ok) {
        const { response: botResponse } = await response.json()
        setMessages([
          {
            id: 1,
            text: botResponse,
            isBot: true,
            timestamp: new Date(),
          },
        ])
      } else {
        setMessages([
          {
            id: 1,
            text: "¡Hola! Soy Sr. Robot, tu asistente virtual de la tienda tecnológica en Huánuco. 😊 ¿En qué puedo ayudarte hoy? Puedo mostrarte productos, imágenes, precios o información de garantías.",
            isBot: true,
            timestamp: new Date(),
          },
        ])
      }
    } catch (err) {
      console.error("Error fetching bienvenida:", err)
      setMessages([
        {
          id: 1,
          text: "¡Hola! Soy Sr. Robot, tu asistente virtual de la tienda tecnológica en Huánuco. 😊 ¿En qué puedo ayudarte hoy? Puedo mostrarte productos, imágenes, precios o información de garantías.",
          isBot: true,
          timestamp: new Date(),
        },
      ])
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setError(null)
    setChatImages([])

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: inputMessage }),
      })

      if (response.ok) {
        const data = await response.json()
        const botMessage: Message = {
          id: Date.now() + 1,
          text: data.response,
          isBot: true,
          timestamp: new Date(),
          images: data.images || []
        }
        setMessages((prev) => [...prev, botMessage])
        if (data.images && data.images.length > 0) {
          setChatImages(data.images)
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (err: any) {
      console.error("Error en chat API:", err)
      setError("Lo siento, hubo un error al procesar tu mensaje. Intenta de nuevo o contacta por WhatsApp.")
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Lo siento, no pude procesar tu consulta en este momento. 😔 ¿Puedes reformularla o prefieres chatear por WhatsApp?",
        isBot: true,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setInputMessage("")
    }
  }

  const filteredProducts = dynamicProducts.filter(
    (product) => selectedCategory === "Todas" || product.category === selectedCategory,
  )

  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
  }

  const addSelectedToCart = () => {
    if (selectedProducts.size === 0) return
    selectedProducts.forEach((productId) => {
      const product = dynamicProducts.find((p) => p.id === productId)
      if (product) {
        addToCart({ 
          ...product, 
          quantity: 1,
          id: product.id || productId,
          name: product.nombre || product.name,
          price: product.precio || product.price,
          image: product.imagen || product.image
        })
      }
    })
    setSelectedProducts(new Set())
    setActiveView("cart")
  }

  const proceedToCheckout = () => {
    if (items.length === 0) return

    if (!user) {
      setAuthType("login")
      setIsAuthOpen(true)
    } else {
      setIsCheckoutOpen(true)
    }
  }

  const handleQuantityChange = (itemId: string, delta: number) => {
    const item = items.find((i) => i.id === itemId)
    if (item) {
      const newQuantity = Math.max(1, item.quantity + delta)
      updateQuantity(itemId, newQuantity)
    }
  }

  const handleRemoveFromCart = (itemId: string) => {
    removeFromCart(itemId)
  }

  const getCategoryNames = (): string[] => {
    return dynamicCategories.map((cat) => {
      if (typeof cat === "string") return cat
      return cat.nombre || cat.name || String(cat)
    })
  }

  const categoryNames = getCategoryNames()

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white relative">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src="../assets/images/sr. r.png" 
                  alt="Sr. Robot Logo" 
                  className="h-10 w-10 animate-pulse" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0RDNTE0RiIvPgo8dGV4dCB4PSIyMCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNSPC90ZXh0Pgo8L3N2Zz4K"
                  }}
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <div className="flex items-center">
                <h2 className="text-2xl font-bold text-red-500 animate-bounce">Sr. Robot</h2>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Tu tienda de confianza para accesorios tecnológicos de última generación. Calidad garantizada y precios
              competitivos en soles peruanos (S/.).
            </p>
            <div className="flex gap-4 mt-2">
              {user?.isAdmin ? null : (
                <>
                  <a href="https://wa.me/51975167294" target="_blank" rel="noopener noreferrer">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                      alt="WhatsApp"
                      className="w-10 h-10 hover:opacity-80 transition-opacity"
                    />
                  </a>
                  <a
                    href="https://web.facebook.com/p/Se%C3%B1or-Robot-100063654114002/?_rdc=1&_rdr#"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
                      alt="Facebook"
                      className="w-10 h-10 hover:opacity-80 transition-opacity"
                    />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                      alt="Instagram"
                      className="w-10 h-10 hover:opacity-80 transition-opacity"
                    />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-red-500">Contacto</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>📞 +51 975 167 294</li>
              <li>✉️ SRROBOT@GMAIL.COM</li>
              <li>📍 Huánuco, Perú</li>
            </ul>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-red-500">Enlaces</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Política de Devoluciones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Zona Outlet
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Blog Tecnológico
                </a>
              </li>
            </ul>
          </div>

          {/* Guarantees Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-red-500">Garantías</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <span className="text-green-500">🛡️</span> Compra Segura
              </li>
              <li>
                <span className="text-blue-500">🚚</span> Envío S/. 15
              </li>
              <li>
                <span className="text-purple-500">🔒</span> Pago Seguro
              </li>
              <li>Certificado SSL + Pagos encriptados + Garantía de satisfacción</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Methods Carousel */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h4 className="text-center text-gray-300 mb-4 font-medium">Métodos de Pago Aceptados</h4>
          <div className="flex justify-center items-center gap-8 overflow-x-auto pb-2">
            {paymentMethods.map((method, index) => (
              <div
                key={method.name}
                className="flex flex-col items-center gap-2 min-w-fit group cursor-pointer"
              >
                <div className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-lg">
                  <img
                    src={method.icon}
                    alt={`${method.name} Logo`}
                    className={`w-10 h-10 ${method.color} group-hover:scale-110 transition-transform object-contain`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzM3NDE1MSIvPgo8dGV4dCB4PSIyMCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPnttZXRob2QubmFtZX08L3RleHQ+Cjwvc3ZnPgo="
                    }}
                  />
                </div>
                <span className="text-xs text-gray-400 group-hover:text-white transition-colors">{method.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-4">
              <p>&copy; 2025 Sr. Robot. Todos los derechos reservados.</p>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Términos de Servicio
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Buttons and Chat */}
      {!user?.isAdmin && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          {/* WhatsApp Button */}
          <a
            href="https://wa.me/51975167294"
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-3 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 animate-bounce drop-shadow-[0_0_10px_rgba(34,197,94,0.7)]"
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.074-.149-.669-.816-.911-1.115-.24-.297-.487-.447-.669-.447-.182-.001-.332-.024-.482-.024-.149 0-.395.099-.495.347-.099.248-.372.952-.421 2.284-.049 1.332.446 3.3 1.642 4.496 1.197 1.197 2.966 1.94 4.889 2.163.473.053.896.08 1.27.08.369 0 .718-.099 1.016-.272.297-.174.495-.471.644-.868.149-.397.149-.645.025-.744-.123-.099-.273-.148-.421-.148z" />
              <path d="M12.003 2C6.48 2 2.004 6.475 2.004 12c0 1.776.468 3.464 1.314 4.935l-1.406 5.147 5.297-1.389c1.418.826 3.004 1.262 4.794 1.262 5.523 0 10-4.475 10-10s-4.477-10-10-10zm0 18c-1.518 0-2.955-.404-4.206-1.113l-.303-.18-3.14.825.845-3.083-.198-.305C3.465 14.63 2.703 13.077 2.703 12c0-4.96 4.037-9 9-9s9 4.04 9 9-4.037 9-9 9z" />
            </svg>
          </a>

          {/* ChatBot Button */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 animate-pulse"
          >
            <Bot className="w-6 h-6" />
          </button>

          {/* Chat Window */}
          {isChatOpen && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-96 h-[32rem] flex flex-col overflow-hidden mt-3">
              {/* Header */}
              <div className="bg-red-500 text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="w-6 h-6" />
                  <div>
                    <h3 className="font-semibold">Sr. Robot Asistente</h3>
                    <p className="text-xs opacity-90">En línea • Respuesta instantánea</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href="https://wa.me/51975167294"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-green-600 rounded transition-colors"
                    title="Ir a WhatsApp"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.074-.149-.669-.816-.911-1.115-.24-.297-.487-.447-.669-.447-.182-.001-.332-.024-.482-.024-.149 0-.395.099-.495.347-.099.248-.372.952-.421 2.284-.049 1.332.446 3.3 1.642 4.496 1.197 1.197 2.966 1.94 4.889 2.163.473.053.896.08 1.27.08.369 0 .718-.099 1.016-.272.297-.174.495-.471.644-.868.149-.397.149-.645.025-.744-.123-.099-.273-.148-.421-.148z" />
                      <path d="M12.003 2C6.48 2 2.004 6.475 2.004 12c0 1.776.468 3.464 1.314 4.935l-1.406 5.147 5.297-1.389c1.418.826 3.004 1.262 4.794 1.262 5.523 0 10-4.475 10-10s-4.477-10-10-10zm0 18c-1.518 0-2.955-.404-4.206-1.113l-.303-.18-3.14.825.845-3.083-.198-.305C3.465 14.63 2.703 13.077 2.703 12c0-4.96 4.037-9 9-9s9 4.04 9 9-4.037 9-9 9z" />
                    </svg>
                  </a>
                  <button
                    onClick={() => {
                      setIsChatOpen(false)
                      setChatImages([])
                    }}
                    className="p-1 hover:bg-red-600 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {[
                  { id: "chat", label: "Chat", icon: MessageCircle },
                  { id: "products", label: "Productos", icon: Eye },
                  { id: "favorites", label: "Favoritos", icon: Heart, count: favorites.length },
                  { id: "cart", label: "Carrito", icon: ShoppingCart, count: items.length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveView(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-1 py-3 text-xs font-medium transition-colors relative ${
                      activeView === tab.id
                        ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
                        : "text-gray-600 dark:text-gray-400 hover:text-red-500"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center ml-1">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeView === "chat" && (
                  <>
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
                        <div
                          className={`max-w-xs p-3 rounded-lg text-sm ${
                            message.isBot
                              ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {message.text}
                          {message.images && message.images.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.images.map((img, index) => (
                                <img
                                  key={index}
                                  src={img}
                                  alt={`Imagen del producto ${index + 1}`}
                                  className="w-full h-auto rounded-lg border border-gray-200"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none'
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-sm text-gray-500">
                          Sr. Robot está escribiendo...
                        </div>
                      </div>
                    )}
                    {error && (
                      <div className="flex justify-start">
                        <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg text-sm text-red-600 dark:text-red-400">
                          {error}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeView === "products" && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Productos Disponibles</h4>
                    
                    {/* Filtro por categoría */}
                    <div className="flex flex-col space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Filtrar por categoría:
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      >
                        {categoryNames.map((catName, index) => (
                          <option key={`${catName}-${index}`} value={catName}>
                            {catName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Botón para agregar seleccionados */}
                    {selectedProducts.size > 0 && (
                      <button
                        onClick={addSelectedToCart}
                        disabled={productsLoading}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition-colors"
                      >
                        Agregar {selectedProducts.size} seleccionado{selectedProducts.size !== 1 ? "s" : ""} al carrito
                      </button>
                    )}

                    {productsLoading ? (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8">Cargando productos...</p>
                    ) : filteredProducts.length === 0 ? (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No hay productos en esta categoría
                      </p>
                    ) : (
                      filteredProducts.slice(0, 6).map((product) => (
                        <div
                          key={product.id}
                          className="flex items-start gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedProducts.has(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                            className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 rounded"
                          />
                          <img
                            src={product.imagen || product.image || "/placeholder.svg"}
                            alt={product.nombre || product.name}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yOCAxOUwyOC4wMDEgMjlNMjAgMjRIMzZNMzYgMjRMMzEgMTlNMzYgMjRMMzEgMjkiIHN0cm9rZT0iIzlDQTVCQyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg=="
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {product.nombre || product.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {product.categoria || product.category}
                            </p>
                            <p className="text-sm font-bold text-red-600">
                              S/. {product.precio || product.price}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeView === "favorites" && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Mis Favoritos</h4>
                    {favorites.length === 0 ? (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8">No tienes favoritos aún</p>
                    ) : (
                      favorites.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                            <p className="text-sm font-bold text-red-600">S/. {product.price}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeView === "cart" && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Mi Carrito</h4>
                    {items.length === 0 ? (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8">Tu carrito está vacío</p>
                    ) : (
                      <>
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">S/. {item.price} c/u</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleQuantityChange(item.id, -1)}
                                className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(item.id, 1)}
                                className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-right flex-1">
                              <p className="text-sm font-bold text-red-600">
                                S/. {(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-bold text-gray-900 dark:text-white text-right">
                            Total: S/. {cartTotal.toFixed(2)}
                          </p>
                          <button
                            onClick={proceedToCheckout}
                            className="w-full mt-3 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition-colors"
                          >
                            Proceder a Pago
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Input Area - Solo para chat */}
              {activeView === "chat" && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
                      placeholder="Escribe tu consulta..."
                      disabled={isLoading}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm disabled:opacity-50"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <AuthModal
            type={authType}
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            onSwitchType={(type) => setAuthType(type)}
          />

          <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
        </div>
      )}
    </footer>
  )
}