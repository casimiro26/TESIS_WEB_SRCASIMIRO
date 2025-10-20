import { Product } from '../types';

const API_BASE_URL = "https://api-web-egdy.onrender.com"; // Tu API en Render

// Función async para fetch dinámico de DB (usa token si disponible)
export const fetchProducts = async (token?: string): Promise<Product[]> => {
  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`; // Envía token si logueado
    }

    const response = await fetch(`${API_BASE_URL}/api/productos`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('Acceso denegado a productos; usando fallback');
      }
      throw new Error(`Error fetching products: ${response.statusText}`);
    }

    const data = await response.json();
    // Mapea respuesta de tu API (id_producto -> id, nombre -> name, etc.)
    // Filtra cualquier producto no deseado (ej: si ves uno "no mío", agrega condición aquí)
    return data.productos
      .filter((p: any) => p.nombre !== "Producto No Deseado") // Ejemplo: remueve específico por nombre
      .map((p: any) => ({
        id: p.id_producto.toString(),
        id_producto: p.id_producto,
        name: p.nombre,
        category: p.categoria,
        price: p.price,
        originalPrice: p.originalPrice,
        discount: p.discount || 0,
        image: p.image,
        description: p.description,
        characteristics: p.characteristics || '',
        productCode: p.productCode || '',
        rating: p.rating || 4.5,
        reviews: p.reviews || 0,
        inStock: p.inStock !== false,
        featured: p.featured || false,
        createdAt: p.createdAt,
        creadoPor: p.creadoPor, // Incluye campo de auditoría si existe en tipo Product
      }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return []; // Vacío en lugar de fallback estático para forzar DB; o usa products si quieres
  }
};

export interface Category {
  id_categoria: number;
  nombre: string;
  descripcion: string;
}

export const fetchCategories = async (token?: string): Promise<Category[]> => {
  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/categorias`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('Acceso denegado a categorías; usando fallback');
      }
      throw new Error(`Error fetching categories: ${response.statusText}`);
    }

    const data = await response.json();
    return data.categorias || []; // Retorna array completo de Category objects (id_categoria, nombre, descripcion)
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Fallback a categorías por defecto si falla (como en dashboard)
    return [
      { id_categoria: 1, nombre: "Laptops", descripcion: "Computadoras portátiles" },
      { id_categoria: 2, nombre: "Smartphones", descripcion: "Teléfonos inteligentes" },
      { id_categoria: 3, nombre: "Tablets", descripcion: "Tabletas y iPads" },
      { id_categoria: 4, nombre: "Accesorios", descripcion: "Accesorios tecnológicos" },
    ];
  }
};

// Removí exports estáticos para evitar confusión; usa solo fetch para DB real
// Si necesitas estáticos temporal, agrégalos de nuevo, pero ahora prioriza DB