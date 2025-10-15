"use client"

import type React from "react"
import { useState, memo, useMemo, useEffect } from "react"
import {
  X,
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Package,
  Trash2,
  Loader2,
  Eye,
  CheckCircle,
  Search,
  Filter,
  FileText,
  Clock,
  Activity,
  RefreshCw,
  Tag,
  Plus,
  Edit,
} from "lucide-react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js"
import { Line, Doughnut, Bar } from "react-chartjs-2"
import { useStore } from "../context/StoreContext"
import { useCart } from "../context/CartContext"
import type { Product } from "../types"
import type { Order } from "../context/StoreContext"

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  ArcElement, 
  BarElement, 
  Tooltip, 
  Legend,
  Filler
)

interface AdminDashboardProps {
  isOpen: boolean
  onClose: () => void
}

interface Activity {
  id: string
  type: "order" | "product_added" | "payment_confirmed" | "category_added"
  description: string
  timestamp: string
}

interface Category {
  id_categoria: number
  nombre: string
  descripcion: string
}

// ✅ MOVER LAS FUNCIONES AUXILIARES FUERA DEL COMPONENTE
const calculateMonthlySales = (orders: Order[]): number[] => {
  const monthlySales = [0, 0, 0, 0, 0, 0] // Últimos 6 meses
  
  orders.forEach(order => {
    const orderDate = new Date(order.date)
    const monthDiff = (new Date().getMonth() - orderDate.getMonth() + 12) % 12
    
    if (monthDiff < 6) {
      monthlySales[5 - monthDiff] += order.total
    }
  })
  
  return monthlySales
}

const calculateCategoryDistribution = (products: Product[]): Record<string, number> => {
  const distribution: Record<string, number> = {}
  
  products.forEach(product => {
    distribution[product.category] = (distribution[product.category] || 0) + 1
  })
  
  return distribution
}

export const AdminDashboard: React.FC<AdminDashboardProps> = memo(({ isOpen, onClose }) => {
  const { 
    products, 
    orders, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    confirmReceipt, 
    loading: storeLoading,
    error: storeError,
    loadProducts,
    clearError
  } = useStore()
  
  useCart()

  const [activeTab, setActiveTab] = useState("overview")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    discount: "",
    image: "",
    description: "",
    characteristics: "",
    productCode: "",
    inStock: true,
  })
  const [newCategory, setNewCategory] = useState({
    nombre: "",
    descripcion: ""
  })
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [errors, setErrors] = useState({
    name: "",
    category: "",
    price: "",
    discount: "",
    image: "",
    description: "",
    characteristics: "",
    productCode: "",
    categoryName: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState<Order | null>(null)
  const [orderSearchTerm, setOrderSearchTerm] = useState("")
  const [orderFilter, setOrderFilter] = useState("Todos")
  const [productFilter, setProductFilter] = useState("Todos")
  const [refreshing, setRefreshing] = useState(false)

  // Cargar categorías desde la API REAL
  const loadCategories = async () => {
    try {
      const token = localStorage.getItem("sr-robot-token")
      if (!token) {
        console.log("No token found for categories")
        return
      }

      const response = await fetch("https://api-web-egdy.onrender.com/api/admin/categorias", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCategories(data.categorias || [])
      } else {
        console.error("Error loading categories:", response.status)
        // Fallback a categorías estáticas
        const defaultCategories: Category[] = [
          { id_categoria: 1, nombre: "Laptops", descripcion: "Computadoras portátiles" },
          { id_categoria: 2, nombre: "Smartphones", descripcion: "Teléfonos inteligentes" },
          { id_categoria: 3, nombre: "Tablets", descripcion: "Tabletas y iPads" },
          { id_categoria: 4, nombre: "Accesorios", descripcion: "Accesorios tecnológicos" },
        ]
        setCategories(defaultCategories)
      }
    } catch (error) {
      console.error("Error loading categories:", error)
      // Fallback a categorías estáticas
      const defaultCategories: Category[] = [
        { id_categoria: 1, nombre: "Laptops", descripcion: "Computadoras portátiles" },
        { id_categoria: 2, nombre: "Smartphones", descripcion: "Teléfonos inteligentes" },
        { id_categoria: 3, nombre: "Tablets", descripcion: "Tabletas y iPads" },
        { id_categoria: 4, nombre: "Accesorios", descripcion: "Accesorios tecnológicos" },
      ]
      setCategories(defaultCategories)
    }
  }

  // Crear nueva categoría - CONECTADO A API REAL
  const handleCreateCategory = async () => {
    if (!newCategory.nombre.trim()) {
      setErrors(prev => ({ ...prev, categoryName: "El nombre de la categoría es requerido" }))
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem("sr-robot-token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch("https://api-web-egdy.onrender.com/api/admin/crear-categoria", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre: newCategory.nombre,
          descripcion: newCategory.descripcion
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ mensaje: "Error creating category" }))
        throw new Error(errorData.mensaje || `HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()
      
      // Recargar categorías desde la API
      await loadCategories()
      
      setShowCategoryModal(false)
      setNewCategory({ nombre: "", descripcion: "" })
      setErrors(prev => ({ ...prev, categoryName: "" }))
      setToast({ message: "Categoría creada con éxito", type: "success" })
    } catch (error: any) {
      console.error("Error creating category:", error)
      setToast({ message: error.message || "Error al crear categoría", type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  // Mostrar errores del StoreContext
  useEffect(() => {
    if (storeError) {
      setToast({ message: storeError, type: "error" })
      setTimeout(() => {
        setToast(null)
        clearError()
      }, 5000)
    }
  }, [storeError, clearError])

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadCategories()
    }
  }, [isOpen])

  // Estadísticas REALES basadas en datos
  const stats = useMemo(() => {
    // Clientes activos - ESTE DATO DEBE VENIR DE TU API
    // Por ahora usamos un valor fijo hasta que implementes el endpoint de usuarios
    const activeCustomers = 1 // Cambiado de 856 a 1 según tu comentario
    
    // Productos activos (en stock)
    const activeProducts = products.filter(p => p.inStock).length
    
    // Total de pedidos
    const totalOrders = orders.length
    
    // Ingresos totales en soles
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    
    // Ventas mensuales (últimos 6 meses basados en pedidos reales)
    const monthlySales = calculateMonthlySales(orders)
    
    // Distribución por categoría REAL
    const categoryDistribution = calculateCategoryDistribution(products)

    return {
      activeCustomers,
      activeProducts,
      totalOrders,
      totalRevenue,
      monthlySales,
      categoryDistribution,
    }
  }, [products, orders])

  const recentActivities = useMemo(() => {
    const activities: Activity[] = []

    // Actividades de pedidos
    orders.slice(0, 3).forEach((order) => {
      activities.push({
        id: `order-${order.id}`,
        type: "order",
        description: `Nuevo pedido #${order.id} de ${order.customer.name} por S/${order.total.toFixed(2)}`,
        timestamp: order.date,
      })
    })

    // Actividades de productos agregados recientemente
    products.slice(0, 2).forEach((product) => {
      activities.push({
        id: `product-${product.id}`,
        type: "product_added",
        description: `Producto "${product.name}" agregado al inventario`,
        timestamp: new Date().toISOString(),
      })
    })

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
  }, [orders, products])

  const activityChartData = useMemo(() => {
    const days = 7
    const labels: string[] = []
    const data: number[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      labels.push(date.toLocaleDateString("es-PE", { day: "numeric", month: "short" }))
      
      // Contar actividades reales de ese día
      const count = recentActivities.filter((activity) => {
        const activityDate = new Date(activity.timestamp)
        return activityDate.toDateString() === date.toDateString()
      }).length
      
      data.push(count)
    }

    return {
      labels,
      datasets: [
        {
          label: "Actividades",
          data,
          backgroundColor: "rgba(239, 68, 68, 0.6)",
          borderColor: "rgb(239, 68, 68)",
          borderWidth: 1,
          hoverBackgroundColor: "rgb(239, 68, 68)",
          hoverBorderColor: "rgb(220, 38, 38)",
        },
      ],
    }
  }, [recentActivities])

  if (!isOpen) return null

  const filteredProducts = products
    .filter((p) => selectedCategory === "Todos" || p.category === selectedCategory)
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(
      (p) =>
        productFilter === "Todos" ||
        (productFilter === "En Stock" && p.inStock) ||
        (productFilter === "Agotado" && !p.inStock),
    )

  const filteredOrders = orders
    .filter(
      (order) =>
        order.customer.name.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.id.toString().includes(orderSearchTerm.toLowerCase()) ||
        order.items.some((item) => item.product.name.toLowerCase().includes(orderSearchTerm.toLowerCase())),
    )
    .filter(
      (order) =>
        orderFilter === "Todos" ||
        (orderFilter === "Comprobante Recibido" && order.hasReceipt) ||
        (orderFilter === "Falta Comprobante" && !order.hasReceipt),
    )
    .sort((a, b) => b.id - a.id)

  const validateForm = () => {
    const newErrors = {
      name: "",
      category: "",
      price: "",
      discount: "",
      image: "",
      description: "",
      characteristics: "",
      productCode: "",
      categoryName: ""
    }
    let isValid = true

    if (!newProduct.name.trim()) {
      newErrors.name = "El nombre es requerido"
      isValid = false
    }
    if (!newProduct.category || newProduct.category === "Todos") {
      newErrors.category = "La categoría es requerida"
      isValid = false
    }
    if (!newProduct.price || isNaN(Number(newProduct.price)) || Number(newProduct.price) <= 0 || Number(newProduct.price) > 10000) {
      newErrors.price = "El precio debe ser un número entre 0.01 y 10000"
      isValid = false
    }
    if (
      newProduct.discount &&
      (isNaN(Number(newProduct.discount)) || Number(newProduct.discount) < 0 || Number(newProduct.discount) > 100)
    ) {
      newErrors.discount = "El descuento debe ser un número entre 0 y 100"
      isValid = false
    }
    if (!newProduct.image.trim()) {
      newErrors.image = "La URL de la imagen es requerida"
      isValid = false
    }
    if (!newProduct.description.trim()) {
      newErrors.description = "La descripción es requerida"
      isValid = false
    }
    if (!newProduct.characteristics.trim()) {
      newErrors.characteristics = "Las características son requeridas"
      isValid = false
    }
    if (!newProduct.productCode.trim()) {
      newErrors.productCode = "El código de producto es requerido"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleAddProduct = () => {
    setShowAddModal(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditProduct(product)
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      discount: product.discount?.toString() || "",
      image: product.image,
      description: product.description,
      characteristics: product.characteristics || "",
      productCode: product.productCode || "",
      inStock: product.inStock,
    })
    setShowEditModal(true)
  }

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      setIsLoading(true)
      const success = await deleteProduct(productId)
      setIsLoading(false)
      
      if (success) {
        setToast({ message: "Producto eliminado con éxito", type: "success" })
      } else {
        setToast({ message: "Error al eliminar el producto", type: "error" })
      }
      setTimeout(() => setToast(null), 3000)
    }
  }

  const handleSaveNewProduct = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    
    const discount = newProduct.discount ? Number(newProduct.discount) : undefined
    const price = Number(newProduct.price)
    const originalPrice = discount ? Math.round(price / (1 - discount / 100)) : undefined

    const productData = {
      name: newProduct.name,
      category: newProduct.category,
      price,
      originalPrice,
      discount,
      image: newProduct.image,
      description: newProduct.description,
      characteristics: newProduct.characteristics,
      productCode: newProduct.productCode,
      rating: 4.5,
      reviews: 0,
      inStock: newProduct.inStock,
      featured: false,
    }

    try {
      const success = await addProduct(productData)
      
      if (success) {
        setShowAddModal(false)
        setNewProduct({
          name: "",
          category: "",
          price: "",
          discount: "",
          image: "",
          description: "",
          characteristics: "",
          productCode: "",
          inStock: true,
        })
        setErrors({
          name: "",
          category: "",
          price: "",
          discount: "",
          image: "",
          description: "",
          characteristics: "",
          productCode: "",
          categoryName: ""
        })
        setToast({ message: "Producto agregado con éxito", type: "success" })
      } else {
        setToast({ message: "Error al agregar el producto", type: "error" })
      }
    } catch (error) {
      setToast({ message: "Error al agregar el producto", type: "error" })
    } finally {
      setIsLoading(false)
      setTimeout(() => setToast(null), 3000)
    }
  }

  const handleSaveEditProduct = async () => {
    if (!validateForm() || !editProduct) return

    setIsLoading(true)
    
    const discount = newProduct.discount ? Number(newProduct.discount) : undefined
    const price = Number(newProduct.price)
    const originalPrice = discount ? Math.round(price / (1 - discount / 100)) : undefined

    const productData = {
      name: newProduct.name,
      category: newProduct.category,
      price,
      originalPrice,
      discount,
      image: newProduct.image,
      description: newProduct.description,
      characteristics: newProduct.characteristics,
      productCode: newProduct.productCode,
      inStock: newProduct.inStock,
    }

    try {
      const success = await updateProduct(editProduct.id, productData)
      
      if (success) {
        setShowEditModal(false)
        setEditProduct(null)
        setNewProduct({
          name: "",
          category: "",
          price: "",
          discount: "",
          image: "",
          description: "",
          characteristics: "",
          productCode: "",
          inStock: true,
        })
        setErrors({
          name: "",
          category: "",
          price: "",
          discount: "",
          image: "",
          description: "",
          characteristics: "",
          productCode: "",
          categoryName: ""
        })
        setToast({ message: "Producto actualizado con éxito", type: "success" })
      } else {
        setToast({ message: "Error al actualizar el producto", type: "error" })
      }
    } catch (error) {
      setToast({ message: "Error al actualizar el producto", type: "error" })
    } finally {
      setIsLoading(false)
      setTimeout(() => setToast(null), 3000)
    }
  }

  const handleRefreshProducts = async () => {
    setRefreshing(true)
    await loadProducts()
    setRefreshing(false)
    setToast({ message: "Productos actualizados", type: "success" })
    setTimeout(() => setToast(null), 2000)
  }

  const handleConfirmReceipt = (orderId: number) => {
    setIsLoading(true)
    setTimeout(() => {
      confirmReceipt(orderId)
      setIsLoading(false)
      setToast({ message: "Comprobante de pago confirmado", type: "success" })
      setTimeout(() => setToast(null), 3000)
    }, 1000)
  }

  const handleViewPaymentProof = (paymentProof: string) => {
    window.open(paymentProof, "_blank")
  }

  const getDiscountedPrice = (price: number, discount?: number) => {
    if (!discount) return price
    return Math.round(price * (1 - discount / 100))
  }

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "order":
        return <ShoppingBag className="w-5 h-5 text-red-600" />
      case "product_added":
        return <Package className="w-5 h-5 text-blue-600" />
      case "payment_confirmed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "category_added":
        return <Tag className="w-5 h-5 text-purple-600" />
      default:
        return <Activity className="w-5 h-5 text-gray-600" />
    }
  }

  const getActivityBadge = (type: Activity["type"]) => {
    switch (type) {
      case "order":
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">Pedido</span>
      case "product_added":
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded-full">Producto</span>
      case "payment_confirmed":
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-600 rounded-full">Pago</span>
      case "category_added":
        return <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-600 rounded-full">Categoría</span>
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">Actividad</span>
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-0">
      <div className="bg-white rounded-none shadow-2xl w-screen h-screen overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-600 to-black">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            Dashboard Administrativo Sr. Robot
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefreshProducts}
              disabled={refreshing || storeLoading}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white disabled:opacity-50"
              aria-label="Actualizar productos"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
              aria-label="Cerrar dashboard"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(100%-64px)]">
          <div className="w-64 bg-gray-900 text-white p-6">
            <nav className="space-y-4">
              {[
                { id: "overview", label: "Resumen General", icon: TrendingUp },
                { id: "products", label: "Productos", icon: Package },
                { id: "categories", label: "Categorías", icon: Tag },
                { id: "orders", label: "Pedidos", icon: ShoppingBag },
                { id: "users", label: "Usuarios", icon: Users },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id ? "bg-red-600 text-white shadow-md" : "hover:bg-gray-800"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
            {/* RESUMEN GENERAL */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-gray-900">Dashboard Resumen General</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {storeLoading && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Cargando productos...</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* ESTADÍSTICAS MEJORADAS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <Users className="w-6 h-6 text-red-600" />
                      <p className="text-gray-600 font-medium">Clientes Activos</p>
                    </div>
                    <p className="text-3xl font-bold text-red-600 mt-2">{stats.activeCustomers.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">Clientes registrados</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <Package className="w-6 h-6 text-red-600" />
                      <p className="text-gray-600 font-medium">Productos Activos</p>
                    </div>
                    <p className="text-3xl font-bold text-red-600 mt-2">{stats.activeProducts.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">En inventario</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-6 h-6 text-red-600" />
                      <p className="text-gray-600 font-medium">Total Pedidos</p>
                    </div>
                    <p className="text-3xl font-bold text-red-600 mt-2">{stats.totalOrders.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">Pedidos realizados</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-6 h-6 text-red-600" />
                      <p className="text-gray-600 font-medium">Ingresos Totales</p>
                    </div>
                    <p className="text-3xl font-bold text-red-600 mt-2">S/{stats.totalRevenue.toFixed(2)}</p>
                    <p className="text-sm text-gray-500 mt-1">En soles peruanos</p>
                  </div>
                </div>

                {/* GRÁFICAS MEJORADAS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-[450px]">
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-2">Ventas Mensuales</h3>
                    <p className="text-sm text-gray-500 font-medium mb-4">Últimos 6 meses (S/)</p>
                    <div className="h-72">
                      <Line
                        data={{
                          labels: ["Hace 5m", "Hace 4m", "Hace 3m", "Hace 2m", "Hace 1m", "Este mes"],
                          datasets: [
                            {
                              label: "Ventas (S/)",
                              data: stats.monthlySales,
                              fill: true,
                              backgroundColor: "rgba(239, 68, 68, 0.2)",
                              borderColor: "rgb(239, 68, 68)",
                              tension: 0.4,
                              borderWidth: 3,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                          },
                          scales: {
                            x: {
                              ticks: { font: { size: 12 }, color: "#1f2937" },
                              grid: { display: false },
                            },
                            y: {
                              ticks: { font: { size: 12 }, color: "#1f2937" },
                              grid: { color: "#e5e7eb" },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-[450px]">
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-2">Distribución por Categoría</h3>
                    <p className="text-sm text-gray-500 font-medium mb-4">Productos por categoría</p>
                    <div className="h-60">
                      <Doughnut
                        data={{
                          labels: Object.keys(stats.categoryDistribution),
                          datasets: [
                            {
                              data: Object.values(stats.categoryDistribution),
                              backgroundColor: [
                                "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", 
                                "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#a855f7"
                              ],
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          cutout: "50%",
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-4 max-w-full">
                      {Object.keys(stats.categoryDistribution).map((label, index) => (
                        <div key={label} className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-sm"
                            style={{
                              backgroundColor: [
                                "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6",
                                "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#a855f7"
                              ][index % 10],
                            }}
                          ></span>
                          <span className="text-sm text-gray-600 font-normal">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ACTIVIDADES RECIENTES */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-4">Actividades Recientes</h3>
                  <p className="text-sm text-gray-500 font-medium mb-6">Últimas acciones registradas en el sistema</p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {recentActivities.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay actividades recientes.</p>
                      ) : (
                        recentActivities.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {getActivityBadge(activity.type)}
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(activity.timestamp).toLocaleString("es-PE", {
                                    dateStyle: "short",
                                    timeStyle: "short",
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-gray-900 font-medium">{activity.description}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="h-[300px]">
                      <h4 className="text-base font-semibold text-gray-900 mb-2">Tendencia de Actividades</h4>
                      <p className="text-sm text-gray-500 font-medium mb-4">Últimos 7 días</p>
                      <Bar
                        data={activityChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: true,
                              position: "top" as const,
                            },
                          },
                          scales: {
                            x: {
                              ticks: { font: { size: 12 }, color: "#1f2937" },
                              grid: { display: false },
                            },
                            y: {
                              beginAtZero: true,
                              ticks: { font: { size: 12 }, color: "#1f2937" },
                              grid: { color: "#e5e7eb" },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GESTIÓN DE PRODUCTOS */}
            {activeTab === "products" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900">Gestión de Productos</h3>
                  <div className="flex items-center gap-2">
                    {storeLoading && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Cargando...</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div className="relative w-full sm:w-1/3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Buscar productos por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="text-gray-400 w-5 h-5" />
                      <select
                        value={productFilter}
                        onChange={(e) => setProductFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                      >
                        <option value="Todos">Todos</option>
                        <option value="En Stock">En Stock</option>
                        <option value="Agotado">Agotado</option>
                      </select>
                    </div>
                    <button
                      onClick={handleAddProduct}
                      disabled={storeLoading}
                      className={`px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 ${
                        storeLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Package className="w-5 h-5" />
                      Agregar Producto
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <button
                      onClick={() => setSelectedCategory("Todos")}
                      className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                        selectedCategory === "Todos"
                          ? "bg-red-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Todos
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id_categoria}
                        onClick={() => setSelectedCategory(category.nombre)}
                        className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                          selectedCategory === category.nombre
                            ? "bg-red-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {category.nombre}
                      </button>
                    ))}
                  </div>

                  {storeLoading && products.length === 0 ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600" />
                      <p className="text-gray-500 mt-2">Cargando productos...</p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No se encontraron productos.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-gray-900 border-b border-gray-200">
                            <th className="p-4 font-semibold">Imagen</th>
                            <th className="p-4 font-semibold">ID</th>
                            <th className="p-4 font-semibold">Nombre</th>
                            <th className="p-4 font-semibold">Categoría</th>
                            <th className="p-4 font-semibold">Precio</th>
                            <th className="p-4 font-semibold">Estado</th>
                            <th className="p-4 font-semibold">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map((product) => (
                            <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                              <td className="p-4">
                                <img
                                  src={product.image || "/placeholder.svg"}
                                  alt={product.name}
                                  className="w-16 h-16 object-cover rounded"
                                  loading="lazy"
                                />
                              </td>
                              <td className="p-4 text-gray-900 font-medium">
                                {product.id_producto || product.id}
                              </td>
                              <td className="p-4 text-gray-900">{product.name}</td>
                              <td className="p-4 text-gray-900">{product.category}</td>
                              <td className="p-4 text-gray-900 font-medium">
                                S/{getDiscountedPrice(product.price, product.discount)}
                                {product.discount && (
                                  <>
                                    <span className="text-sm text-gray-500 line-through ml-2">
                                      S/{product.originalPrice}
                                    </span>
                                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full ml-2">
                                      -{product.discount}%
                                    </span>
                                  </>
                                )}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    product.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {product.inStock ? "En Stock" : "Agotado"}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditProduct(product)}
                                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-1"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    disabled={isLoading}
                                    className={`px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center gap-1 ${
                                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* GESTIÓN DE CATEGORÍAS */}
            {activeTab === "categories" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900">Gestión de Categorías</h3>
                  <button
                    onClick={() => setShowCategoryModal(true)}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Nueva Categoría
                  </button>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                      <div key={category.id_categoria} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                          <Tag className="w-6 h-6 text-red-600" />
                          <h4 className="text-lg font-semibold text-gray-900">{category.nombre}</h4>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">
                          {category.descripcion || "Sin descripción"}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            ID: {category.id_categoria}
                          </span>
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                            Editar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {categories.length === 0 && (
                    <div className="text-center py-12">
                      <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No hay categorías registradas</p>
                      <p className="text-gray-400 text-sm mt-2">Crea tu primera categoría para organizar tus productos</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MODAL PARA AGREGAR PRODUCTO */}
            {showAddModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Agregar Nuevo Producto</h3>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Producto</label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                        placeholder="Ej: MacBook Pro 14"
                      />
                      {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                      >
                        <option value="Todos">Seleccionar categoría</option>
                        {categories.map((category) => (
                          <option key={category.id_categoria} value={category.nombre}>
                            {category.nombre}
                          </option>
                        ))}
                      </select>
                      {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Precio (S/)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                          placeholder="0.00"
                        />
                        {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Descuento (%)</label>
                        <input
                          type="number"
                          value={newProduct.discount}
                          onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                          placeholder="0"
                        />
                        {errors.discount && <p className="text-red-600 text-sm mt-1">{errors.discount}</p>}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL de la Imagen</label>
                      <input
                        type="url"
                        value={newProduct.image}
                        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                      {errors.image && <p className="text-red-600 text-sm mt-1">{errors.image}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                      <textarea
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                        placeholder="Descripción detallada del producto..."
                      />
                      {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Características</label>
                      <textarea
                        value={newProduct.characteristics}
                        onChange={(e) => setNewProduct({ ...newProduct, characteristics: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                        placeholder="Características técnicas del producto..."
                      />
                      {errors.characteristics && <p className="text-red-600 text-sm mt-1">{errors.characteristics}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Código de Producto</label>
                      <input
                        type="text"
                        value={newProduct.productCode}
                        onChange={(e) => setNewProduct({ ...newProduct, productCode: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                        placeholder="SKU-001"
                      />
                      {errors.productCode && <p className="text-red-600 text-sm mt-1">{errors.productCode}</p>}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="inStock"
                        checked={newProduct.inStock}
                        onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.checked })}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
                      />
                      <label htmlFor="inStock" className="text-sm font-medium text-gray-700">
                        Producto en stock
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveNewProduct}
                      disabled={isLoading}
                      className={`px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isLoading ? "Guardando..." : "Guardar Producto"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL PARA CREAR CATEGORÍA */}
            {showCategoryModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Nueva Categoría</h3>
                    <button
                      onClick={() => setShowCategoryModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Categoría</label>
                      <input
                        type="text"
                        value={newCategory.nombre}
                        onChange={(e) => setNewCategory({ ...newCategory, nombre: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                        placeholder="Ej: Laptops Gaming"
                      />
                      {errors.categoryName && <p className="text-red-600 text-sm mt-1">{errors.categoryName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Descripción (Opcional)</label>
                      <textarea
                        value={newCategory.descripcion}
                        onChange={(e) => setNewCategory({ ...newCategory, descripcion: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                        placeholder="Descripción de la categoría..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowCategoryModal(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreateCategory}
                      disabled={isLoading}
                      className={`px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isLoading ? "Creando..." : "Crear Categoría"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL PARA EDITAR PRODUCTO */}
            {showEditModal && editProduct && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Editar Producto</h3>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Producto</label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                      />
                      {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                      >
                        <option value="Todos">Seleccionar categoría</option>
                        {categories.map((category) => (
                          <option key={category.id_categoria} value={category.nombre}>
                            {category.nombre}
                          </option>
                        ))}
                      </select>
                      {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Precio (S/)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                        />
                        {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Descuento (%)</label>
                        <input
                          type="number"
                          value={newProduct.discount}
                          onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                        />
                        {errors.discount && <p className="text-red-600 text-sm mt-1">{errors.discount}</p>}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL de la Imagen</label>
                      <input
                        type="url"
                        value={newProduct.image}
                        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                      />
                      {errors.image && <p className="text-red-600 text-sm mt-1">{errors.image}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                      <textarea
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                      />
                      {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Características</label>
                      <textarea
                        value={newProduct.characteristics}
                        onChange={(e) => setNewProduct({ ...newProduct, characteristics: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                      />
                      {errors.characteristics && <p className="text-red-600 text-sm mt-1">{errors.characteristics}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Código de Producto</label>
                      <input
                        type="text"
                        value={newProduct.productCode}
                        onChange={(e) => setNewProduct({ ...newProduct, productCode: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                      />
                      {errors.productCode && <p className="text-red-600 text-sm mt-1">{errors.productCode}</p>}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="editInStock"
                        checked={newProduct.inStock}
                        onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.checked })}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
                      />
                      <label htmlFor="editInStock" className="text-sm font-medium text-gray-700">
                        Producto en stock
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveEditProduct}
                      disabled={isLoading}
                      className={`px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isLoading ? "Guardando..." : "Actualizar Producto"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {toast && (
              <div
                className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white ${
                  toast.type === "success" ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {toast.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})