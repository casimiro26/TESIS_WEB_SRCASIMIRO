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
    return data
      .filter((p: any) => p.nombre !== "Producto No Deseado") // Ejemplo: remueve específico por nombre
      .map((p: any) => ({
        id: p.id_producto.toString(),
        name: p.nombre,
        category: p.categoria,
        price: p.price,
        originalPrice: p.originalPrice,
        image: p.image,
        description: p.description,
        rating: p.rating || 4.5,
        reviews: p.reviews || 0,
        inStock: p.inStock !== false,
        featured: p.featured || false,
        discount: p.discount || 0,
      }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return []; // Vacío en lugar de fallback estático para forzar DB; o usa products si quieres
  }
};

export const fetchCategories = async (token?: string): Promise<string[]> => {
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
    return data.categorias.map((c: any) => c.nombre);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return []; // Vacío para forzar DB; o usa categories si quieres fallback
  }
};

// Removí exports estáticos para evitar confusión; usa solo fetch para DB real
// Si necesitas estáticos temporal, agrégalos de nuevo, pero ahora prioriza DB