// types.ts ACTUALIZADO
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
}