"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ProductCard } from "./ProductCard"
import type { Product } from "../types"

interface ProductsCarouselProps {
  products: Product[]
  onViewDetails: (product: Product) => void
  title?: string
  subtitle?: string
}

export const ProductsCarousel: React.FC<ProductsCarouselProps> = ({
  products,
  onViewDetails,
  title = "Productos Destacados",
  subtitle = "Los mejores productos seleccionados para ti",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)

  const getItemsPerView = () => {
    if (typeof window === "undefined") return 6
    if (window.innerWidth < 640) return 1
    if (window.innerWidth < 768) return 2
    if (window.innerWidth < 1024) return 3
    if (window.innerWidth < 1280) return 4
    if (window.innerWidth < 1536) return 5
    return 6
  }

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView())

  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView())
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const maxIndex = Math.max(0, products.length - itemsPerView)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, maxIndex])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  if (products.length === 0) return null

  return (
    <div className="relative">
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
          {title}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="relative group/carousel">
        {currentIndex > 0 && (
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-white dark:bg-gray-800 hover:bg-red-600 dark:hover:bg-red-600 text-gray-900 dark:text-white hover:text-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hover:scale-110"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {currentIndex < maxIndex && (
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-white dark:bg-gray-800 hover:bg-red-600 dark:hover:bg-red-600 text-gray-900 dark:text-white hover:text-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hover:scale-110"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        <div className="overflow-hidden" ref={carouselRef}>
          <div
            className="flex transition-transform duration-700 ease-out gap-6"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0"
                style={{ width: `calc(${100 / itemsPerView}% - ${(24 * (itemsPerView - 1)) / itemsPerView}px)` }}
              >
                <ProductCard product={product} onViewDetails={onViewDetails} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-8">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex ? "w-8 h-2 bg-red-600" : "w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-red-400"
            }`}
            aria-label={`Ir a grupo ${index + 1}`}
          />
        ))}
      </div>

      <div className="text-center mt-4">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          {isAutoPlaying ? "⏸ Pausar" : "▶ Reproducir"} auto-play
        </button>
      </div>
    </div>
  )
}
