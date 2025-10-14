import { Product } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Impresora Multifuncional HP LaserJet Pro',
    category: 'Impresoras',
    price: 299.99,
    originalPrice: 349.99,
    image: 'https://images.pexels.com/photos/4792728/pexels-photo-4792728.jpeg?auto=compress&cs=tinysrgb&w=500',
    description: 'Impresora láser multifuncional con WiFi, perfecta para oficina',
    rating: 4.5,
    reviews: 128,
    inStock: true,
    featured: true,
    discount: 14
  },
  {
    id: '2',
    name: 'Cable USB-C a Lightning 2m',
    category: 'Cables',
    price: 24.99,
    image: 'https://images.pexels.com/photos/163112/ethernet-cable-computer-network-163112.jpeg?auto=compress&cs=tinysrgb&w=500',
    description: 'Cable de carga rápida y sincronización de datos de alta calidad',
    rating: 4.8,
    reviews: 245,
    inStock: true,
    featured: false
  },
  {
    id: '3',
    name: 'Monitor Gaming ASUS ROG 27" 144Hz',
    category: 'Gaming',
    price: 449.99,
    originalPrice: 529.99,
    image: 'https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg?auto=compress&cs=tinysrgb&w=500',
    description: 'Monitor curvo para gaming con tecnología G-SYNC',
    rating: 4.9,
    reviews: 89,
    inStock: true,
    featured: true,
    discount: 15
  },
  {
    id: '4',
    name: 'Laptop Dell XPS 13 Intel i7',
    category: 'Laptops',
    price: 1299.99,
    originalPrice: 1499.99,
    image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=500',
    description: 'Laptop ultrabook con pantalla InfinityEdge y procesador i7',
    rating: 4.7,
    reviews: 156,
    inStock: true,
    featured: true,
    discount: 13
  },
  {
    id: '5',
    name: 'Mouse Gaming Logitech G502 HERO',
    category: 'Mouse',
    price: 79.99,
    image: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=500',
    description: 'Mouse gaming con sensor HERO 25K y 11 botones programables',
    rating: 4.6,
    reviews: 312,
    inStock: true,
    featured: false
  },
  {
    id: '6',
    name: 'Teclado Mecánico Corsair K95 RGB',
    category: 'Teclados',
    price: 199.99,
    originalPrice: 229.99,
    image: 'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=500',
    description: 'Teclado mecánico gaming con switches Cherry MX e iluminación RGB',
    rating: 4.8,
    reviews: 198,
    inStock: true,
    featured: true,
    discount: 13
  },
  {
    id: '7',
    name: 'Tarjeta Gráfica RTX 4070 Super',
    category: 'Componentes',
    price: 699.99,
    originalPrice: 799.99,
    image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=500',
    description: 'GPU de alta gama para gaming y creación de contenido en 4K',
    rating: 4.9,
    reviews: 67,
    inStock: true,
    featured: true,
    discount: 13
  },
  {
    id: '8',
    name: 'Cámara de Seguridad WiFi 4K',
    category: 'Cámaras de Seguridad',
    price: 159.99,
    image: 'https://images.pexels.com/photos/430208/pexels-photo-430208.jpeg?auto=compress&cs=tinysrgb&w=500',
    description: 'Cámara IP inteligente con visión nocturna y detección de movimiento',
    rating: 4.4,
    reviews: 89,
    inStock: true,
    featured: false
  }
];

export const categories = [
  'Impresoras', 'Cables', 'Pantallas', 'Gaming', 
  'Monitores', 'Laptops', 'Cargadores', 'Mouse', 
  'Teclados', 'Partes de pc', 'Cámaras de Seguridad'
];