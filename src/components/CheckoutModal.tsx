import React, { useState, useEffect, useRef } from "react"
import { X, Lock, Shield, Check, Download, CreditCard, ShoppingBag, Receipt } from "lucide-react"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { useStore } from "../context/StoreContext"
import jsPDF from "jspdf"

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Region {
  id: string
  name: string
}

interface Province {
  id: string
  name: string
  regionId: string
}

interface District {
  id: string
  name: string
  provinceId: string
}

const REGIONS: Region[] = [
  { id: "10", name: "Huánuco" },
  { id: "15", name: "Lima" },
  { id: "01", name: "Amazonas" },
  { id: "02", name: "Áncash" },
  { id: "03", name: "Apurímac" },
  { id: "04", name: "Arequipa" },
  { id: "05", name: "Ayacucho" },
  { id: "06", name: "Cajamarca" },
  { id: "07", name: "Callao" },
  { id: "08", name: "Cusco" },
  { id: "09", name: "Huancavelica" },
  { id: "11", name: "Ica" },
  { id: "12", name: "Junín" },
  { id: "13", name: "La Libertad" },
  { id: "14", name: "Lambayeque" },
  { id: "16", name: "Loreto" },
  { id: "17", name: "Madre de Dios" },
  { id: "18", name: "Moquegua" },
  { id: "19", name: "Pasco" },
  { id: "20", name: "Piura" },
  { id: "21", name: "Puno" },
  { id: "22", name: "San Martín" },
  { id: "23", name: "Tacna" },
  { id: "24", name: "Tumbes" },
  { id: "25", name: "Ucayali" },
]

const PROVINCES: Province[] = [
  { id: "1001", name: "Huánuco", regionId: "10" },
  { id: "1002", name: "Ambo", regionId: "10" },
  { id: "1003", name: "Dos de Mayo", regionId: "10" },
  { id: "1004", name: "Huacaybamba", regionId: "10" },
  { id: "1005", name: "Huamalíes", regionId: "10" },
  { id: "1006", name: "Leoncio Prado", regionId: "10" },
  { id: "1007", name: "Marañón", regionId: "10" },
  { id: "1008", name: "Pachitea", regionId: "10" },
  { id: "1009", name: "Puerto Inca", regionId: "10" },
  { id: "1010", name: "Lauricocha", regionId: "10" },
  { id: "1011", name: "Yarowilca", regionId: "10" },
  { id: "1501", name: "Lima", regionId: "15" },
  { id: "1502", name: "Barranca", regionId: "15" },
  { id: "1503", name: "Cajatambo", regionId: "15" },
  { id: "1504", name: "Canta", regionId: "15" },
  { id: "1505", name: "Cañete", regionId: "15" },
  { id: "1506", name: "Huaral", regionId: "15" },
  { id: "1507", name: "Huarochirí", regionId: "15" },
  { id: "1508", name: "Huaura", regionId: "15" },
  { id: "1509", name: "Oyón", regionId: "15" },
  { id: "1510", name: "Yauyos", regionId: "15" },
]

const DISTRICTS: District[] = [
  { id: "100101", name: "Huánuco", provinceId: "1001" },
  { id: "100102", name: "Amarilis", provinceId: "1001" },
  { id: "100103", name: "Chinchao", provinceId: "1001" },
  { id: "100104", name: "Churubamba", provinceId: "1001" },
  { id: "100105", name: "Margos", provinceId: "1001" },
  { id: "100106", name: "Quisqui", provinceId: "1001" },
  { id: "100107", name: "San Francisco de Cayrán", provinceId: "1001" },
  { id: "100108", name: "San Pedro de Chaulán", provinceId: "1001" },
  { id: "100109", name: "Santa María del Valle", provinceId: "1001" },
  { id: "100110", name: "Yarumayo", provinceId: "1001" },
  { id: "100111", name: "Pillco Marca", provinceId: "1001" },
  { id: "100112", name: "Yacus", provinceId: "1001" },
  { id: "150101", name: "Lima", provinceId: "1501" },
  { id: "150102", name: "Ancón", provinceId: "1501" },
  { id: "150103", name: "Ate", provinceId: "1501" },
  { id: "150104", name: "Barranco", provinceId: "1501" },
  { id: "150105", name: "Breña", provinceId: "1501" },
  { id: "150106", name: "Carabayllo", provinceId: "1501" },
  { id: "150107", name: "Chaclacayo", provinceId: "1501" },
  { id: "150108", name: "Chorrillos", provinceId: "1501" },
  { id: "150109", name: "Cieneguilla", provinceId: "1501" },
  { id: "150110", name: "Comas", provinceId: "1501" },
  { id: "150111", name: "El Agustino", provinceId: "1501" },
  { id: "150112", name: "Independencia", provinceId: "1501" },
  { id: "150113", name: "Jesús María", provinceId: "1501" },
  { id: "150114", name: "La Molina", provinceId: "1501" },
  { id: "150115", name: "La Victoria", provinceId: "1501" },
  { id: "150116", name: "Lince", provinceId: "1501" },
  { id: "150117", name: "Los Olivos", provinceId: "1501" },
  { id: "150118", name: "Lurigancho", provinceId: "1501" },
  { id: "150119", name: "Lurín", provinceId: "1501" },
  { id: "150120", name: "Magdalena del Mar", provinceId: "1501" },
  { id: "150121", name: "Miraflores", provinceId: "1501" },
  { id: "150122", name: "Pachacamac", provinceId: "1501" },
  { id: "150123", name: "Pucusana", provinceId: "1501" },
  { id: "150124", name: "Pueblo Libre", provinceId: "1501" },
  { id: "150125", name: "Puente Piedra", provinceId: "1501" },
  { id: "150126", name: "Punta Hermosa", provinceId: "1501" },
  { id: "150127", name: "Punta Negra", provinceId: "1501" },
  { id: "150128", name: "Rímac", provinceId: "1501" },
  { id: "150129", name: "San Bartolo", provinceId: "1501" },
  { id: "150130", name: "San Borja", provinceId: "1501" },
  { id: "150131", name: "San Isidro", provinceId: "1501" },
  { id: "150132", name: "San Juan de Lurigancho", provinceId: "1501" },
  { id: "150133", name: "San Juan de Miraflores", provinceId: "1501" },
  { id: "150134", name: "San Luis", provinceId: "1501" },
  { id: "150135", name: "San Martín de Porres", provinceId: "1501" },
  { id: "150136", name: "San Miguel", provinceId: "1501" },
  { id: "150137", name: "Santa Anita", provinceId: "1501" },
  { id: "150138", name: "Santa María del Mar", provinceId: "1501" },
  { id: "150139", name: "Santa Rosa", provinceId: "1501" },
  { id: "150140", name: "Santiago de Surco", provinceId: "1501" },
  { id: "150141", name: "Surquillo", provinceId: "1501" },
  { id: "150142", name: "Villa El Salvador", provinceId: "1501" },
  { id: "150143", name: "Villa María del Triunfo", provinceId: "1501" },
]

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { items, getTotalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const { addOrder } = useStore()

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: "",
    dni: "",
    email: "",
    phone: "",
    region: "",
    province: "",
    district: "",
    addressDetails: "",
  })
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [stripePaymentId, setStripePaymentId] = useState("")
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvc: ""
  })
  const [finalTotal, setFinalTotal] = useState(0)
  const [finalSubtotal, setFinalSubtotal] = useState(0)
  const [finalShipping, setFinalShipping] = useState(0)
  const [finalItems, setFinalItems] = useState<any[]>([])
  const formRef = useRef<HTMLDivElement>(null)

  // Calcular totales
  const subtotal = getTotalPrice()
  const shipping = items.length > 0 ? 15.0 : 0
  const total = subtotal + shipping

  const handleClose = () => {
    if (paymentSuccess) {
      setFormData({
        fullName: "",
        dni: "",
        email: "",
        phone: "",
        region: "",
        province: "",
        district: "",
        addressDetails: "",
      })
      setCardDetails({
        cardNumber: "",
        expiryDate: "",
        cvc: ""
      })
      setCurrentStep(1)
      setCompletedSteps([])
      setIsConfirmed(false)
      setIsProcessing(false)
      setPaymentSuccess(false)
      setStripePaymentId("")
      setFinalTotal(0)
      setFinalSubtotal(0)
      setFinalShipping(0)
      setFinalItems([])
      onClose()
    } else {
      setFormData({
        fullName: "",
        dni: "",
        email: "",
        phone: "",
        region: "",
        province: "",
        district: "",
        addressDetails: "",
      })
      setCardDetails({
        cardNumber: "",
        expiryDate: "",
        cvc: ""
      })
      setCurrentStep(1)
      setCompletedSteps([])
      setIsConfirmed(false)
      setIsProcessing(false)
      setFinalTotal(0)
      setFinalSubtotal(0)
      setFinalShipping(0)
      setFinalItems([])
      onClose()
    }
  }

  useEffect(() => {
    if (formData.region) {
      setProvinces(PROVINCES.filter((p) => p.regionId === formData.region))
      setFormData((prev) => ({ ...prev, province: "", district: "" }))
      setDistricts([])
    }
  }, [formData.region])

  useEffect(() => {
    if (formData.province) {
      setDistricts(DISTRICTS.filter((d) => d.provinceId === formData.province))
      setFormData((prev) => ({ ...prev, district: "" }))
    }
  }, [formData.province])

  if (!isOpen) return null

  const steps = [
    { number: 1, title: "Información" },
    { number: 2, title: "Ubicación" },
    { number: 3, title: "Pago" },
    { number: 4, title: "Confirmación" },
  ]

  const validateStep1 = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^[0-9]{9}$/
    const dniRegex = /^\d{8}$/

    if (!formData.fullName.trim()) {
      alert("El Nombre Completo es obligatorio.")
      return false
    }
    if (!dniRegex.test(formData.dni)) {
      alert("El DNI debe contener exactamente 8 dígitos numéricos.")
      return false
    }
    if (!emailRegex.test(formData.email)) {
      alert("Por favor, ingrese un correo electrónico válido (ej. usuario@dominio.com).")
      return false
    }
    if (!phoneRegex.test(formData.phone)) {
      alert("El Teléfono debe contener exactamente 9 dígitos.")
      return false
    }
    return true
  }

  const validateCardDetails = () => {
    const cardNumberRegex = /^\d{16}$/
    const expiryDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/
    const cvcRegex = /^\d{3,4}$/

    if (!cardDetails.cardNumber.replace(/\s/g, '').match(cardNumberRegex)) {
      alert("Por favor ingrese un número de tarjeta válido (16 dígitos)")
      return false
    }
    if (!cardDetails.expiryDate.match(expiryDateRegex)) {
      alert("Por favor ingrese una fecha de vencimiento válida (MM/AA)")
      return false
    }
    if (!cardDetails.cvc.match(cvcRegex)) {
      alert("Por favor ingrese un CVC válido (3 o 4 dígitos)")
      return false
    }
    return true
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target

    // Formateo automático para número de tarjeta
    if (name === "cardNumber") {
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()
      if (value.length > 19) value = value.slice(0, 19)
    }
    // Formateo automático para fecha de vencimiento
    else if (name === "expiryDate") {
      value = value.replace(/\D/g, '')
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4)
      }
      if (value.length > 5) value = value.slice(0, 5)
    }
    // Solo números para CVC
    else if (name === "cvc") {
      value = value.replace(/\D/g, '')
      if (value.length > 4) value = value.slice(0, 4)
    }

    setCardDetails({
      ...cardDetails,
      [name]: value,
    })
  }

  const handleContinue = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return
    }
    if (currentStep === 2 && (!formData.region || !formData.province || !formData.district)) {
      alert("Por favor, completa todos los campos requeridos en Ubicación.")
      return
    }
    if (currentStep < 4) {
      setCompletedSteps((prev) => [...prev, currentStep])
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setCompletedSteps((prev) => prev.filter(step => step !== currentStep - 1))
    }
  }

  const handleStripePayment = async () => {
    if (!user) {
      alert("Debes iniciar sesión para confirmar el pedido")
      return
    }

    if (items.length === 0) {
      alert("No hay productos en el carrito")
      return
    }

    if (!validateCardDetails()) {
      return
    }

    setIsProcessing(true)
    setCurrentStep(4)

    try {
      console.log("💳 Procesando pago con Stripe...")
      console.log("💰 Monto total:", total, "PEN")
      
      // Guardar toda la información ANTES de limpiar el carrito
      setFinalTotal(total)
      setFinalSubtotal(subtotal)
      setFinalShipping(shipping)
      setFinalItems([...items]) // Guardar copia de los items
      
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Generar ID de pago simulado
      const simulatedPaymentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setStripePaymentId(simulatedPaymentId)
      
      // Crear orden local
      const order = {
        customer: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: fullAddress,
          dni: formData.dni,
        },
        items: items.map((item) => ({
          product: item,
          quantity: item.quantity,
        })),
        total: total,
        status: "confirmed" as const,
        paymentMethod: "stripe" as const,
        stripePaymentId: simulatedPaymentId,
        cardLast4: cardDetails.cardNumber.slice(-4)
      }

      addOrder(order)
      setIsConfirmed(true)
      setPaymentSuccess(true)
      setCompletedSteps([1, 2, 3, 4])
      clearCart()
      
      console.log("🎉 ¡Pago exitoso!")
      console.log("📋 ID de pago:", simulatedPaymentId)
      console.log("💳 Tarjeta terminada en:", cardDetails.cardNumber.slice(-4))
      console.log("💰 Monto pagado:", total, "PEN")
      
    } catch (error) {
      console.error("❌ Error en el pago:", error)
      alert("Error al procesar el pago. Intenta nuevamente.")
      setCurrentStep(3)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadReceipt = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    let y = 20

    // Logo y título
    doc.setFont("helvetica", "bold")
    doc.setFontSize(20)
    doc.setTextColor(220, 53, 69)
    doc.text("SR. ROBOT", pageWidth / 2, y, { align: "center" })
    y += 12

    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text("COMPROBANTE DE PAGO", pageWidth / 2, y, { align: "center" })
    y += 15

    // Información de pago
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`ID de Transacción: ${stripePaymentId}`, 20, y)
    y += 6
    doc.text(`Fecha: ${new Date().toLocaleString('es-PE')}`, 20, y)
    y += 10

    // Separador
    doc.setLineWidth(0.5)
    doc.line(20, y, pageWidth - 20, y)
    y += 12

    // Información del cliente
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("INFORMACIÓN DEL CLIENTE", 20, y)
    y += 8

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Nombre: ${formData.fullName}`, 20, y)
    y += 6
    doc.text(`DNI: ${formData.dni}`, 20, y)
    y += 6
    doc.text(`Email: ${formData.email}`, 20, y)
    y += 6
    doc.text(`Teléfono: ${formData.phone}`, 20, y)
    y += 6
    doc.text(`Dirección: ${fullAddress}`, 20, y, { maxWidth: pageWidth - 40 })
    y += 12

    // Información del pago
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("DETALLES DEL PAGO", 20, y)
    y += 8

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Método de Pago: Stripe (Tarjeta)`, 20, y)
    y += 6
    doc.text(`ID de Pago: ${stripePaymentId}`, 20, y)
    y += 6
    doc.text(`Tarjeta: **** **** **** ${cardDetails.cardNumber.slice(-4)}`, 20, y)
    y += 12

    // Productos
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("PRODUCTOS COMPRADOS", 20, y)
    y += 10

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    
    // Encabezados de tabla
    doc.setFillColor(240, 240, 240)
    doc.rect(20, y, pageWidth - 40, 8, 'F')
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.text("Producto", 22, y + 6)
    doc.text("Cant.", 120, y + 6)
    doc.text("P. Unit.", 140, y + 6)
    doc.text("Subtotal", 170, y + 6)
    y += 12

    doc.setFont("helvetica", "normal")
    finalItems.forEach((item, index) => {
      if (y > 250) {
        doc.addPage()
        y = 20
      }
      
      const productName = `${index + 1}. ${item.name}`
      // Producto (con salto de línea si es muy largo)
      const productLines = doc.splitTextToSize(productName, 70)
      doc.text(productLines, 22, y)
      
      // Obtener la altura del texto del producto para alinear las demás columnas
      const productHeight = productLines.length * 4
      
      doc.text(`${item.quantity}`, 120, y)
      doc.text(`S/ ${item.price.toFixed(2)}`, 140, y)
      doc.text(`S/ ${(item.price * item.quantity).toFixed(2)}`, 170, y)
      
      y += Math.max(8, productHeight)
    })

    // Totales
    y += 8
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text(`Subtotal: S/ ${finalSubtotal.toFixed(2)}`, 140, y)
    y += 8
    doc.text(`Costo de Envío: S/ ${finalShipping.toFixed(2)}`, 140, y)
    y += 8
    doc.setFontSize(12)
    doc.setTextColor(220, 53, 69)
    doc.text(`TOTAL PAGADO: S/ ${finalTotal.toFixed(2)} PEN`, 140, y)
    y += 15

    // Método de pago destacado
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "bold")
    doc.text("MÉTODO DE PAGO:", 20, y)
    y += 7
    doc.setFont("helvetica", "normal")
    doc.text("💳 Stripe - Tarjeta de Crédito/Débito", 20, y)
    y += 6
    doc.text(`💰 Monto Procesado: S/ ${finalTotal.toFixed(2)} PEN`, 20, y)
    y += 12

    // Separador final
    doc.setLineWidth(0.3)
    doc.line(20, y, pageWidth - 20, y)
    y += 10

    // Mensaje de agradecimiento
    doc.setFont("helvetica", "italic")
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text("¡Gracias por tu compra en Sr. Robot!", pageWidth / 2, y, { align: "center" })
    y += 5
    doc.text("Tecnología de vanguardia para ti", pageWidth / 2, y, { align: "center" })
    y += 10

    // Pie de página
    doc.setFontSize(7)
    doc.setTextColor(150, 150, 150)
    doc.text("Este comprobante es generado automáticamente y no requiere firma.", pageWidth / 2, y, { align: "center" })
    y += 4
    doc.text("Para consultas o soporte, contacta a nuestro servicio al cliente.", pageWidth / 2, y, { align: "center" })

    // Guardar PDF
    doc.save(`comprobante_sr_robot_${formData.dni}_${Date.now()}.pdf`)
  }

  const handleContinueShopping = () => {
    setFormData({
      fullName: "",
      dni: "",
      email: "",
      phone: "",
      region: "",
      province: "",
      district: "",
      addressDetails: "",
    })
    setCardDetails({
      cardNumber: "",
      expiryDate: "",
      cvc: ""
    })
    setCurrentStep(1)
    setCompletedSteps([])
    setIsConfirmed(false)
    setIsProcessing(false)
    setPaymentSuccess(false)
    setStripePaymentId("")
    setFinalTotal(0)
    setFinalSubtotal(0)
    setFinalShipping(0)
    setFinalItems([])
    onClose()
  }

  const fullAddress = `${formData.district}, ${formData.province}, ${formData.region}${formData.addressDetails ? ` - ${formData.addressDetails}` : ""}`

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-gradient-to-b from-white to-green-50 dark:from-gray-900 dark:to-green-900/20 rounded-3xl shadow-xl overflow-hidden flex flex-col font-sans max-h-[95vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center gap-3">
            <Lock className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {paymentSuccess ? "¡Pago Exitoso! 🎉" : "Checkout Seguro"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {!paymentSuccess ? (
          <>
            {/* Steps Indicator */}
            <div className="flex items-center justify-center gap-4 p-6 bg-gray-50 dark:bg-gray-800">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                        completedSteps.includes(step.number)
                          ? "bg-green-500 text-white shadow-lg"
                          : step.number === currentStep
                          ? "bg-blue-500 text-white shadow-lg"
                          : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {completedSteps.includes(step.number) ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      step.number === currentStep || completedSteps.includes(step.number)
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 h-1 transition-all duration-300 ${
                        completedSteps.includes(step.number) 
                          ? "bg-green-500" 
                          : step.number < currentStep
                          ? "bg-blue-300"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div ref={formRef} className="flex-1 p-6 overflow-y-auto">
                {currentStep === 1 && (
                  <div className="space-y-6 max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Información Personal</h3>
                      <p className="text-gray-600 dark:text-gray-400">Completa tus datos para el envío</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nombre Completo *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                          placeholder="Juan Pérez"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">DNI *</label>
                        <input
                          type="text"
                          name="dni"
                          value={formData.dni}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                          placeholder="12345678"
                          maxLength={8}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                          placeholder="usuario@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Teléfono *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                          placeholder="987654321"
                          maxLength={9}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={handleClose}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors duration-200"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleContinue}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors duration-200"
                      >
                        Continuar a Ubicación
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6 max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ubicación de Envío</h3>
                      <p className="text-gray-600 dark:text-gray-400">Donde entregaremos tu pedido</p>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Región *</label>
                          <select
                            name="region"
                            value={formData.region}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                          >
                            <option value="">Seleccionar región</option>
                            {REGIONS.map((reg) => (
                              <option key={reg.id} value={reg.id}>
                                {reg.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Provincia *
                          </label>
                          <select
                            name="province"
                            value={formData.province}
                            onChange={handleInputChange}
                            disabled={!formData.region}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 transition-colors duration-200"
                          >
                            <option value="">Seleccionar provincia</option>
                            {provinces.map((prov) => (
                              <option key={prov.id} value={prov.id}>
                                {prov.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Distrito *
                          </label>
                          <select
                            name="district"
                            value={formData.district}
                            onChange={handleInputChange}
                            disabled={!formData.province}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 transition-colors duration-200"
                          >
                            <option value="">Seleccionar distrito</option>
                            {districts.map((dist) => (
                              <option key={dist.id} value={dist.name}>
                                {dist.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Dirección detallada (opcional)
                        </label>
                        <textarea
                          name="addressDetails"
                          value={formData.addressDetails}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                          placeholder="Calle, número, urbanización, referencia, etc."
                        />
                      </div>
                      
                      {fullAddress && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>📍 Dirección completa:</strong> {fullAddress}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={handleBack}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors duration-200"
                      >
                        Atrás
                      </button>
                      <button
                        onClick={handleContinue}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors duration-200"
                      >
                        Continuar al Pago
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6 max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Método de Pago</h3>
                      <p className="text-gray-600 dark:text-gray-400">Ingresa los datos de tu tarjeta</p>
                    </div>

                    {/* Resumen de compra */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Resumen de tu compra</h4>
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Cantidad: {item.quantity}</p>
                            </div>
                            <span className="text-sm font-bold">S/ {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="space-y-2 pt-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                            <span className="font-medium">S/ {subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Costo de envío:</span>
                            <span className="font-medium">S/ {shipping.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-600 pt-3">
                            <span>Total a pagar:</span>
                            <span className="text-green-600">S/ {total.toFixed(2)} PEN</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Información de envío */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Envío a:</h4>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p><strong>Nombre:</strong> {formData.fullName}</p>
                        <p><strong>Dirección:</strong> {fullAddress}</p>
                        <p><strong>Contacto:</strong> {formData.phone} | {formData.email}</p>
                      </div>
                    </div>

                    {/* Formulario de tarjeta */}
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-8 shadow-2xl">
                      <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-3 mb-4">
                          <CreditCard className="w-8 h-8 text-purple-600" />
                          <h4 className="text-xl font-bold text-gray-900 dark:text-white">Pago con Tarjeta</h4>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Pago seguro procesado por Stripe
                        </p>
                      </div>

                      {/* Monto destacado */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 text-center shadow-lg border border-purple-100 dark:border-purple-900">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Receipt className="w-6 h-6 text-green-600" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">TOTAL A PAGAR</span>
                        </div>
                        <p className="text-3xl font-bold text-green-600 mb-1">S/ {total.toFixed(2)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">PEN - Soles Peruanos</p>
                      </div>

                      {/* Campos de tarjeta */}
                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Número de Tarjeta *
                          </label>
                          <input
                            type="text"
                            name="cardNumber"
                            value={cardDetails.cardNumber}
                            onChange={handleCardInputChange}
                            placeholder="1234 5678 9012 3456"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Fecha de Vencimiento *
                            </label>
                            <input
                              type="text"
                              name="expiryDate"
                              value={cardDetails.expiryDate}
                              onChange={handleCardInputChange}
                              placeholder="MM/AA"
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              CVC *
                            </label>
                            <input
                              type="text"
                              name="cvc"
                              value={cardDetails.cvc}
                              onChange={handleCardInputChange}
                              placeholder="123"
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleStripePayment}
                        disabled={isProcessing || total === 0}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none text-lg"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Procesando Pago...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-6 h-6" />
                            Pagar S/ {total.toFixed(2)}
                          </>
                        )}
                      </button>

                      <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                          <Shield className="w-4 h-4" />
                          <span>Pago 100% seguro | Protegido por Stripe</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={handleBack}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors duration-200"
                      >
                        Atrás
                      </button>
                      <button
                        onClick={handleClose}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-colors duration-200"
                      >
                        Cancelar Compra
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6 max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {isProcessing ? "Procesando Pago..." : "Confirmando Pago"}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {isProcessing ? "Estamos procesando tu pago con Stripe..." : "Verificando el estado de tu pago..."}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-blue-200 dark:border-blue-800">
                      <div className="text-center">
                        {isProcessing ? (
                          <>
                            <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              Procesando tu pago de S/ {total.toFixed(2)}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              Por favor espera, esto puede tomar unos segundos...
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              ¡Pago Confirmado!
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              Tu pago de S/ {total.toFixed(2)} ha sido procesado exitosamente.
                            </p>
                          </>
                        )}
                      </div>

                      {!isProcessing && (
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm text-blue-700 dark:text-blue-400 text-center">
                            <strong>ID de Transacción:</strong> {stripePaymentId}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar - Resumen del pedido */}
              <div className="w-96 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 border-l border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Resumen del Pedido</h3>
                
                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">{item.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cantidad: {item.quantity}</p>
                        <p className="text-sm font-bold text-green-600 mt-1">S/ {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3 border-t border-gray-200 dark:border-gray-600 pt-4">
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="font-semibold">S/ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600 dark:text-gray-400">Envío:</span>
                    <span className="font-semibold">S/ {shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold border-t border-gray-200 dark:border-gray-600 pt-3">
                    <span>Total:</span>
                    <span className="text-green-600">S/ {total.toFixed(2)} PEN</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                      Pago 100% seguro
                    </span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Tu información de pago está protegida con encriptación bancaria de nivel enterprise.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* PANTALLA DE PAGO EXITOSO */
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md w-full">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">¡Pago Exitoso! 🎉</h2>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg mb-4 border border-green-200 dark:border-green-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total pagado:</span>
                  <span className="text-xl font-bold text-green-600">S/ {finalTotal.toFixed(2)}</span>
                </div>
                
                <div className="grid grid-cols-1 text-xs text-gray-600 dark:text-gray-400">
                  <p><strong className="text-gray-900 dark:text-white">Método:</strong> Stripe (Tarjeta)</p>
                  <p><strong className="text-gray-900 dark:text-white">ID de Pago:</strong> {stripePaymentId}</p>
                  <p><strong className="text-gray-900 dark:text-white">Tarjeta:</strong> **** **** **** {cardDetails.cardNumber.slice(-4)}</p>
                  <p><strong className="text-gray-900 dark:text-white">Cliente:</strong> {formData.fullName}</p>
                  <p><strong className="text-gray-900 dark:text-white">Email:</strong> {formData.email}</p>
                  <p><strong className="text-gray-900 dark:text-white">Envío a:</strong> {fullAddress}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                ✅ Tu pedido ha sido confirmado. Recibirás un correo con los detalles de tu compra.
              </p>

              <div className="grid grid-cols-1 gap-2 max-w-xs mx-auto">
                <button
                  onClick={handleDownloadReceipt}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Descargar Comprobante
                </button>
                
                <button
                  onClick={handleContinueShopping}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Seguir Comprando
                </button>
              </div>

              <div className="mt-4 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-xs text-purple-700 dark:text-purple-400">
                  💡 <strong>Para ver el pago en Stripe:</strong> Ve a dashboard.stripe.com → Payments → Busca el ID: {stripePaymentId}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}