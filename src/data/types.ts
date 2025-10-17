export interface Review {
  user: string;
  comment: string;
  rating: number;
  date: string;
}

export interface Product {
  id: string; // Convertir de id_producto (number) a string
  id_producto?: number; // Para compatibilidad con API
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  description: string;
  characteristics?: string;
  productCode?: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  featured: boolean;
  reviewsList: Review[];
  createdAt?: string; // Para compatibilidad con API
}

export interface ApiProduct {
  id_producto: number;
  categoria: string;
  nombre: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  description: string;
  characteristics?: string;
  productCode?: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  featured: boolean;
  createdAt: string;
  _id?: string; // Para compatibilidad con MongoDB
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  favorites: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (productId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Tipos para Stripe
export interface StripePaymentIntent {
  client_secret: string;
  paymentId: string;
  mensaje: string;
}

export interface PaymentRequest {
  monto: number; // en centavos
}

export interface PaymentConfirmation {
  payment_intent_id: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  rol: string;
  isAdmin: boolean;
}

// Tipos para Usuarios/Clientes según tu API
export interface User {
  id: string;
  name: string;
  email: string;
  rol: string;
  isAdmin: boolean;
}

export interface ApiUser {
  _id?: string;
  id_usuario: number;
  nombreCompleto: string;
  correo: string;
  contrasena?: string;
  fecha?: string;
  rol: string;
}

export interface ApiCliente {
  _id?: string;
  id_usuario: number;
  nombreCompleto: string;
  correo: string;
  contrasena?: string;
  fecha?: string;
  rol: string;
}

// Tipos para Categorías según tu API
export interface Category {
  id: string;
  id_categoria: number;
  nombre: string;
  descripcion: string;
}

export interface ApiCategory {
  _id?: string;
  id_categoria: number;
  nombre: string;
  descripcion: string;
}

// Tipos para Órdenes/Pedidos
export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
  dni: string;
}

export interface Order {
  id: number;
  customer: Customer;
  items: Array<{
    product: Product;
    quantity: number;
  }>;
  date: string;
  total: number;
  hasReceipt: boolean;
  receiptUrl?: string;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  paymentMethod?: "stripe" | "transfer";
  stripePaymentId?: string;
}

// Tipos para Pagos según tu API
export interface Pago {
  id_pago: number;
  userId: string;
  userModel: "Usuario" | "Cliente";
  monto: number;
  stripePaymentId: string;
  status: "pending" | "succeeded" | "failed";
  createdAt: string;
}

export interface ApiPago {
  _id?: string;
  id_pago: number;
  userId: string;
  userModel: "Usuario" | "Cliente";
  monto: number;
  stripePaymentId: string;
  status: "pending" | "succeeded" | "failed";
  createdAt: string;
}

// Tipos para Respuestas de la API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  mensaje?: string;
  error?: string;
}

export interface LoginResponse {
  token: string;
  rol: string;
  mensaje?: string;
}

export interface ProfileResponse {
  perfil: ApiUser | ApiCliente;
}

export interface ProductsResponse {
  productos?: Product[];
  products?: Product[]; // Para compatibilidad
}

export interface CategoriesResponse {
  categorias: Category[];
}

// Tipos para Formularios
export interface LoginFormData {
  correo: string;
  contrasena: string;
}

export interface RegisterFormData {
  nombreCompleto: string;
  correo: string;
  contrasena: string;
}

export interface ProductFormData {
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  description: string;
  characteristics: string;
  productCode: string;
  inStock: boolean;
}

export interface CategoryFormData {
  nombre: string;
  descripcion: string;
}

// Tipos para Checkout
export interface CheckoutFormData {
  fullName: string;
  dni: string;
  email: string;
  phone: string;
  region: string;
  province: string;
  district: string;
  addressDetails: string;
  paymentMethod: string;
}

// Tipos para Filtros y Búsqueda
export interface ProductFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
  featured?: boolean;
  rating?: number;
}

export interface SearchParams {
  query: string;
  filters: ProductFilters;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

// Tipos para Estadísticas
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: Order[];
  topProducts: Product[];
}

// Tipos para Notificaciones
export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Tipos para Configuración
export interface AppSettings {
  theme: "light" | "dark" | "auto";
  language: string;
  currency: string;
  notifications: boolean;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;