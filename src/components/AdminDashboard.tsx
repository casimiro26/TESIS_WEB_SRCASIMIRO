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
  EyeOff,
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
  ImageIcon,
  CreditCard,
  UserPlus,
  Shield,
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
  Filler,
} from "chart.js"
import { Line, Doughnut, Bar } from "react-chartjs-2"
import { useStore } from "../context/StoreContext"
import { useCart } from "../context/CartContext"
import type { Product } from "../types"
import type { Order } from "../context/StoreContext"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend, Filler)

interface AdminDashboardProps {
  isOpen: boolean
  onClose: () => void
}

// The 'Activity' interface was already defined. The lint rule indicates a potential redeclaration or an issue if this was meant to be a different 'Activity'. Assuming it's the intended definition for activity logs.

interface Category {
  id_categoria: number
  nombre: string
  descripcion: string
}

interface Pago {
  id_pago: number
  userId: string
  userModel: "Usuario" | "Cliente"
  monto: number
  stripePaymentId: string
  status: "pending" | "succeeded" | "failed"
  createdAt: string
}

interface Admin {
  id: number
  nombre: string
  email: string
  role: string
  createdAt: string
  id_usuario?: number
  nombreCompleto?: string
  correo?: string
  role?: string
}

// Configuración de la API
const API_BASE_URL = "https://api-web-egdy.onrender.com/api"

// Servicio completo para ¿?
const adminService = {
  // Crear nuevo administrador
  crearAdmin: async (token: string, adminData: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/crear-admin`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(adminData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ mensaje: "Error al crear administrador" }))
      throw new Error(errorData.mensaje || `Error: ${response.status}`)
    }

    return response.json()
  },

  // Obtener lista de administradores
  getAdmins: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/superadmin/admins`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        return { admins: [] }
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching admins:", error)
      return { admins: [] }
    }
  },

  // Actualizar administrador
  actualizarAdmin: async (token: string, id: number, adminData: any) => {
    const response = await fetch(`${API_BASE_URL}/superadmin/admins/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(adminData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ mensaje: "Error al actualizar administrador" }))
      throw new Error(errorData.mensaje || `Error: ${response.status}`)
    }

    return response.json()
  },

  // Eliminar administrador
  eliminarAdmin: async (token: string, id: number) => {
    const response = await fetch(`${API_BASE_URL}/superadmin/admins/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ mensaje: "Error al eliminar administrador" }))
      throw new Error(errorData.mensaje || `Error: ${response.status}`)
    }

    return response.json()
  },
}

// Servicio para pagos
const pagoService = {
  // Obtener todos los pagos (para admin)
  getPagos: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/pagos`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        // Si falla, retornar array vacío en lugar de error
        return { pagos: [] }
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching payments:", error)
      return { pagos: [] }
    }
  },
}

// Servicio para estadísticas
const statsService = {
  // Obtener estadísticas reales
  getEstadisticas: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/estadisticas`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        // Si falla, retornar estadísticas por defecto
        return {
          totalClientes: 0,
          totalProductos: 0,
          totalPedidos: 0,
          ingresosTotales: 0,
          ventasMensuales: [0, 0, 0, 0, 0, 0],
          distribucionCategorias: {},
        }
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching statistics:", error)
      return {
        totalClientes: 0,
        totalProductos: 0,
        totalPedidos: 0,
        ingresosTotales: 0,
        ventasMensuales: [0, 0, 0, 0, 0, 0],
        distribucionCategorias: {},
      }
    }
  },
}

// Servicio para productos
const productoService = {
  getProductos: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/productos`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ mensaje: "Error al obtener productos" }))
      throw new Error(errorData.mensaje || `Error: ${response.status}`)
    }

    return response.json()
  },

  crearProducto: async (token: string, productoData: any) => {
    const response = await fetch(`${API_BASE_URL}/productos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productoData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ mensaje: "Error al crear producto" }))
      throw new Error(errorData.mensaje || `Error: ${response.status}`)
    }

    return response.json()
  },

  actualizarProducto: async (token: string, id: number, productoData: any) => {
    const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productoData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ mensaje: "Error al actualizar producto" }))
      throw new Error(errorData.mensaje || `Error: ${response.status}`)
    }

    return response.json()
  },

  eliminarProducto: async (token: string, id: number) => {
    const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ mensaje: "Error al eliminar producto" }))
      throw new Error(errorData.mensaje || `Error: ${response.status}`)
    }

    return response.json()
  },
}

// Servicio para categorías
const categoriaService = {
  getCategorias: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/categorias`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ mensaje: "Error al obtener categorías" }))
      throw new Error(errorData.mensaje || `Error: ${response.status}`)
    }

    return response.json()
  },

  crearCategoria: async (token: string, categoriaData: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/crear-categoria`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoriaData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ mensaje: "Error al crear categoría" }))
      throw new Error(errorData.mensaje || `Error: ${response.status}`)
    }

    return response.json()
  },

  actualizarCategoria: async (token: string, id: number, categoriaData: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/categorias/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoriaData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ mensaje: "Error al actualizar categoría" }))
      throw new Error(errorData.mensaje || `Error: ${response.status}`)
    }

    return response.json()
  },

  eliminarCategoria: async (token: string, id: number) => {
    const response = await fetch(`${API_BASE_URL}/admin/categorias/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ mensaje: "Error al eliminar categoría" }))
      throw new Error(errorData.mensaje || `Error: ${response.status}`)
    }

    return response.json()
  },
}

export const AdminDashboard: React.FC<AdminDashboardProps> = memo(({ isOpen, onClose }) => {
  // MODIFICACIÓN: Agregar loadAdminOrders y confirmOrder al useStore
  const { orders, loadAdminOrders, confirmOrder, error: storeError, clearError } = useStore()

  useCart()

  const [activeTab, setActiveTab] = useState("overview")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false)
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
    descripcion: "",
  })
  const [newAdmin, setNewAdmin] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [pagos, setPagos] = useState<Pago[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [errors, setErrors] = useState({
    name: "",
    category: "",
    price: "",
    discount: "",
    image: "",
    description: "",
    characteristics: "",
    productCode: "",
    categoryName: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    adminConfirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState<Order | null>(null)
  const [orderSearchTerm, setOrderSearchTerm] = useState("")
  const [orderFilter, setOrderFilter] = useState("Todos")
  const [productFilter, setProductFilter] = useState("Todos")
  const [refreshing, setRefreshing] = useState(false)
  const [imagePreview, setImagePreview] = useState("")
  // === NUEVOS ESTADOS PARA FILTROS DE TIEMPO ===
const [timeFilter, setTimeFilter] = useState('month') // 'day', 'week', 'month', 'year'
const [selectedDate, setSelectedDate] = useState(new Date())
const [salesData, setSalesData] = useState<number[]>([])
const [realTimeStats, setRealTimeStats] = useState({
  totalSales: 0,
  totalOrders: 0,
  categoryDistribution: {} as Record<string, number>
})
  const [estadisticasReales, setEstadisticasReales] = useState({
    totalClientes: 0,
    totalProductos: 0,
    totalPedidos: 0,
    ingresosTotales: 0,
    ventasMensuales: [0, 0, 0, 0, 0, 0],
    distribucionCategorias: {} as Record<string, number>,
  })

  // Estados nuevos para editar administradores
  const [showEditAdminModal, setShowEditAdminModal] = useState(false)
  const [editAdmin, setEditAdmin] = useState<any>(null)
  const [editAdminData, setEditAdminData] = useState({
    nombreCompleto: "",
    correo: "",
    contrasena: "",
  })
  const [showEditPassword, setShowEditPassword] = useState(false)

  // Función para obtener el token
  const getToken = (): string => {
    const token = localStorage.getItem("sr-robot-token")
    if (!token) {
      throw new Error("No se encontró token de autenticación")
    }
    return token
  }


  // === NUEVAS FUNCIONES PARA FILTROS DE TIEMPO ===
const getDateRange = (filter: string, date: Date) => {
  const start = new Date(date)
  const end = new Date(date)

  switch (filter) {
    case 'day':
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'week':
      const day = start.getDay()
      const diff = start.getDate() - day + (day === 0 ? -6 : 1)
      start.setDate(diff)
      start.setHours(0, 0, 0, 0)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      break
    case 'month':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(start.getMonth() + 1)
      end.setDate(0)
      end.setHours(23, 59, 59, 999)
      break
    case 'year':
      start.setMonth(0, 1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(11, 31)
      end.setHours(23, 59, 59, 999)
      break
    default:
      break
  }

  return { start, end }
}

const getPeriodLabel = () => {
  const { start, end } = getDateRange(timeFilter, selectedDate)
  
  switch (timeFilter) {
    case 'day':
      return start.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    case 'week':
      return `Semana del ${start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} al ${end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`
    case 'month':
      return start.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    case 'year':
      return start.getFullYear().toString()
    default:
      return ''
  }
}

const getChartLabels = () => {
  const { start } = getDateRange(timeFilter, selectedDate)
  
  switch (timeFilter) {
    case 'day':
      return Array.from({ length: 24 }, (_, i) => `${i}:00`)
    case 'week':
      return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    case 'month':
      const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate()
      return Array.from({ length: Math.ceil(daysInMonth / 7) }, (_, i) => `Sem ${i + 1}`)
    case 'year':
      return ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    default:
      return []
  }
}

const handleTimeFilterChange = (filter: string) => {
  setTimeFilter(filter)
  loadSalesDataForPeriod(filter, selectedDate)
}

const navigatePeriod = (direction: number) => {
  const newDate = new Date(selectedDate)
  
  switch (timeFilter) {
    case 'day':
      newDate.setDate(newDate.getDate() + direction)
      break
    case 'week':
      newDate.setDate(newDate.getDate() + (direction * 7))
      break
    case 'month':
      newDate.setMonth(newDate.getMonth() + direction)
      break
    case 'year':
      newDate.setFullYear(newDate.getFullYear() + direction)
      break
    default:
      break
  }
  
  setSelectedDate(newDate)
  loadSalesDataForPeriod(timeFilter, newDate)
}

// Función para cargar datos de ventas según el período
const loadSalesDataForPeriod = async (filter: string, date: Date) => {
  try {
    setIsLoading(true)
    const token = getToken()
    const { start, end } = getDateRange(filter, date)
    
    // Simular datos reales basados en los pagos existentes
    const pagosFiltrados = pagos.filter(pago => {
      const pagoDate = new Date(pago.createdAt)
      return pagoDate >= start && pagoDate <= end && pago.status === 'succeeded'
    })
    
    // Generar datos para el gráfico según el filtro
    let datosGrafico: number[] = []
    
    switch (filter) {
      case 'day':
        datosGrafico = Array.from({ length: 24 }, (_, hora) => {
          return pagosFiltrados
            .filter(pago => new Date(pago.createdAt).getHours() === hora)
            .reduce((sum, pago) => sum + pago.monto, 0)
        })
        break
      case 'week':
        datosGrafico = Array.from({ length: 7 }, (_, dia) => {
          return pagosFiltrados
            .filter(pago => new Date(pago.createdAt).getDay() === dia)
            .reduce((sum, pago) => sum + pago.monto, 0)
        })
        break
      case 'month':
        const semanasEnMes = Math.ceil((end.getDate() - start.getDate() + 1) / 7)
        datosGrafico = Array.from({ length: semanasEnMes }, (_, semana) => {
          const inicioSemana = new Date(start)
          inicioSemana.setDate(start.getDate() + (semana * 7))
          const finSemana = new Date(inicioSemana)
          finSemana.setDate(inicioSemana.getDate() + 6)
          
          return pagosFiltrados
            .filter(pago => {
              const pagoDate = new Date(pago.createdAt)
              return pagoDate >= inicioSemana && pagoDate <= finSemana
            })
            .reduce((sum, pago) => sum + pago.monto, 0)
        })
        break
      case 'year':
        datosGrafico = Array.from({ length: 12 }, (_, mes) => {
          return pagosFiltrados
            .filter(pago => new Date(pago.createdAt).getMonth() === mes)
            .reduce((sum, pago) => sum + pago.monto, 0)
        })
        break
    }
    
    setSalesData(datosGrafico)
    
    // Actualizar estadísticas en tiempo real
    setRealTimeStats({
      totalSales: pagosFiltrados.reduce((sum, pago) => sum + pago.monto, 0),
      totalOrders: pagosFiltrados.length,
      categoryDistribution: calculateCategoryDistribution(products) // Usar tu función existente
    })
    
  } catch (error) {
    console.error('Error loading sales data:', error)
    // En caso de error, usar datos de ejemplo
    const sampleData = generateSampleData(filter)
    setSalesData(sampleData)
  } finally {
    setIsLoading(false)
  }
}

// Función temporal para generar datos de ejemplo
const generateSampleData = (filter: string): number[] => {
  switch (filter) {
    case 'day':
      return Array.from({ length: 24 }, () => Math.floor(Math.random() * 1000) + 500)
    case 'week':
      return Array.from({ length: 7 }, () => Math.floor(Math.random() * 5000) + 2000)
    case 'month':
      return Array.from({ length: 4 }, () => Math.floor(Math.random() * 15000) + 8000)
    case 'year':
      return Array.from({ length: 12 }, () => Math.floor(Math.random() * 30000) + 15000)
    default:
      return []
  }
}
  const loadEstadisticasReales = async () => {
    try {
      const token = getToken()
      const data = await statsService.getEstadisticas(token)
      setEstadisticasReales(data)
    } catch (error: any) {
      console.error("Error loading statistics:", error)
      // Usar datos por defecto en caso de error
      setEstadisticasReales({
        totalClientes: 0,
        totalProductos: products.length,
        totalPedidos: orders.length,
        ingresosTotales: 0,
        ventasMensuales: [0, 0, 0, 0, 0, 0],
        distribucionCategorias: calculateCategoryDistribution(products),
      })
    }
  }

  const loadPagos = async () => {
    try {
      const token = getToken()
      const data = await pagoService.getPagos(token)
      setPagos(data.pagos || [])
    } catch (error: any) {
      console.error("Error loading payments:", error)
      setPagos([])
    }
  }

  const loadAdmins = async () => {
    try {
      const token = getToken()
      const data = await adminService.getAdmins(token)
      setAdmins(data.admins || [])
    } catch (error: any) {
      console.error("Error loading admins:", error)
      setAdmins([])
    }
  }

  const loadCategories = async () => {
    try {
      const token = getToken()
      const data = await categoriaService.getCategorias(token)
      setCategories(data.categorias || [])
    } catch (error: any) {
      console.error("Error loading categories:", error)
      setToast({ message: error.message || "Error al cargar categorías", type: "error" })
      const defaultCategories: Category[] = [
        { id_categoria: 1, nombre: "Laptops", descripcion: "Computadoras portátiles" },
        { id_categoria: 2, nombre: "Smartphones", descripcion: "Teléfonos inteligentes" },
        { id_categoria: 3, nombre: "Tablets", descripcion: "Tabletas y iPads" },
        { id_categoria: 4, nombre: "Accesorios", descripcion: "Accesorios tecnológicos" },
      ]
      setCategories(defaultCategories)
    }
  }

  const loadProducts = async () => {
    try {
      const token = getToken()
      const data = await productoService.getProductos(token)
      const mappedProducts = (data.productos || []).map((p: any) => ({
        id: p.id_producto?.toString() || p._id,
        id_producto: p.id_producto,
        name: p.nombre,
        category: p.categoria,
        price: p.price,
        originalPrice: p.originalPrice,
        discount: p.discount,
        image: p.image,
        description: p.description,
        characteristics: p.characteristics,
        productCode: p.productCode,
        rating: p.rating,
        reviews: p.reviews,
        inStock: p.inStock,
        featured: p.featured,
        createdAt: p.createdAt,
        creadoPor: p.creadoPor,
      }))
      setProducts(mappedProducts)
    } catch (error: any) {
      console.error("Error loading products:", error)
      setToast({ message: error.message || "Error al cargar productos", type: "error" })
      setProducts([])
    }
  }

  // MODIFICACIÓN: useEffect actualizado para incluir loadAdminOrders
  useEffect(() => {
    if (isOpen) {
      loadCategories()
      loadProducts()
      loadPagos()
      loadEstadisticasReales()
      loadAdmins()
      loadAdminOrders() // ← Reemplaza la carga local con esta
    }
  }, [isOpen])
  
  
// Y AGREGALE ESTA LÍNEA:
useEffect(() => {
  if (isOpen) {
    loadCategories()
    loadProducts()
    loadPagos()
    loadEstadisticasReales()
    loadAdmins()
    loadAdminOrders()
    loadSalesDataForPeriod(timeFilter, selectedDate) // ← AGREGAR ESTA LÍNEA
  }
}, [isOpen])

  // MODIFICACIÓN: Nueva función handleConfirmReceipt usando confirmOrder de la API
  const handleConfirmReceipt = async (orderId: number) => {
    setIsLoading(true)
    try {
      await confirmOrder(orderId) // ← Usa la nueva función de la API
      setToast({ message: "Comprobante de pago confirmado", type: "success" })
    } catch (error) {
      setToast({ message: "Error al confirmar comprobante", type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAdmin = async () => {
    // Validaciones
    const newErrors = {
      adminName: "",
      adminEmail: "",
      adminPassword: "",
      adminConfirmPassword: "",
    }

    let isValid = true

    if (!newAdmin.nombre.trim()) {
      newErrors.adminName = "El nombre es requerido"
      isValid = false
    }

    if (!newAdmin.email.trim()) {
      newErrors.adminEmail = "El email es requerido"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(newAdmin.email)) {
      newErrors.adminEmail = "El email no es válido"
      isValid = false
    } else if (!newAdmin.email.endsWith("@srrobot.com")) {
      newErrors.adminEmail = "El email debe ser corporativo @srrobot.com"
      isValid = false
    }

    if (!newAdmin.password) {
      newErrors.adminPassword = "La contraseña es requerida"
      isValid = false
    } else if (newAdmin.password.length < 6) {
      newErrors.adminPassword = "La contraseña debe tener al menos 6 caracteres"
      isValid = false
    }

    if (!newAdmin.confirmPassword) {
      newErrors.adminConfirmPassword = "Confirma la contraseña"
      isValid = false
    } else if (newAdmin.password !== newAdmin.confirmPassword) {
      newErrors.adminConfirmPassword = "Las contraseñas no coinciden"
      isValid = false
    }

    setErrors((prev) => ({ ...prev, ...newErrors }))

    if (!isValid) return

    setIsLoading(true)
    try {
      const token = getToken()

      // CORRECCIÓN: Usar los nombres de campo que espera el backend
      const adminData = {
        nombreCompleto: newAdmin.nombre, // Cambiado de 'nombre' a 'nombreCompleto'
        correo: newAdmin.email, // Cambiado de 'email' a 'correo'
        contrasena: newAdmin.password, // Cambiado de 'password' a 'contrasena'
      }

      await adminService.crearAdmin(token, adminData)

      await loadAdmins()
      setShowCreateAdminModal(false)
      setNewAdmin({
        nombre: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
      setShowPassword(false)
      setShowConfirmPassword(false)
      setToast({ message: "Administrador creado con éxito", type: "success" })
    } catch (error: any) {
      console.error("Error creating admin:", error)
      setToast({ message: error.message || "Error al crear administrador", type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para editar administrador
  const handleEditAdmin = (admin: any) => {
    setEditAdmin(admin)
    setEditAdminData({
      nombreCompleto: admin.nombreCompleto || admin.nombre || "",
      correo: admin.correo || admin.email || "",
      contrasena: "",
    })
    setShowEditAdminModal(true)
  }

  // Función para guardar edición de administrador
  const handleSaveEditAdmin = async () => {
    if (!editAdminData.nombreCompleto.trim()) {
      setToast({ message: "El nombre es requerido", type: "error" })
      return
    }

    if (!editAdminData.correo.trim() || !editAdminData.correo.endsWith("@srrobot.com")) {
      setToast({ message: "El email debe ser corporativo @srrobot.com", type: "error" })
      return
    }

    setIsLoading(true)
    try {
      const token = getToken()
      const adminData: any = {
        nombreCompleto: editAdminData.nombreCompleto,
        correo: editAdminData.correo,
      }

      // Solo incluir contraseña si se proporcionó una nueva
      if (editAdminData.contrasena) {
        if (editAdminData.contrasena.length < 6) {
          setToast({ message: "La contraseña debe tener al menos 6 caracteres", type: "error" })
          setIsLoading(false)
          return
        }
        adminData.contrasena = editAdminData.contrasena
      }

      await adminService.actualizarAdmin(token, editAdmin.id_usuario || editAdmin.id, adminData)

      await loadAdmins()
      setShowEditAdminModal(false)
      setEditAdmin(null)
      setEditAdminData({ nombreCompleto: "", correo: "", contrasena: "" })
      setShowEditPassword(false)
      setToast({ message: "Administrador actualizado con éxito", type: "success" })
    } catch (error: any) {
      console.error("Error updating admin:", error)
      setToast({ message: error.message || "Error al actualizar administrador", type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para eliminar administrador
  const handleDeleteAdmin = async (admin: any) => {
    if (
      !window.confirm(`¿Estás seguro de que deseas eliminar al administrador ${admin.nombreCompleto || admin.nombre}?`)
    ) {
      return
    }

    setIsLoading(true)
    try {
      const token = getToken()
      await adminService.eliminarAdmin(token, admin.id_usuario || admin.id)

      await loadAdmins()
      setToast({ message: "Administrador eliminado con éxito", type: "success" })
    } catch (error: any) {
      console.error("Error deleting admin:", error)
      setToast({ message: error.message || "Error al eliminar administrador", type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategory.nombre.trim()) {
      setErrors((prev) => ({ ...prev, categoryName: "El nombre de la categoría es requerido" }))
      return
    }

    setIsLoading(true)
    try {
      const token = getToken()
      await categoriaService.crearCategoria(token, {
        nombre: newCategory.nombre,
        descripcion: newCategory.descripcion,
      })

      await loadCategories()
      setShowCategoryModal(false)
      setNewCategory({ nombre: "", descripcion: "" })
      setErrors((prev) => ({ ...prev, categoryName: "" }))
      setToast({ message: "Categoría creada con éxito", type: "success" })
    } catch (error: any) {
      console.error("Error creating category:", error)
      setToast({ message: error.message || "Error al crear categoría", type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCategory = async () => {
    if (!editCategory || !editCategory.nombre.trim()) {
      setErrors((prev) => ({ ...prev, categoryName: "El nombre de la categoría es requerido" }))
      return
    }

    setIsLoading(true)
    try {
      const token = getToken()
      await categoriaService.actualizarCategoria(token, editCategory.id_categoria, {
        nombre: editCategory.nombre,
        descripcion: editCategory.descripcion,
      })

      await loadCategories()
      setShowEditCategoryModal(false)
      setEditCategory(null)
      setToast({ message: "Categoría actualizada con éxito", type: "success" })
    } catch (error: any) {
      console.error("Error updating category:", error)
      setToast({ message: error.message || "Error al actualizar categoría", type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      return
    }

    setIsLoading(true)
    try {
      const token = getToken()
      await categoriaService.eliminarCategoria(token, categoryId)
      await loadCategories()
      setToast({ message: "Categoría eliminada con éxito", type: "success" })
    } catch (error: any) {
      console.error("Error deleting category:", error)
      setToast({ message: error.message || "Error al eliminar categoría", type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (storeError) {
      setToast({ message: storeError, type: "error" })
      setTimeout(() => {
        setToast(null)
        clearError()
      }, 5000)
    }
  }, [storeError, clearError])

  // Calcular estadísticas REALES basadas en datos de la API
  const calculateRealStats = () => {
    // Pagos exitosos (solo estos cuentan como ingresos reales)
    const pagosExitosos = pagos.filter((pago) => pago.status === "succeeded")
    const ingresosReales = pagosExitosos.reduce((sum, pago) => sum + pago.monto, 0)

    // Productos en stock
    const productosEnStock = products.filter((p) => p.inStock).length

    return {
      activeCustomers: estadisticasReales.totalClientes || 1, // Mínimo 1 (el admin)
      activeProducts: productosEnStock,
      totalOrders: orders.length,
      totalRevenue: ingresosReales, // SOLO pagos exitosos
      monthlySales: estadisticasReales.ventasMensuales,
      categoryDistribution: estadisticasReales.distribucionCategorias || calculateCategoryDistribution(products),
    }
  }

  const calculateCategoryDistribution = (products: Product[]): Record<string, number> => {
    const distribution: Record<string, number> = {}
    products.forEach((product) => {
      distribution[product.category] = (distribution[product.category] || 0) + 1
    })
    return distribution
  }

  const stats = useMemo(() => calculateRealStats(), [products, orders, pagos, estadisticasReales])

  const recentActivities = useMemo(() => {
    const activities: Activity[] = []

    // Actividades de pedidos reales
    orders.slice(0, 3).forEach((order) => {
      activities.push({
        id: `order-${order.id}`,
        type: "order",
        description: `Nuevo pedido #${order.id} de ${order.customer.name} por S/${order.total.toFixed(2)}`,
        timestamp: order.date,
      })
    })

    // Actividades de pagos exitosos
    pagos
      .filter((pago) => pago.status === "succeeded")
      .slice(0, 2)
      .forEach((pago) => {
        activities.push({
          id: `payment-${pago.id_pago}`,
          type: "payment_confirmed",
          description: `Pago confirmado #${pago.id_pago} por S/${pago.monto.toFixed(2)}`,
          timestamp: pago.createdAt,
        })
      })

    // Actividades de productos agregados recientemente
    products
      .sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime())
      .slice(0, 2)
      .forEach((product) => {
        activities.push({
          id: `product-${product.id}`,
          type: "product_added",
          description: `Producto "${product.name}" agregado al inventario`,
          timestamp: product.createdAt || new Date().toISOString(),
        })
      })

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5)
  }, [orders, products, pagos])

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
    .filter((order) => {
      const customerName = order.customer?.name?.toLowerCase?.() ?? ""
      const orderIdStr = order.id?.toString?.() ?? ""
      const searchLower = orderSearchTerm.toLowerCase()

      const matchesCustomer = customerName.includes(searchLower)
      const matchesId = orderIdStr.includes(searchLower)
      const matchesProduct =
        order.items?.some((item) => item.product?.name?.toLowerCase?.()?.includes(searchLower) ?? false) ?? false

      return matchesCustomer || matchesId || matchesProduct
    })
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
      categoryName: "",
      adminName: "",
      adminEmail: "",
      adminPassword: "",
      adminConfirmPassword: "",
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
    if (
      !newProduct.price ||
      isNaN(Number(newProduct.price)) ||
      Number(newProduct.price) <= 0 ||
      Number(newProduct.price) > 10000000
    ) {
      newErrors.price = "El precio debe ser un número entero entre 1 y 10,000,000"
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
    setImagePreview("")
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
    setImagePreview(product.image)
    setShowEditModal(true)
  }

  const handleDeleteProduct = async (productId: string | number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      setIsLoading(true)
      try {
        const token = getToken()
        const idNum = typeof productId === "string" ? Number.parseInt(productId) : productId
        await productoService.eliminarProducto(token, idNum)
        await loadProducts()
        setToast({ message: "Producto eliminado con éxito", type: "success" })
      } catch (error: any) {
        console.error("Error deleting product:", error)
        setToast({ message: error.message || "Error al eliminar el producto", type: "error" })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSaveNewProduct = async () => {
    if (!validateForm()) return

    setIsLoading(true)

    const discount = newProduct.discount ? Number(newProduct.discount) : undefined
    const price = Math.round(Number(newProduct.price))
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
      const token = getToken()
      await productoService.crearProducto(token, productData)

      await loadProducts()
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
      setImagePreview("")
      setErrors({
        name: "",
        category: "",
        price: "",
        discount: "",
        image: "",
        description: "",
        characteristics: "",
        productCode: "",
        categoryName: "",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
        adminConfirmPassword: "",
      })
      setToast({ message: "Producto creado con éxito", type: "success" })
    } catch (error: any) {
      console.error("Error en handleSaveNewProduct:", error)
      setToast({ message: error.message || "Error al crear el producto", type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveEditProduct = async () => {
    if (!validateForm() || !editProduct) return

    setIsLoading(true)

    const discount = newProduct.discount ? Number(newProduct.discount) : undefined
    const price = Math.round(Number(newProduct.price))
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
      const token = getToken()
      const idNum = typeof editProduct.id === "string" ? Number.parseInt(editProduct.id) : editProduct.id
      await productoService.actualizarProducto(token, idNum, productData)

      await loadProducts()
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
      setImagePreview("")
      setErrors({
        name: "",
        category: "",
        price: "",
        discount: "",
        image: "",
        description: "",
        characteristics: "",
        productCode: "",
        categoryName: "",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
        adminConfirmPassword: "",
      })
      setToast({ message: "Producto actualizado con éxito", type: "success" })
    } catch (error: any) {
      console.error("Error en handleSaveEditProduct:", error)
      setToast({ message: error.message || "Error al actualizar el producto", type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefreshProducts = async () => {
    setRefreshing(true)
    await loadProducts()
    setRefreshing(false)
    setToast({ message: "Productos actualizados", type: "success" })
    setTimeout(() => setToast(null), 2000)
  }

  const handleViewReceipt = (receiptUrl?: string) => {
    if (receiptUrl) {
      window.open(receiptUrl, "_blank")
    } else {
      setToast({ message: "No hay comprobante disponible", type: "error" })
    }
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
        return (
          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-600 rounded-full">Categoría</span>
        )
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">Actividad</span>
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewProduct({ ...newProduct, image: value })
    setImagePreview(value)
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
              onClick={async () => {
                setRefreshing(true)
                await Promise.all([
                  loadProducts(),
                  loadCategories(),
                  loadPagos(),
                  loadEstadisticasReales(),
                  loadAdmins(),
                  loadAdminOrders(), // ← Agregar loadAdminOrders aquí también
                ])
                setRefreshing(false)
                setToast({ message: "Datos actualizados", type: "success" })
              }}
              disabled={refreshing || isLoading}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white disabled:opacity-50"
              aria-label="Actualizar datos"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
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
                { id: "payments", label: "Pagos", icon: CreditCard },
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
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-gray-900">Dashboard Resumen General</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {isLoading && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Cargando datos...</span>
                      </div>
                    )}
                  </div>
                </div>

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
                    <p className="text-sm text-gray-500 mt-1">
                      {pagos.filter((p) => p.status === "succeeded").length} pagos exitosos
                    </p>
                  </div>
                </div>

                {/* === NUEVA SECCIÓN: CONTROLES DE FILTRO DE TIEMPO === */}
<div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigatePeriod(-1)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        ←
      </button>
      
      <h2 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
        {getPeriodLabel()}
      </h2>
      
      <button
        onClick={() => navigatePeriod(1)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        →
      </button>
    </div>

    <div className="flex gap-2 flex-wrap">
      {['day', 'week', 'month', 'year'].map((filter) => (
        <button
          key={filter}
          onClick={() => handleTimeFilterChange(filter)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timeFilter === filter
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {filter === 'day' && 'Día'}
          {filter === 'week' && 'Semana'}
          {filter === 'month' && 'Mes'}
          {filter === 'year' && 'Año'}
        </button>
      ))}
    </div>
  </div>
</div>

{/* === NUEVA SECCIÓN: GRÁFICOS CON FILTROS DE TIEMPO === */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-[450px]">
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Ventas en Tiempo Real</h3>
        <p className="text-sm text-gray-500 font-medium">
          {timeFilter === 'day' && 'Ventas por hora (S/)'}
          {timeFilter === 'week' && 'Ventas por día (S/)'}
          {timeFilter === 'month' && 'Ventas por semana (S/)'}
          {timeFilter === 'year' && 'Ventas mensuales (S/)'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-500">En vivo</span>
      </div>
    </div>
    <div className="h-72">
      <Line
        data={{
          labels: getChartLabels(),
          datasets: [
            {
              label: "Ventas (S/)",
              data: salesData.length > 0 ? salesData : stats.monthlySales,
              fill: true,
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              borderColor: "rgb(239, 68, 68)",
              tension: 0.4,
              borderWidth: 3,
              pointBackgroundColor: "rgb(239, 68, 68)",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              pointRadius: 4,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleFont: { size: 12 },
              bodyFont: { size: 12 },
              padding: 10,
            }
          },
          scales: {
            x: {
              ticks: { font: { size: 11 }, color: "#1f2937" },
              grid: { display: false },
            },
            y: {
              ticks: { font: { size: 11 }, color: "#1f2937" },
              grid: { color: "#e5e7eb" },
              beginAtZero: true,
            },
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          },
        }}
      />
    </div>
    <div className="mt-4 grid grid-cols-2 gap-4 text-center">
      <div className="bg-red-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600">Ventas del período</p>
        <p className="text-lg font-bold text-red-600">S/{realTimeStats.totalSales.toFixed(2)}</p>
      </div>
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600">Pedidos del período</p>
        <p className="text-lg font-bold text-blue-600">{realTimeStats.totalOrders}</p>
      </div>
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
                "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#a855f7",
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
                "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#a855f7",
              ][index % 10],
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
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900">Gestión de Productos</h3>
                  <div className="flex items-center gap-2">
                    {isLoading && (
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
                      disabled={isLoading}
                      className={`px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
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

                  {isLoading && products.length === 0 ? (
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
                            <tr
                              key={product.id}
                              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                              <td className="p-4">
                                <img
                                  src={product.image || "/placeholder.svg"}
                                  alt={product.name}
                                  className="w-16 h-16 object-cover rounded"
                                  loading="lazy"
                                />
                              </td>
                              <td className="p-4 text-gray-900 font-medium">{product.id_producto || product.id}</td>
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
                                      isLoading ? "opacity-50 cursor-not-allowed" : ""
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
                      <div
                        key={category.id_categoria}
                        className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <Tag className="w-6 h-6 text-red-600" />
                          <h4 className="text-lg font-semibold text-gray-900">{category.nombre}</h4>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{category.descripcion || "Sin descripción"}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">ID: {category.id_categoria}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditCategory(category)
                                setShowEditCategoryModal(true)
                              }}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id_categoria)}
                              disabled={isLoading}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {categories.length === 0 && (
                    <div className="text-center py-12">
                      <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No hay categorías registradas</p>
                      <p className="text-gray-400 text-sm mt-2">
                        Crea tu primera categoría para organizar tus productos
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h3>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div className="relative w-full sm:w-1/3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Buscar pedidos por cliente o ID..."
                        value={orderSearchTerm}
                        onChange={(e) => setOrderSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
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
                        <option value="Comprobante Recibido">Comprobante Recibido</option>
                        <option value="Falta Comprobante">Falta Comprobante</option>
                      </select>
                    </div>
                  </div>

                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No hay pedidos registrados</p>
                      <p className="text-gray-400 text-sm mt-2">
                        Los pedidos aparecerán aquí cuando los clientes realicen compras
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-gray-900 border-b border-gray-200">
                            <th className="p-4 font-semibold">ID</th>
                            <th className="p-4 font-semibold">Cliente</th>
                            <th className="p-4 font-semibold">Fecha</th>
                            <th className="p-4 font-semibold">Total</th>
                            <th className="p-4 font-semibold">Estado</th>
                            <th className="p-4 font-semibold">Comprobante</th>
                            <th className="p-4 font-semibold">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((order) => (
                            <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                              <td className="p-4 text-gray-900 font-medium">#{order.id}</td>
                              <td className="p-4 text-gray-900">
                                <div>
                                  <p className="font-medium">{order.customer.name}</p>
                                  <p className="text-sm text-gray-500">{order.customer.email}</p>
                                </div>
                              </td>
                              <td className="p-4 text-gray-900">{order.date}</td>
                              <td className="p-4 text-gray-900 font-medium">S/{order.total.toFixed(2)}</td>
                              <td className="p-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    order.status === "delivered"
                                      ? "bg-green-100 text-green-800"
                                      : order.status === "shipped"
                                        ? "bg-blue-100 text-blue-800"
                                        : order.status === "confirmed"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {order.status === "pending" && "Pendiente"}
                                  {order.status === "confirmed" && "Confirmado"}
                                  {order.status === "shipped" && "Enviado"}
                                  {order.status === "delivered" && "Entregado"}
                                </span>
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    order.hasReceipt ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {order.hasReceipt ? "Recibido" : "Pendiente"}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setShowOrderDetails(order)}
                                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1"
                                  >
                                    <Eye className="w-4 h-4" />
                                    Ver
                                  </button>
                                  {order.receiptUrl && (
                                    <button
                                      onClick={() => handleViewReceipt(order.receiptUrl)}
                                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1"
                                    >
                                      <FileText className="w-4 h-4" />
                                      Comprobante
                                    </button>
                                  )}
                                  {!order.hasReceipt && (
                                    <button
                                      onClick={() => handleConfirmReceipt(order.id)}
                                      disabled={isLoading}
                                      className={`px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium flex items-center gap-1 ${
                                        isLoading ? "opacity-50 cursor-not-allowed" : ""
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

            {activeTab === "payments" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900">Gestión de Pagos</h3>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Pagos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="text-green-800 font-semibold">Exitosos</p>
                        <p className="text-2xl font-bold text-green-600">
                          {pagos.filter((p) => p.status === "succeeded").length}
                        </p>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <p className="text-yellow-800 font-semibold">Pendientes</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {pagos.filter((p) => p.status === "pending").length}
                        </p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <p className="text-red-800 font-semibold">Fallidos</p>
                        <p className="text-2xl font-bold text-red-600">
                          {pagos.filter((p) => p.status === "failed").length}
                        </p>
                      </div>
                    </div>
                  </div>

                  {pagos.length === 0 ? (
                    <div className="text-center py-12">
                      <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No hay pagos registrados</p>
                      <p className="text-gray-400 text-sm mt-2">
                        Los pagos aparecerán aquí cuando los clientes realicen transacciones
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-gray-900 border-b border-gray-200">
                            <th className="p-4 font-semibold">ID Pago</th>
                            <th className="p-4 font-semibold">Monto</th>
                            <th className="p-4 font-semibold">Estado</th>
                            <th className="p-4 font-semibold">Fecha</th>
                            <th className="p-4 font-semibold"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagos.map((pago) => (
                            <tr
                              key={pago.id_pago}
                              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                              <td className="p-4 text-gray-900 font-medium">#{pago.id_pago}</td>
                              <td className="p-4 text-gray-900 font-medium">S/{pago.monto.toFixed(2)}</td>
                              <td className="p-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    pago.status === "succeeded"
                                      ? "bg-green-100 text-green-800"
                                      : pago.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {pago.status === "succeeded" && "Exitoso"}
                                  {pago.status === "pending" && "Pendiente"}
                                  {pago.status === "failed" && "Fallido"}
                                </span>
                              </td>
                              <td className="p-4 text-gray-900">
                                {new Date(pago.createdAt).toLocaleDateString("es-PE")}
                              </td>
                              <td className="p-4 text-gray-900 text-sm font-mono">{pago.stripePaymentId}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900">Gestión de Administradores</h3>
                  <button
                    onClick={() => setShowCreateAdminModal(true)}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    Crear Administrador
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  {admins.length === 0 ? (
                    <div className="text-center py-12">
                      <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No hay administradores registrados</p>
                      <p className="text-gray-400 text-sm mt-2">
                        Crea el primer administrador para gestionar el sistema
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-gray-900 border-b border-gray-200">
                            <th className="p-4 font-semibold">ID Usuario</th>
                            <th className="p-4 font-semibold">Nombre</th>
                            <th className="p-4 font-semibold">Email</th>
                            <th className="p-4 font-semibold">Rol</th>
                            <th className="p-4 font-semibold">Fecha de Creación</th>
                            <th className="p-4 font-semibold">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {admins.map((admin, index) => (
                            <tr
                              key={admin._id || admin.id || `admin-${index}`}
                              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                              <td className="p-4 text-gray-900 font-medium">
                                #{admin.id_usuario || admin.id || "N/A"}
                              </td>
                              <td className="p-4 text-gray-900">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <Users className="w-5 h-5 text-red-600" />
                                  </div>
                                  <span>{admin.nombreCompleto || admin.nombre || "Sin nombre"}</span>
                                </div>
                              </td>
                              <td className="p-4 text-gray-900">{admin.correo || admin.email || "Sin email"}</td>
                              <td className="p-4">
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                  {admin.rol || admin.role || "admin"}
                                </span>
                              </td>
                              <td className="p-4 text-gray-900">
                                {admin.fecha
                                  ? new Date(admin.fecha).toLocaleDateString("es-PE")
                                  : admin.createdAt
                                    ? new Date(admin.createdAt).toLocaleDateString("es-PE")
                                    : "Fecha no disponible"}
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditAdmin(admin)}
                                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAdmin(admin)}
                                    disabled={isLoading}
                                    className={`px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center gap-1 ${
                                      isLoading ? "opacity-50 cursor-not-allowed" : ""
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

            {/* Modal para crear administrador */}
            {showCreateAdminModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Crear Nuevo Administrador</h3>
                    <button
                      onClick={() => {
                        setShowCreateAdminModal(false)
                        setShowPassword(false)
                        setShowConfirmPassword(false)
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                      <input
                        type="text"
                        value={newAdmin.nombre}
                        onChange={(e) => setNewAdmin({ ...newAdmin, nombre: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                        placeholder="Ej: Juan Pérez"
                      />
                      {errors.adminName && <p className="text-red-600 text-sm mt-1">{errors.adminName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                        placeholder="ejemplo@srrobot.com"
                      />
                      {errors.adminEmail && <p className="text-red-600 text-sm mt-1">{errors.adminEmail}</p>}
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newAdmin.password}
                          onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                          placeholder="Mínimo 6 caracteres"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.adminPassword && <p className="text-red-600 text-sm mt-1">{errors.adminPassword}</p>}
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={newAdmin.confirmPassword}
                          onChange={(e) => setNewAdmin({ ...newAdmin, confirmPassword: e.target.value })}
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                          placeholder="Repite la contraseña"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.adminConfirmPassword && (
                        <p className="text-red-600 text-sm mt-1">{errors.adminConfirmPassword}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowCreateAdminModal(false)
                        setShowPassword(false)
                        setShowConfirmPassword(false)
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreateAdmin}
                      disabled={isLoading}
                      className={`px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isLoading ? "Creando..." : "Crear Administrador"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal para editar administrador */}
            {showEditAdminModal && editAdmin && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Editar Administrador</h3>
                    <button
                      onClick={() => {
                        setShowEditAdminModal(false)
                        setShowEditPassword(false)
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                      <input
                        type="text"
                        value={editAdminData.nombreCompleto}
                        onChange={(e) => setEditAdminData({ ...editAdminData, nombreCompleto: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                        placeholder="Ej: Juan Pérez"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={editAdminData.correo}
                        onChange={(e) => setEditAdminData({ ...editAdminData, correo: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                        placeholder="ejemplo@srrobot.com"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nueva Contraseña (opcional)
                      </label>
                      <div className="relative">
                        <input
                          type={showEditPassword ? "text" : "password"}
                          value={editAdminData.contrasena}
                          onChange={(e) => setEditAdminData({ ...editAdminData, contrasena: e.target.value })}
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                          placeholder="Dejar vacío para mantener la actual"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEditPassword(!showEditPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showEditPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Solo completa este campo si deseas cambiar la contraseña
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowEditAdminModal(false)
                        setShowEditPassword(false)
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveEditAdmin}
                      disabled={isLoading}
                      className={`px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isLoading ? "Actualizando..." : "Actualizar Administrador"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal para editar categoría */}
            {showEditCategoryModal && editCategory && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Editar Categoría</h3>
                    <button
                      onClick={() => setShowEditCategoryModal(false)}
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
                        value={editCategory.nombre}
                        onChange={(e) => setEditCategory({ ...editCategory, nombre: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                      <textarea
                        value={editCategory.descripcion}
                        onChange={(e) => setEditCategory({ ...editCategory, descripcion: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowEditCategoryModal(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleEditCategory}
                      disabled={isLoading}
                      className={`px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isLoading ? "Actualizando..." : "Actualizar Categoría"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal para agregar producto */}
            {showAddModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Agregar Nuevo Producto</h3>
                    <button
                      onClick={() => {
                        setShowAddModal(false)
                        setImagePreview("")
                      }}
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
                        <option value="">Seleccionar categoría</option>
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
                          step="1"
                          min="1"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                          placeholder="500000"
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
                      <div className="flex items-center gap-2 mb-2">
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Ingresa la URL de la imagen</span>
                      </div>
                      <input
                        type="url"
                        value={newProduct.image}
                        onChange={handleImageChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                      {errors.image && <p className="text-red-600 text-sm mt-1">{errors.image}</p>}

                      {imagePreview && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
                          <div className="relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                            <img
                              src={imagePreview || "/placeholder.svg"}
                              alt="Vista previa"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg"
                              }}
                            />
                          </div>
                        </div>
                      )}
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
                      onClick={() => {
                        setShowAddModal(false)
                        setImagePreview("")
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveNewProduct}
                      disabled={isLoading}
                      className={`px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isLoading ? "Creando..." : "Crear Producto"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal para editar producto */}
            {showEditModal && editProduct && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Editar Producto</h3>
                    <button
                      onClick={() => {
                        setShowEditModal(false)
                        setImagePreview("")
                      }}
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
                        <option value="">Seleccionar categoría</option>
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
                          step="1"
                          min="1"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                          placeholder="500000"
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
                      <div className="flex items-center gap-2 mb-2">
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Ingresa la URL de la imagen</span>
                      </div>
                      <input
                        type="url"
                        value={newProduct.image}
                        onChange={handleImageChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                      />
                      {errors.image && <p className="text-red-600 text-sm mt-1">{errors.image}</p>}

                      {imagePreview && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
                          <div className="relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                            <img
                              src={imagePreview || "/placeholder.svg"}
                              alt="Vista previa"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg"
                              }}
                            />
                          </div>
                        </div>
                      )}
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
                      onClick={() => {
                        setShowEditModal(false)
                        setImagePreview("")
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveEditProduct}
                      disabled={isLoading}
                      className={`px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isLoading ? "Actualizando..." : "Actualizar Producto"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal para crear categoría */}
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
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isLoading ? "Creando..." : "Crear Categoría"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal para ver detalles de orden */}
            {showOrderDetails && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Detalles del Pedido #{showOrderDetails.id}</h3>
                    <button
                      onClick={() => setShowOrderDetails(null)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Nombre</p>
                          <p className="font-medium">{showOrderDetails.customer.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{showOrderDetails.customer.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Teléfono</p>
                          <p className="font-medium">{showOrderDetails.customer.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">DNI</p>
                          <p className="font-medium">{showOrderDetails.customer.dni}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">Dirección</p>
                        <p className="font-medium">{showOrderDetails.customer.address}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Productos</h4>
                      <div className="space-y-3">
                        {showOrderDetails.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <img
                              src={item.product.image || "/placeholder.svg"}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                            </div>
                            <p className="font-medium">S/{item.product.price * item.quantity}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {showOrderDetails.receiptUrl && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Comprobante de Pago</h4>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-gray-700">Comprobante adjunto:</p>
                            <button
                              onClick={() => handleViewReceipt(showOrderDetails.receiptUrl)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                            >
                              Ver Comprobante
                            </button>
                          </div>
                          <div className="text-center py-4 border border-gray-300 rounded bg-white">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Comprobante de pago disponible</p>
                            <p className="text-xs text-gray-500 mt-1">Haz clic en "Ver Comprobante" para abrir</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-2xl font-bold text-red-600">S/{showOrderDetails.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowOrderDetails(null)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cerrar
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