"use client"

import type React from "react"
import { useState } from "react"
import { X, ShoppingCart, Upload, CheckCircle, AlertCircle } from "lucide-react"
import { useCart } from "../context/CartContext"
import { useStore } from "../context/StoreContext"

interface CheckoutProps {
  isOpen: boolean
  onClose: () => void
}

export const Checkout: React.FC<CheckoutProps> = ({ isOpen, onClose }) => {
  const { items, getTotalPrice, clearCart } = useCart()
  const { addOrder } = useStore()

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    dni: "",
    email: "",
    phone: "",
    address: "",
  })

  const [receipt, setReceipt] = useState<File | null>(null)
  const [errors, setErrors] = useState({
    name: "",
    dni: "",
    email: "",
    phone: "",
    address: "",
    receipt: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors = {
      name: "",
      dni: "",
      email: "",
      phone: "",
      address: "",
      receipt: "",
    }
    let isValid = true

    if (!customerInfo.name.trim()) {
      newErrors.name = "El nombre es requerido"
      isValid = false
    }

    if (!customerInfo.dni.trim()) {
      newErrors.dni = "El DNI es requerido"
      isValid = false
    } else if (!/^\d{8}$/.test(customerInfo.dni)) {
      newErrors.dni = "El DNI debe tener 8 dígitos"
      isValid = false
    }

    if (!customerInfo.email.trim()) {
      newErrors.email = "El email es requerido"
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      newErrors.email = "Email inválido"
      isValid = false
    }

    if (!customerInfo.phone.trim()) {
      newErrors.phone = "El teléfono es requerido"
      isValid = false
    } else if (!/^\d{9}$/.test(customerInfo.phone)) {
      newErrors.phone = "El teléfono debe tener 9 dígitos"
      isValid = false
    }

    if (!customerInfo.address.trim()) {
      newErrors.address = "La dirección es requerida"
      isValid = false
    }

    if (!receipt) {
      newErrors.receipt = "Debe subir un comprobante de pago"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"]
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, receipt: "Solo se permiten imágenes (JPG, PNG, WEBP) o PDF" }))
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, receipt: "El archivo no debe superar los 5MB" }))
        return
      }

      setReceipt(file)
      setErrors((prev) => ({ ...prev, receipt: "" }))
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    // Simulate file upload and order processing
    setTimeout(() => {
      // Convert file to base64 for storage (in a real app, you'd upload to a server)
      const reader = new FileReader()
      reader.onloadend = () => {
        const receiptData = reader.result as string

        // Create order
        const order = {
          id: Date.now(),
          customer: customerInfo,
          items: items.map((item) => ({
            product: item,
            quantity: item.quantity,
          })),
          total: getTotalPrice(),
          date: new Date().toLocaleDateString("es-PE"),
          hasReceipt: true,
          receiptUrl: receiptData,
        }

        addOrder(order)
        clearCart()
        setIsSubmitting(false)
        setOrderSuccess(true)

        // Reset form after 3 seconds and close
        setTimeout(() => {
          setOrderSuccess(false)
          setCustomerInfo({
            name: "",
            dni: "",
            email: "",
            phone: "",
            address: "",
          })
          setReceipt(null)
          onClose()
        }, 3000)
      }

      if (receipt) {
        reader.readAsDataURL(receipt)
      }
    }, 2000)
  }

  if (orderSuccess) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 max-w-md w-full text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">¡Pedido Confirmado!</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Tu pedido ha sido registrado exitosamente. Recibirás un correo de confirmación pronto.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-6xl my-8 animate-in slide-in-from-bottom-8 duration-500">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10 rounded-t-3xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-red-600" />
            Finalizar Compra
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200 hover:rotate-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Customer Info & Receipt */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Información de Envío</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className={`w-full px-4 py-3 border ${errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 transition-all`}
                      placeholder="Juan Pérez"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">DNI *</label>
                    <input
                      type="text"
                      value={customerInfo.dni}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, dni: e.target.value })}
                      className={`w-full px-4 py-3 border ${errors.dni ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 transition-all`}
                      placeholder="12345678"
                      maxLength={8}
                    />
                    {errors.dni && <p className="text-red-500 text-sm mt-1">{errors.dni}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className={`w-full px-4 py-3 border ${errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 transition-all`}
                      placeholder="juan@ejemplo.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className={`w-full px-4 py-3 border ${errors.phone ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 transition-all`}
                      placeholder="987654321"
                      maxLength={9}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dirección de Envío *
                    </label>
                    <textarea
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      className={`w-full px-4 py-3 border ${errors.address ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 transition-all`}
                      placeholder="Av. Principal 123, Lima, Perú"
                      rows={3}
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Comprobante de Pago</h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      <p className="font-semibold mb-1">Información de Pago</p>
                      <p>Realiza tu transferencia a:</p>
                      <p className="font-mono mt-2">BCP: 123-456-789-0123</p>
                      <p className="font-mono">Titular: Sr. Robot SAC</p>
                    </div>
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-red-500 transition-colors">
                  <input
                    type="file"
                    id="receipt-upload"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="receipt-upload" className="cursor-pointer flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-semibold mb-1">
                        {receipt ? receipt.name : "Subir Comprobante"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">JPG, PNG, WEBP o PDF (máx. 5MB)</p>
                    </div>
                  </label>
                </div>
                {errors.receipt && <p className="text-red-500 text-sm mt-2">{errors.receipt}</p>}
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Resumen del Pedido</h3>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 space-y-4">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Cantidad: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600 dark:text-red-400">
                          S/{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-300 dark:border-gray-600 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Subtotal</span>
                    <span>S/{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Envío</span>
                    <span className="text-green-600 dark:text-green-400 font-semibold">Gratis</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-300 dark:border-gray-600">
                    <span>Total</span>
                    <span className="text-red-600 dark:text-red-400">S/{getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || items.length === 0}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-2xl transform hover:scale-105 disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      Confirmar Pedido
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
