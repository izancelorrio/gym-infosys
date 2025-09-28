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
import { CreditCard, User, Phone, IdCard, Crown, Users, Star, Loader2, AlertCircle } from "lucide-react"

interface Plan {
  id: number
  nombre: string
  descripcion: string
  precio_mensual: number
  precio_anual?: number
  caracteristicas: string[]
  limite_clases?: number
  acceso_nutricionista: boolean
  acceso_entrenador_personal: boolean
  acceso_areas_premium: boolean
  popular: boolean
  color_tema: string
}

interface ContractPlanModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ContractPlanModal({ isOpen, onClose }: ContractPlanModalProps) {
  const { user, updateUser } = useAuth()
  const [planes, setPlanes] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
        setError(null)
        
        const response = await fetch('/api/planes')
        if (!response.ok) {
          throw new Error('Error al cargar los planes')
        }
        
        const data = await response.json()
        setPlanes(data.planes || [])
      } catch (error) {
        console.error('Error fetching planes:', error)
        setError('No se pudieron cargar los planes')
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
      alert("Error: Usuario no autenticado")
      return
    }
    
    if (user.role !== "usuario") {
      alert("Solo los usuarios pueden contratar planes")
      return
    }
    
    setIsSubmitting(true)
    setError(null)

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
        throw new Error(data.error || 'Error al contratar el plan')
      }

      // Actualizar la sesión del usuario con los nuevos datos
      if (data.user) {
        updateUser(data.user)
      }

      alert(`¡Plan contratado exitosamente! ${data.message}`)
      onClose()
      
      // Opcional: recargar la página para reflejar los cambios
      window.location.reload()
      
    } catch (error) {
      console.error("Error al contratar plan:", error)
      setError(error instanceof Error ? error.message : "Error desconocido al contratar el plan")
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
        ) : error ? (
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="h-8 w-8" />
            <span className="ml-2">{error}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mostrar error si existe */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800">{error}</span>
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
                                  {planSeleccionado.popular && (
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                                      ⭐ Popular
                                    </span>
                                  )}
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
                                  {plan.popular && (
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                                      ⭐ Popular
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {plan.limite_clases ? `${plan.limite_clases} clases` : 'Ilimitado'}
                                  {plan.acceso_nutricionista && ' • Nutricionista'}
                                  {plan.acceso_entrenador_personal && ' • Entrenador'}
                                  {plan.acceso_areas_premium && ' • Premium'}
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
                          {planSeleccionado.popular && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                        </div>
                        <span className="text-xl font-bold text-primary">€{planSeleccionado.precio_mensual}/mes</span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{planSeleccionado.descripcion}</p>
                      
                      {/* Características del plan */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Características incluidas:</h4>
                        <div className="grid grid-cols-1 gap-1 text-xs">
                          {planSeleccionado.limite_clases ? (
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              {planSeleccionado.limite_clases} clases mensuales
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              Clases ilimitadas
                            </div>
                          )}
                          {planSeleccionado.acceso_nutricionista && (
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              Acceso a nutricionista
                            </div>
                          )}
                          {planSeleccionado.acceso_entrenador_personal && (
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              Entrenador personal incluido
                            </div>
                          )}
                          {planSeleccionado.acceso_areas_premium && (
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              Acceso a áreas premium
                            </div>
                          )}
                          
                          {/* Mostrar todas las características del JSON */}
                          {planSeleccionado.caracteristicas.map((caracteristica, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                              {caracteristica}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {planSeleccionado.precio_anual && (
                        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
                          <div className="text-xs text-green-700 font-medium">
                            💰 Plan anual disponible: €{planSeleccionado.precio_anual}/año
                          </div>
                          <div className="text-xs text-green-600">
                            ¡Ahorra €{(planSeleccionado.precio_mensual * 12 - planSeleccionado.precio_anual).toFixed(2)} al año!
                          </div>
                        </div>
                      )}
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