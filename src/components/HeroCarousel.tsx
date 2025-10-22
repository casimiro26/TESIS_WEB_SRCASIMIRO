"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const heroImages = [
  {
    url: "../assets/images/prod.png",
    title: "Tecnología de Vanguardia",
    description: "Los mejores productos tecnológicos al alcance de tu mano",
  },
  {
    url: "../assets/images/pcxd.png",
    title: "Gaming Premium",
    description: "Equipa tu setup con lo último en gaming",
  },
  {
    url: "../assets/images/impre.png",
    title: "Impresoras",
    description: "Todo lo que necesitas para tu día a día",
  },
  {
    url: "../assets/images/11.png",
    title: "Seguridad Inteligente",
    description: "Protege lo que más importa con tecnología avanzada",
  },
]

export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)
  }

  return (
    <section className="relative bg-gradient-to-br from-red-700 via-red-800 to-black text-white overflow-hidden shadow-xl">
      {/* Patrón de fondo decorativo más sutil */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 relative z-10">
        {/* Título y descripción con animaciones mejoradas */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent tracking-tight whitespace-normal break-words animate-pulse-in">
            Catálogo de Productos
          </h1>
          <p className="text-base md:text-lg text-red-100 mb-4 max-w-2xl mx-auto font-light leading-relaxed animate-slide-in-bottom border border-red-300/30 rounded-lg p-3 shadow-md hover:shadow-xl transition-shadow duration-500">
            Encuentra los mejores accesorios tecnológicos para tus necesidades
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm">
            <span className="bg-white/10 backdrop-blur-lg px-3 py-1.5 rounded-full font-medium shadow-md hover:bg-white/20 transition-all duration-500 hover:scale-110 hover:shadow-xl animate-bounce-in delay-100 border border-red-300/30">
              Envío Express
            </span>
            <span className="bg-white/10 backdrop-blur-lg px-3 py-1.5 rounded-full font-medium shadow-md hover:bg-white/20 transition-all duration-500 hover:scale-110 hover:shadow-xl animate-bounce-in delay-300 border border-red-300/30">
              Compra Segura
            </span>
            <span className="bg-white/10 backdrop-blur-lg px-3 py-1.5 rounded-full font-medium shadow-md hover:bg-white/20 transition-all duration-500 hover:scale-110 hover:shadow-xl animate-bounce-in delay-500 border border-red-300/30">
              Calidad Premium
            </span>
          </div>
        </div>

        {/* Carrusel de imágenes más compacto */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl max-w-4xl mx-auto border border-white/20 bg-gradient-to-br from-red-900/40 to-black/60">
          <div className="relative h-48 md:h-[320px] group">
            {heroImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-800 ease-in-out ${
                  index === currentSlide
                    ? "opacity-100 transform translate-x-0 scale-100"
                    : "opacity-0 transform translate-x-full scale-105"
                } ${index < currentSlide ? "translate-x-[-100%]" : ""}`}
              >
                <img
                  src={image.url || "../assets/images/impre.png"}
                  alt={image.title}
                  className="w-full h-full object-cover brightness-95 transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-4 md:p-6">
                  <h3 className="text-xl md:text-3xl font-bold mb-1 animate-slide-in-left">{image.title}</h3>
                  <p className="text-sm md:text-base text-gray-100 animate-slide-in-right delay-200">{image.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Botones de navegación más pequeños */}
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-lg p-2 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-lg p-2 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Indicadores más pequeños */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-500 shadow-md ${
                  index === currentSlide ? "bg-red-500 w-8 scale-110" : "bg-white/50 w-2 hover:bg-white/80 hover:scale-125"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Estilos CSS en línea para evitar el warning de jsx */}
      <style>{`
        @keyframes pulse-in {
          0% {
            transform: scale(0.95);
            opacity: 0;
            filter: blur(3px);
          }
          50% {
            transform: scale(1.05);
            opacity: 0.7;
            filter: blur(1px);
          }
          100% {
            transform: scale(1);
            opacity: 1;
            filter: blur(0);
          }
        }
        @keyframes slide-in-bottom {
          0% {
            transform: translateY(30px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes bounce-in {
          0% {
            transform: scale(0.3) translateY(20px);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) translateY(-10px);
            opacity: 0.8;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        @keyframes slide-in-left {
          0% { transform: translateX(-30px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-in-right {
          0% { transform: translateX(30px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .animate-pulse-in {
          animation: pulse-in 1.2s ease-out forwards;
        }
        .animate-slide-in-bottom {
          animation: slide-in-bottom 0.8s ease-out forwards;
        }
        .animate-bounce-in {
          animation: bounce-in 0.9s ease-out forwards;
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.7s ease-out forwards;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.7s ease-out forwards;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>
    </section>
  )
}