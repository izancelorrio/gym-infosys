"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/toast"
import { CreditCard, User, Phone, IdCard, Crown, Users, Star, Loader2, AlertCircle } from "lucide-react"

interface Plan {
  id: number
  nombre: string
  descripcion: string
  precio_mensual: number
  precio_anual?: number
  caracteristicas: string[]
  acceso_entrenador: boolean
  activo: boolean
  color_tema: string
  orden_display: number
  // Campos calculados/compatibilidad
  limite_clases?: number
  acceso_nutricionista: boolean
  acceso_entrenador_personal: boolean
  acceso_areas_premium: boolean
  popular: boolean
}

interface ContractPlanModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ContractPlanModal({ isOpen, onClose }: ContractPlanModalProps) {
  const { user, updateUser } = useAuth()
  const [planes, setPlanes] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  // `fatalError` para errores de carga que deben reemplazar el contenido
  const [fatalError, setFatalError] = useState<string | null>(null)
  // `formError` para errores de validación/envío que se muestran inline en el formulario
  const [formError, setFormError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nombre: user?.name || "",
    email: user?.email || "",
    dni: "",
    telefono: "",
    fechaNacimiento: "",
    genero: "",
    numeroTarjeta: "",
    fechaExpiracion: "",
    cvv: "",
    plan: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cargar planes desde la API
  useEffect(() => {
    const fetchPlanes = async () => {
      try {
        setLoading(true)
        setFatalError(null)
        
        const response = await fetch(`/api/planes?_t=${Date.now()}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        if (!response.ok) {
          throw new Error('Error al cargar los planes')
        }
        
        const data = await response.json()
        setPlanes(data.planes || [])
      } catch (error) {
        console.error('Error fetching planes:', error)
        setFatalError('No se pudieron cargar los planes')
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchPlanes()
    }
  }, [isOpen])

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        nombre: user?.name || "",
        email: user?.email || "",
        dni: "",
        telefono: "",
        fechaNacimiento: "",
        genero: "",
        numeroTarjeta: "",
        fechaExpiracion: "",
        cvv: "",
        plan: ""
      })
    }
  }, [isOpen, user])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setFormError("Error: Usuario no autenticado")
      return
    }

    if (user.role !== "usuario") {
      setFormError("Solo los usuarios pueden contratar planes")
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    // Normalizar y validar DNI/NIE en frontend
    const rawDni = formData.dni || ""
    const dniNorm = rawDni.replace(/\s+/g, '').toUpperCase()
    const dniRegex = /^([0-9]{8}[A-Z])$|^[XYZ][0-9]{7}[A-Z]$/
    if (!dniRegex.test(dniNorm)) {
      setFormError('Formato de DNI/NIE inválido')
      setIsSubmitting(false)
      return
    }
    // asignar normalizado
    formData.dni = dniNorm
    
    // Normalizar y validar teléfono (acepta +34 y formatos con espacios/guiones)
    const rawPhone = formData.telefono || ""
    const digits = rawPhone.replace(/[^0-9]/g, '')
    let normalizedPhone = digits
    if (digits.startsWith('34') && digits.length === 11) {
      normalizedPhone = digits.slice(2)
    }
    const phoneRegex = /^[6-9][0-9]{8}$/
    if (!phoneRegex.test(normalizedPhone)) {
      setFormError('Formato de teléfono inválido. Debe ser un teléfono español de 9 dígitos, opcionalmente con +34.')
      setIsSubmitting(false)
      return
    }
    // asignar normalizado
    formData.telefono = normalizedPhone

    try {
      const contractData = {
        user_id: user.id,
        plan_id: parseInt(formData.plan),
        dni: formData.dni,
        numero_telefono: formData.telefono,
        fecha_nacimiento: formData.fechaNacimiento,
        genero: formData.genero,
        num_tarjeta: formData.numeroTarjeta,
        fecha_tarjeta: formData.fechaExpiracion,
        cvv: formData.cvv
      }

      const response = await fetch('/api/contract-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contractData),
      })

      const data = await response.json()

      if (!response.ok) {
        // detectar duplicado por campo y mostrar mensaje específico
        const detail = data.detail || data.error || ''
        const detailStr = typeof detail === 'string' ? detail : JSON.stringify(detail)
        if (/numero_telefono|telefono|phone/i.test(detailStr)) {
          throw new Error('El número de teléfono ya está en la base de datos')
        } else if (/dni|nie/i.test(detailStr) || /Key \(dni\)/i.test(detailStr)) {
          throw new Error('El DNI ya está en la base de datos')
        } else if (/duplicate key/i.test(detailStr)) {
          throw new Error('Ya existe un registro en la base de datos con ese valor')
        }
        throw new Error(data.error || 'Error al contratar el plan')
      }

      // Actualizar la sesión del usuario con los nuevos datos
      if (data.user) {
        updateUser(data.user)
      }

      toast({ title: 'Plan contratado', description: data.message, type: 'success' })
      onClose()
      
      // Opcional: recargar la página para reflejar los cambios
      window.location.reload()
      
    } catch (error) {
      console.error("Error al contratar plan:", error)
      setFormError(error instanceof Error ? error.message : "Error desconocido al contratar el plan")
    } finally {
      setIsSubmitting(false)
    }
  }

  const planSeleccionado = planes.find(p => p.id.toString() === formData.plan)

  // Función para obtener icono basado en el plan
  const getPlanIcon = (plan: Plan) => {
    if (plan.acceso_entrenador_personal && plan.acceso_areas_premium) {
      return <Crown className="h-5 w-5" />
    }
    return <Users className="h-5 w-5" />
  }

  // Función para obtener color del plan
  const getPlanColorClass = (plan: Plan) => {
    if (plan.popular) {
      return "bg-blue-100 text-blue-800 border-blue-200"
    }
    if (plan.precio_mensual >= 80) {
      return "bg-purple-100 text-purple-800 border-purple-200"
    }
    if (plan.precio_mensual >= 50) {
      return "bg-green-100 text-green-800 border-green-200"
    }
    return "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-none !w-[90vw] min-w-[90vw] max-h-[80vh] overflow-y-auto" style={{ width: '90vw', maxWidth: '90vw' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="bg-primary/20 p-3 rounded-full">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            Contratar Plan de Gimnasio
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Cargando planes...</span>
          </div>
        ) : fatalError ? (
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="h-8 w-8" />
            <span className="ml-2">{fatalError}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mostrar error de formulario si existe (inline) */}
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-800">{formError}</span>
                </div>
                <button type="button" onClick={() => setFormError(null)} aria-label="Cerrar mensaje" className="text-red-600 hover:opacity-80">✕</button>
              </div>
            )}
            
            {/* Layout horizontal: Info Personal + Selección de Plan + Info de Pago */}
            <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-6">
              {/* Información Personal */}
              <Card className="bg-card border-border shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre Completo</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => handleInputChange("nombre", e.target.value)}
                      className="bg-muted/50"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="bg-muted/50"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dni">DNI/NIE *</Label>
                    <Input
                      id="dni"
                      value={formData.dni}
                      onChange={(e) => handleInputChange("dni", e.target.value)}
                      placeholder="12345678A"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input
                      id="telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => handleInputChange("telefono", e.target.value)}
                      placeholder="+34 123 456 789"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                    <Input
                      id="fechaNacimiento"
                      type="date"
                      value={formData.fechaNacimiento}
                      onChange={(e) => handleInputChange("fechaNacimiento", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genero">Género *</Label>
                    <Select
                      value={formData.genero}
                      onValueChange={(value) => handleInputChange("genero", value)}
                    >
                      <SelectTrigger id="genero">
                        <SelectValue placeholder="Selecciona tu género" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="femenino">Femenino</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Selección de Plan */}
              <Card className="bg-card border-border shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Crown className="h-5 w-5 text-purple-600" />
                    </div>
                    Seleccionar Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan-select">Elige tu plan *</Label>
                    <Select
                      value={formData.plan}
                      onValueChange={(value) => handleInputChange("plan", value)}
                    >
                      <SelectTrigger id="plan-select" className="w-full h-auto py-3">
                        <SelectValue placeholder="Selecciona un plan...">
                          {planSeleccionado && (
                            <div className="flex items-center gap-2">
                              {getPlanIcon(planSeleccionado)}
                              <div className="flex-1 text-left">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{planSeleccionado.nombre}</span>
                                  <span className="text-sm font-bold text-primary">€{planSeleccionado.precio_mensual}/mes</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {planes.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id.toString()} className="py-3">
                            <div className="flex items-center gap-3 w-full">
                              {getPlanIcon(plan)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{plan.nombre}</span>
                                  <span className="text-sm font-bold text-primary">€{plan.precio_mensual}/mes</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {plan.caracteristicas.slice(0, 2).join(' • ')}
                                  {plan.caracteristicas.length > 2 && '...'}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {planSeleccionado && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getPlanIcon(planSeleccionado)}
                          <span className="font-semibold text-lg">{planSeleccionado.nombre}</span>
                        </div>
                        <span className="text-xl font-bold text-primary">€{planSeleccionado.precio_mensual}/mes</span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{planSeleccionado.descripcion}</p>
                      
                      {/* Características del plan */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Características incluidas:</h4>
                        <div className="grid grid-cols-1 gap-1 text-xs">
                          {/* Mostrar todas las características del JSON */}
                          {planSeleccionado.caracteristicas.map((caracteristica, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                              {caracteristica}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Información de Pago */}
              <Card className="bg-card border-border shadow-lg xl:col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="bg-green-100 p-2 rounded-full">
                      <CreditCard className="h-5 w-5 text-green-600" />
                    </div>
                    Información de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="numeroTarjeta">Número de Tarjeta *</Label>
                      <Input
                        id="numeroTarjeta"
                        value={formData.numeroTarjeta}
                        onChange={(e) => handleInputChange("numeroTarjeta", e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Fecha de Expiración *</Label>
                        <Input 
                          placeholder="MM/AA" 
                          maxLength={5} 
                          value={formData.fechaExpiracion}
                          onChange={(e) => handleInputChange("fechaExpiracion", e.target.value)}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CVV *</Label>
                        <Input 
                          placeholder="123" 
                          maxLength={3} 
                          value={formData.cvv}
                          onChange={(e) => handleInputChange("cvv", e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-row gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.plan || !formData.dni || !formData.telefono || !formData.fechaNacimiento || !formData.genero || !formData.numeroTarjeta || !formData.fechaExpiracion || !formData.cvv}
                className="px-6 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? "Procesando..." : planSeleccionado ? `Contratar por €${planSeleccionado.precio_mensual}/mes` : "Seleccionar Plan"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}