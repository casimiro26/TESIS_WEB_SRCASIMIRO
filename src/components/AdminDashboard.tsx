"use client"

import type React from "react"
import { useState, memo, useMemo } from "react"
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
} from "chart.js"
import { Line, Doughnut, Bar } from "react-chartjs-2"
import { useStore } from "../context/StoreContext"
import { useCart } from "../context/CartContext"
import type { Product } from "../types"
import type { Order } from "../context/StoreContext"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend)

interface AdminDashboardProps {
  isOpen: boolean
  onClose: () => void
}

interface Activity {
  id: string
  type: "order" | "product_added" | "payment_confirmed"
  description: string
  timestamp: string // ISO string or formatted date
}

export const AdminDashboard: React.FC<AdminDashboardProps> = memo(({ isOpen, onClose }) => {
  const { products, orders, addProduct, updateProduct, deleteProduct, confirmReceipt } = useStore()
  useCart()

  const [activeTab, setActiveTab] = useState("overview")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
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
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [errors, setErrors] = useState({
    name: "",
    category: "",
    price: "",
    discount: "",
    image: "",
    description: "",
    characteristics: "",
    productCode: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState<Order | null>(null)
  const [orderSearchTerm, setOrderSearchTerm] = useState("")
  const [orderFilter, setOrderFilter] = useState("Todos")
  const [productFilter, setProductFilter] = useState("Todos")

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const categoryDistribution: Record<string, number> = {}

    products.forEach((product) => {
      categoryDistribution[product.category] = (categoryDistribution[product.category] || 0) + 1
    })

    return {
      totalUsers: 1247,
      totalOrders: orders.length,
      totalRevenue,
      totalProducts: products.length,
      monthlySales: [1500, 2000, 2500, 3000, 4500, totalRevenue],
      categoryDistribution,
    }
  }, [products, orders])

  const recentActivities = useMemo(() => {
    const activities: Activity[] = []

    orders.forEach((order) => {
      activities.push({
        id: `order-${order.id}`,
        type: "order",
        description: `Nuevo pedido #${order.id} de ${order.customer.name} por S/${order.total.toFixed(2)}`,
        timestamp: order.date,
      })
      if (order.hasReceipt) {
        activities.push({
          id: `payment-${order.id}`,
          type: "payment_confirmed",
          description: `Comprobante de pago confirmado para el pedido #${order.id}`,
          timestamp: order.date,
        })
      }
    })

    products.slice(0, 3).forEach((product, index) => {
      const simulatedDate = new Date()
      simulatedDate.setDate(simulatedDate.getDate() - index)
      activities.push({
        id: `product-${product.id}`,
        type: "product_added",
        description: `Producto "${product.name}" agregado al inventario`,
        timestamp: simulatedDate.toISOString(),
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
      const count = recentActivities.filter((activity) => {
        const activityDate = new Date(activity.timestamp)
        return (
          activityDate.getDate() === date.getDate() &&
          activityDate.getMonth() === date.getMonth() &&
          activityDate.getFullYear() === date.getFullYear()
        )
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
      newErrors.price = "El precio debe ser un número entre 0.01 y 10000 (sin comas)"
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
    if (selectedCategory === "Todos") {
      setToast({ message: "Por favor, selecciona una categoría antes de agregar un producto.", type: "error" })
      setTimeout(() => setToast(null), 3000)
      return
    }
    setNewProduct((prev) => ({ ...prev, category: selectedCategory }))
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

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      deleteProduct(productId)
      setToast({ message: "Producto eliminado con éxito", type: "success" })
      setTimeout(() => setToast(null), 3000)
    }
  }

  const handleSaveNewProduct = () => {
    if (!validateForm()) return

    setIsLoading(true)
    setTimeout(() => {
      const discount = newProduct.discount ? Number(newProduct.discount) : undefined
      const price = Number(newProduct.price)
      const originalPrice = discount ? Math.round(price / (1 - discount / 100)) : undefined

      addProduct({
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
      })

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
      })
      setIsLoading(false)
      setToast({ message: "Producto agregado con éxito", type: "success" })
      setTimeout(() => setToast(null), 3000)
    }, 1000)
  }

  const handleSaveEditProduct = () => {
    if (!validateForm() || !editProduct) return

    setIsLoading(true)
    setTimeout(() => {
      const discount = newProduct.discount ? Number(newProduct.discount) : undefined
      const price = Number(newProduct.price)
      const originalPrice = discount ? Math.round(price / (1 - discount / 100)) : undefined

      updateProduct(editProduct.id, {
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
      })

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
      })
      setIsLoading(false)
      setToast({ message: "Producto actualizado con éxito", type: "success" })
      setTimeout(() => setToast(null), 3000)
    }, 1000)
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
      default:
        return <Activity className="w-5 h-5 text-gray-600" />
    }
  }

  const getActivityBadge = (type: Activity["type"]) => {
    switch (type) {
      case "order":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">
            Pedido
          </span>
        )
      case "product_added":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded-full">
            Producto Agregado
          </span>
        )
      case "payment_confirmed":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-600 rounded-full">
            Pago Confirmado
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
            Actividad
          </span>
        )
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
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
            aria-label="Cerrar dashboard"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(100%-64px)]">
          <div className="w-64 bg-gray-900 text-white p-6">
            <nav className="space-y-4">
              {[
                { id: "overview", label: "Resumen General", icon: TrendingUp },
                { id: "products", label: "Productos", icon: Package },
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
            {activeTab === "overview" && (
              <div className="space-y-8">
                <h2 className="text-2xl font-semibold text-gray-900">Dashboard Resumen General</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <Users className="w-6 h-6 text-red-600" />
                      <p className="text-gray-600 font-medium">Total Usuarios</p>
                    </div>
                    <p className="text-3xl font-bold text-red-600 mt-2">{stats.totalUsers.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">+12.5% este mes</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <Package className="w-6 h-6 text-red-600" />
                      <p className="text-gray-600 font-medium">Total Productos</p>
                    </div>
                    <p className="text-3xl font-bold text-red-600 mt-2">{stats.totalProducts.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">En inventario</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-6 h-6 text-red-600" />
                      <p className="text-gray-600 font-medium">Total Pedidos</p>
                    </div>
                    <p className="text-3xl font-bold text-red-600 mt-2">{stats.totalOrders.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">+3.2% conversión</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-6 h-6 text-red-600" />
                      <p className="text-gray-600 font-medium">Ingresos</p>
                    </div>
                    <p className="text-3xl font-bold text-red-600 mt-2">S/{stats.totalRevenue.toFixed(2)}</p>
                    <p className="text-sm text-gray-500 mt-1">Este mes</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-[450px]">
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-2">Ventas Mensuales</h3>
                    <p className="text-sm text-gray-500 font-medium mb-4">Últimos 6 meses</p>
                    <div className="h-72">
                      <Line
                        data={{
                          labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
                          datasets: [
                            {
                              label: "Ventas",
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
                            title: {
                              display: true,
                              text: "Ventas Mensuales (S/)",
                              font: { size: 18, weight: "bold" },
                              color: "#1f2937",
                              padding: { top: 10, bottom: 20 },
                              align: "center" as const,
                            },
                          },
                          scales: {
                            x: {
                              ticks: { font: { size: 14 }, color: "#1f2937" },
                              grid: { display: false },
                            },
                            y: {
                              ticks: { font: { size: 14 }, color: "#1f2937" },
                              grid: { color: "#e5e7eb" },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-[450px]">
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-2">Distribución por Categoría</h3>
                    <p className="text-sm text-gray-500 font-medium mb-4">Por producto</p>
                    <div className="h-60">
                      <Doughnut
                        data={{
                          labels: Object.keys(stats.categoryDistribution),
                          datasets: [
                            {
                              data: Object.values(stats.categoryDistribution),
                              backgroundColor: [
                                "#ef4444",
                                "#3b82f6",
                                "#10b981",
                                "#f59e0b",
                                "#8b5cf6",
                                "#ec4899",
                                "#06b6d4",
                                "#f97316",
                                "#14b8a6",
                                "#a855f7",
                                "#84cc16",
                              ],
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          cutout: "50%",
                          plugins: {
                            legend: { display: false },
                            title: {
                              display: true,
                              text: "Distribución por Categoría",
                              font: { size: 18, weight: "bold" },
                              color: "#1f2937",
                              padding: { top: 10, bottom: 20 },
                              align: "center" as const,
                            },
                          },
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
                                "#ef4444",
                                "#3b82f6",
                                "#10b981",
                                "#f59e0b",
                                "#8b5cf6",
                                "#ec4899",
                                "#06b6d4",
                                "#f97316",
                                "#14b8a6",
                                "#a855f7",
                                "#84cc16",
                              ][index % 11],
                            }}
                          ></span>
                          <span className="text-sm text-gray-600 font-normal">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
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
                              labels: {
                                font: { size: 12 },
                                color: "#1f2937",
                              },
                            },
                            title: {
                              display: false,
                            },
                            tooltip: {
                              backgroundColor: "#1f2937",
                              titleFont: { size: 14 },
                              bodyFont: { size: 12 },
                              padding: 10,
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

            {activeTab === "products" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">Gestión de Productos</h3>
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
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                    >
                      <Package className="w-5 h-5" />
                      Agregar Producto
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {[
                      "Todos",
                      "Impresoras",
                      "Cables",
                      "Pantallas",
                      "Gaming",
                      "Monitores",
                      "Laptops",
                      "Cargadores",
                      "Mouse",
                      "Teclados",
                      "Partes de pc",
                      "Cámaras de Seguridad",
                    ].map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                          selectedCategory === category
                            ? "bg-red-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                  {filteredProducts.length === 0 ? (
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
                              <td className="p-4 text-gray-900 font-medium">{product.id}</td>
                              <td className="p-4 text-gray-900">{product.name}</td>
                              <td className="p-4 text-gray-900">{product.category}</td>
                              <td className="p-4 text-gray-900 font-medium">
                                ${getDiscountedPrice(product.price, product.discount)}
                                {product.discount && (
                                  <>
                                    <span className="text-sm text-gray-500 line-through ml-2">
                                      ${product.originalPrice}
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
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center gap-1"
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

            {showAddModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-gradient-to-br from-red-50 to-gray-100 rounded-2xl p-8 w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto transform scale-95 animate-[scale-in_0.3s_ease-out] border border-red-200">
                  <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Package className="w-6 h-6 text-red-600" />
                    Agregar Nuevo Producto
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          className={`w-full px-4 py-3 border ${
                            errors.name ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white/80 shadow-sm transition-all duration-300`}
                          placeholder="Ej: Teclado Mecánico RGB"
                        />
                        <Package className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      </div>
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría</label>
                      <div className="relative">
                        <select
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                          className={`w-full px-4 py-3 border ${
                            errors.category ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white/80 shadow-sm transition-all duration-300 appearance-none`}
                        >
                          <option value="">Seleccionar categoría</option>
                          {[
                            "Impresoras",
                            "Cables",
                            "Pantallas",
                            "Gaming",
                            "Monitores",
                            "Laptops",
                            "Cargadores",
                            "Mouse",
                            "Teclados",
                            "Partes de pc",
                            "Cámaras de Seguridad",
                          ].map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <svg
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                      {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Precio (S/)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          className={`w-full px-4 py-3 border ${
                            errors.price ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white/80 shadow-sm transition-all duration-300`}
                          step="any"
                          min="0.01"
                          max="10000"
                          placeholder="Ej: 50000"
                        />
                        <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      </div>
                      {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Descuento (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={newProduct.discount}
                          onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                          className={`w-full px-4 py-3 border ${
                            errors.discount ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white/80 shadow-sm transition-all duration-300`}
                          placeholder="Ej: 10 (opcional)"
                          min="0"
                          max="100"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">%</span>
                      </div>
                      {errors.discount && <p className="text-red-500 text-xs mt-1">{errors.discount}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">URL de Imagen</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={newProduct.image}
                          onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                          className={`w-full px-4 py-3 border ${
                            errors.image ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white/80 shadow-sm transition-all duration-300`}
                          placeholder="Ej: https://ejemplo.com/imagen.jpg"
                        />
                        <svg
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                      {newProduct.image && (
                        <div className="mt-3 border border-gray-300 rounded-lg p-3 bg-white/50 shadow-sm">
                          <img
                            src={newProduct.image || "/placeholder.svg"}
                            alt="Vista previa"
                            className="w-full h-40 object-contain rounded-lg"
                            onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                      <textarea
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        className={`w-full px-4 py-3 border ${
                          errors.description ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white/80 shadow-sm transition-all duration-300`}
                        rows={4}
                        placeholder="Ej: Teclado mecánico con retroiluminación RGB y switches Cherry MX"
                      />
                      {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Características</label>
                      <textarea
                        value={newProduct.characteristics}
                        onChange={(e) => setNewProduct({ ...newProduct, characteristics: e.target.value })}
                        className={`w-full px-4 py-3 border ${
                          errors.characteristics ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white/80 shadow-sm transition-all duration-300`}
                        rows={4}
                        placeholder="Ej: Conexión USB-C, 100 teclas, peso 1.2kg"
                      />
                      {errors.characteristics && <p className="text-red-500 text-xs mt-1">{errors.characteristics}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Código de Producto</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={newProduct.productCode}
                          onChange={(e) => setNewProduct({ ...newProduct, productCode: e.target.value })}
                          className={`w-full px-4 py-3 border ${
                            errors.productCode ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white/80 shadow-sm transition-all duration-300`}
                          placeholder="Ej: TK-MRGB-001"
                        />
                        <svg
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m-2 4h2M6 12h4m-6 0h2v4m0-11v3"
                          />
                        </svg>
                      </div>
                      {errors.productCode && <p className="text-red-500 text-xs mt-1">{errors.productCode}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={newProduct.inStock}
                        onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.checked })}
                        className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <label className="text-sm font-semibold text-gray-700">En Stock</label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-8">
                    <button
                      onClick={() => {
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
                        })
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 shadow-md hover:shadow-lg transition-all duration-300 font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveNewProduct}
                      disabled={isLoading}
                      className={`px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-300 font-semibold flex items-center gap-2 ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                      Guardar Producto
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showEditModal && editProduct && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-lg max-h-[90vh] overflow-y-auto">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Editar Producto</h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        className={`w-full px-4 py-2 border ${
                          errors.name ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all`}
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className={`w-full px-4 py-2 border ${
                          errors.category ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all`}
                      >
                        <option value="">Seleccionar categoría</option>
                        {[
                          "Impresoras",
                          "Cables",
                          "Pantallas",
                          "Gaming",
                          "Monitores",
                          "Laptops",
                          "Cargadores",
                          "Mouse",
                          "Teclados",
                          "Partes de pc",
                          "Cámaras de Seguridad",
                        ].map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio (S/)</label>
                      <input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        className={`w-full px-4 py-2 border ${
                          errors.price ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all`}
                        step="any"
                        min="0.01"
                        max="10000"
                        placeholder="Ej: 50000"
                      />
                      {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descuento (%)</label>
                      <input
                        type="number"
                        value={newProduct.discount}
                        onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                        className={`w-full px-4 py-2 border ${
                          errors.discount ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all`}
                        placeholder="0-100 (opcional)"
                        min="0"
                        max="100"
                      />
                      {errors.discount && <p className="text-red-500 text-xs mt-1">{errors.discount}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
                      <input
                        type="text"
                        value={newProduct.image}
                        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                        className={`w-full px-4 py-2 border ${
                          errors.image ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all`}
                      />
                      {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                      {newProduct.image && (
                        <div className="mt-2 border border-gray-300 rounded-lg p-2 bg-gray-50">
                          <img
                            src={newProduct.image || "/placeholder.svg"}
                            alt="Vista previa"
                            className="w-full h-auto object-contain rounded"
                            onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <textarea
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        className={`w-full px-4 py-2 border ${
                          errors.description ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all`}
                        rows={3}
                      />
                      {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Características</label>
                      <textarea
                        value={newProduct.characteristics}
                        onChange={(e) => setNewProduct({ ...newProduct, characteristics: e.target.value })}
                        className={`w-full px-4 py-2 border ${
                          errors.characteristics ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all`}
                        rows={3}
                      />
                      {errors.characteristics && <p className="text-red-500 text-xs mt-1">{errors.characteristics}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Código de Producto</label>
                      <input
                        type="text"
                        value={newProduct.productCode}
                        onChange={(e) => setNewProduct({ ...newProduct, productCode: e.target.value })}
                        className={`w-full px-4 py-2 border ${
                          errors.productCode ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all`}
                      />
                      {errors.productCode && <p className="text-red-500 text-xs mt-1">{errors.productCode}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newProduct.inStock}
                        onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.checked })}
                        className="h-4 w-4 text-red-600 focus:ring-red-600 border-gray-300 rounded"
                      />
                      <label className="text-sm font-medium text-gray-700">En Stock</label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => {
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
                        })
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveEditProduct}
                      disabled={isLoading}
                      className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Guardar
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

            {activeTab === "orders" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">Pedidos Recientes</h3>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div className="relative w-full sm:w-1/2">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Buscar por cliente, ID o producto..."
                        value={orderSearchTerm}
                        onChange={(e) => setOrderSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all text-lg"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="text-gray-400 w-5 h-5" />
                      <select
                        value={orderFilter}
                        onChange={(e) => setOrderFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                      >
                        <option value="Todos">Todos</option>
                        <option value="Falta Comprobante">Falta Comprobante</option>
                        <option value="Comprobante Recibido">Comprobante Recibido</option>
                      </select>
                    </div>
                  </div>
                  {filteredOrders.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No se encontraron pedidos.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-gray-900 border-b border-gray-200">
                            <th className="p-4 font-semibold">ID Pedido</th>
                            <th className="p-4 font-semibold">Cliente</th>
                            <th className="p-4 font-semibold">Productos</th>
                            <th className="p-4 font-semibold">Fecha</th>
                            <th className="p-4 font-semibold">Monto</th>
                            <th className="p-4 font-semibold">Estado</th>
                            <th className="p-4 font-semibold">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((order) => (
                            <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                              <td className="p-4 text-gray-900 font-medium">{order.id}</td>
                              <td className="p-4 text-gray-900">{order.customer.name}</td>
                              <td className="p-4 text-gray-900">{order.items.length} producto(s)</td>
                              <td className="p-4 text-gray-900">{order.date}</td>
                              <td className="p-4 text-gray-900 font-medium">S/{order.total.toFixed(2)}</td>
                              <td className="p-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    order.hasReceipt ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {order.hasReceipt ? "Comprobante Recibido" : "Falta Comprobante"}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setShowOrderDetails(order)}
                                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-1"
                                  >
                                    <Eye className="w-4 h-4" />
                                    Detalles
                                  </button>
                                  {!order.hasReceipt && (
                                    <button
                                      onClick={() => handleConfirmReceipt(order.id)}
                                      disabled={isLoading || !order.paymentProof}
                                      className={`px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1 ${
                                        isLoading || !order.paymentProof ? "opacity-50 cursor-not-allowed" : ""
                                      }`}
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      Confirmar
                                    </button>
                                  )}
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

            {showOrderDetails && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Detalles del Pedido #{showOrderDetails.id}</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Cliente</p>
                      <p className="text-gray-900 font-medium">{showOrderDetails.customer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">DNI</p>
                      <p className="text-gray-900">{showOrderDetails.customer.dni}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Correo</p>
                      <p className="text-gray-900">{showOrderDetails.customer.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Teléfono</p>
                      <p className="text-gray-900">{showOrderDetails.customer.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Dirección de Envío</p>
                      <p className="text-gray-900">{showOrderDetails.customer.address}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Productos</p>
                      <div className="space-y-2">
                        {showOrderDetails.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <img
                              src={item.product.image || "../assets/images/s-r.png"}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.product.name}</p>
                              <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                              <p className="text-sm text-gray-600">Descripción: {item.product.description}</p>
                              <p className="text-sm text-gray-600">Características: {item.product.characteristics || "N/A"}</p>
                              <p className="text-sm text-gray-600">Código de Producto: {item.product.productCode || "N/A"}</p>
                            </div>
                            <p className="font-bold text-red-600">
                              S/{(item.product.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Fecha</p>
                      <p className="text-gray-900">{showOrderDetails.date}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Monto Total</p>
                      <p className="text-gray-900 font-bold text-xl">S/{showOrderDetails.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Estado</p>
                      <span
                        className={`text-sm font-medium ${
                          showOrderDetails.hasReceipt ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {showOrderDetails.hasReceipt ? "Comprobante Recibido" : "Falta Comprobante"}
                      </span>
                    </div>
                    {showOrderDetails.paymentProof && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Comprobante de Pago</p>
                        <button
                          onClick={() => handleViewPaymentProof(showOrderDetails.paymentProof!)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1 mt-2"
                        >
                          <FileText className="w-4 h-4" />
                          Ver Comprobante
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => setShowOrderDetails(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h3>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      Total de {stats.totalUsers.toLocaleString()} usuarios registrados
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
