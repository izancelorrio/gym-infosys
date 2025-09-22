"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { CreditCard, User, Phone, IdCard, Crown, Users } from "lucide-react"

interface ContractPlanModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ContractPlanModal({ isOpen, onClose }: ContractPlanModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    nombre: user?.name || "",
    email: user?.email || "",
    dni: "",
    telefono: "",
    numeroTarjeta: "",
    plan: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const planes = [
    {
      id: "basico",
      nombre: "Plan Básico",
      precio: 29.99,
      descripcion: "Acceso completo al gimnasio y clases grupales",
      icono: <Users className="h-5 w-5" />,
      color: "bg-gray-100 text-gray-800"
    },
    {
      id: "pro",
      nombre: "Plan Pro",
      precio: 49.99,
      descripcion: "Plan Básico + entrenador personal + nutrición",
      icono: <Crown className="h-5 w-5" />,
      color: "bg-purple-100 text-purple-800"
    }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Aquí iría la lógica para procesar la contratación del plan
      console.log("Datos de contratación:", formData)
      
      // Simulamos una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert("¡Plan contratado exitosamente!")
      onClose()
    } catch (error) {
      console.error("Error al contratar plan:", error)
      alert("Error al procesar la contratación. Inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const planSeleccionado = planes.find(p => p.id === formData.plan)

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

        <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="grid grid-cols-1 gap-3">
                  {planes.map((plan) => (
                    <div
                      key={plan.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        formData.plan === plan.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleInputChange("plan", plan.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {plan.icono}
                          <h3 className="font-semibold">{plan.nombre}</h3>
                        </div>
                        <Badge className={plan.color}>
                          €{plan.precio}/mes
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.descripcion}</p>
                      <input
                        type="radio"
                        name="plan"
                        value={plan.id}
                        checked={formData.plan === plan.id}
                        onChange={(e) => handleInputChange("plan", e.target.value)}
                        className="sr-only"
                      />
                    </div>
                  ))}
                </div>
                
                {planSeleccionado && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Plan seleccionado:</span>
                      <span className="text-xl font-bold text-primary">€{planSeleccionado.precio}/mes</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{planSeleccionado.nombre}</span>
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
                      <Input placeholder="MM/AA" maxLength={5} required />
                    </div>
                    <div className="space-y-2">
                      <Label>CVV *</Label>
                      <Input placeholder="123" maxLength={3} required />
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
              disabled={isSubmitting || !formData.plan || !formData.dni || !formData.telefono || !formData.numeroTarjeta}
              className="px-6 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? "Procesando..." : planSeleccionado ? `Contratar por €${planSeleccionado.precio}/mes` : "Seleccionar Plan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}