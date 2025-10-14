export interface Customer {
  name: string
  email: string
  phone: string
  address: string
  dni: string
}

export interface Review {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  date: string
}

export interface Product {
  id: string
  name: string
  category: string
  price: number
  originalPrice?: number
  discount?: number
  image: string
  description: string
  characteristics?: string
  productCode?: string
  rating: number
  reviews: number
  inStock: boolean
  featured: boolean
  reviewsList: Review[]
}

export interface Order {
  id: number
  customer: Customer
  items: Array<{
    product: Product
    quantity: number
  }>
  date: string
  total: number
  hasReceipt: boolean
  receiptUrl?: string
  status: "pending" | "confirmed" | "shipped" | "delivered"
}