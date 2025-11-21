"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Users, ArrowLeft, UserCheck, Crown, Dumbbell, Save, User, Loader2, AlertCircle, Mail, MailCheck, CreditCard, Phone, MapPin, Clock } from "lucide-react"

interface Cliente {
  id: number
  dni: string
  numero_telefono: string
  plan_id: number
  plan_name: string
  fecha_nacimiento: string
  genero: string
  fecha_inscripcion: string
  estado: string
  created_at: string
  updated_at: string
  num_tarjeta?: string
  fecha_tarjeta?: string
  cvv?: string
}

interface Usuario {
  id: number
  name: string
  email: string
  role: string
  email_verified: boolean
  created_at?: string
  updated_at?: string
  cliente?: Cliente
}

export default function DetalleUsuarioPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [usuarioData, setUsuarioData] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editando, setEditando] = useState(false)
  // snapshot del usuario antes de editar (se usa para restaurar al cancelar)
  const [usuarioSnapshot, setUsuarioSnapshot] = useState<Usuario | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [planes, setPlanes] = useState<{id: number, nombre: string}[]>([])
  const [loadingPlanes, setLoadingPlanes] = useState(false)

  const closeErrorModal = () => {
    setShowErrorModal(false)
    setError(null)
  }

  useEffect(() => {
    if (error) {
      setShowErrorModal(true)
    }
  }, [error])

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/")
    }
  }, [user, router])

  // Cargar planes disponibles
  const fetchPlanes = async () => {
    try {
      console.log('🔄 Iniciando carga de planes...')
      setLoadingPlanes(true)
      
      const response = await fetch('/api/admin/planes', {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      
      console.log('📝 Status de la respuesta:', response.status)
      
      if (!response.ok) {
        throw new Error(`Error al cargar los planes: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📝 Planes recibidos:', data)
      
      if (!data.planes || !Array.isArray(data.planes)) {
        throw new Error('Formato de datos inválido')
      }
      
      setPlanes(data.planes)
      console.log('✅ Planes cargados correctamente')
    } catch (error) {
      console.error('❌ Error cargando planes:', error)
      setError('Error al cargar los planes disponibles: ' + (error instanceof Error ? error.message : 'Error desconocido'))
    } finally {
      setLoadingPlanes(false)
    }
  }

  // Cargar planes al montar el componente
  useEffect(() => {
    if (editando) {
      fetchPlanes()
    }
  }, [editando])

  // Debugging: monitorear cambios en usuarioData
  useEffect(() => {
    if (usuarioData) {
      console.log('📊 Estado usuarioData actualizado:', usuarioData)
      console.log('👤 Nombre actual en estado:', usuarioData.name)
    }
  }, [usuarioData])

  // Función para cargar datos del usuario
  const fetchUsuario = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      setError(null)
      
      const response = await fetch(`/api/admin/users/${userId}?_t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      if (!response.ok) {
        throw new Error('Error al cargar el usuario')
      }
      
      const data = await response.json()
      console.log('🔍 Datos recibidos del servidor:', data)
      console.log('👤 Usuario específico:', data.user)
      console.log('📅 Timestamp actual:', new Date().toISOString())
      setUsuarioData(data.user)
    } catch (error) {
      console.error('Error fetching usuario:', error)
      setError('No se pudo cargar el usuario')
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  // Cargar datos del usuario desde la API
  useEffect(() => {
    if (user && user.role === "admin" && userId) {
      fetchUsuario()
    }
  }, [user, userId])

  const handleGuardar = async () => {
    if (!usuarioData) return
    
    try {
      // Validar campos requeridos cuando se cambia a cliente
      if (usuarioData.role === "cliente" && !usuarioData.cliente?.id) {
        // Validar DNI
        if (!usuarioData.cliente?.dni) {
          setError("El DNI/NIE es obligatorio para crear un cliente")
          return
        }
        // Validar Plan
        if (!usuarioData.cliente?.plan_id) {
          setError("Debes seleccionar un plan para el cliente")
          return
        }
        // Validar Fecha de nacimiento
        if (!usuarioData.cliente?.fecha_nacimiento) {
          setError("La fecha de nacimiento es obligatoria para crear un cliente")
          return
        }
        // Validar Género
        if (!usuarioData.cliente?.genero) {
          setError("El género es obligatorio para crear un cliente")
          return
        }
        // Validar Teléfono
        if (!usuarioData.cliente?.numero_telefono) {
          setError("El número de teléfono es obligatorio para crear un cliente")
          return
        }
        // Validar número de tarjeta
        if (!usuarioData.cliente?.num_tarjeta) {
          setError("El número de tarjeta es obligatorio para crear un cliente")
          return
        }
        // Validar fecha de caducidad de tarjeta
        if (!usuarioData.cliente?.fecha_tarjeta) {
          setError("La fecha de caducidad de la tarjeta es obligatoria para crear un cliente")
          return
        }
        // Validar CVV
        if (!usuarioData.cliente?.cvv) {
          setError("El CVV es obligatorio para crear un cliente")
          return
        }
      }
      
      setGuardando(true)
      setError(null)
      
      const updateData = {
        name: usuarioData.name,
        email: usuarioData.email,
        role: usuarioData.role,
        // Incluir datos de cliente si aplica
        ...(usuarioData.cliente && {
          dni: usuarioData.cliente.dni,
          plan_id: usuarioData.cliente.plan_id,
          numero_telefono: usuarioData.cliente.numero_telefono || "",
          fecha_nacimiento: usuarioData.cliente.fecha_nacimiento || null,
          genero: usuarioData.cliente.genero || null,
          num_tarjeta: usuarioData.cliente.num_tarjeta || null,
          fecha_tarjeta: usuarioData.cliente.fecha_tarjeta || null,
          cvv: usuarioData.cliente.cvv || null,
          crear_cliente: usuarioData.role === "cliente" && !usuarioData.cliente.id
        })
      }
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (!response.ok) {
        // Si el error está en detail, es un error de validación de FastAPI
        if (data.detail) {
          let errorMessage: string
          if (Array.isArray(data.detail)) {
            errorMessage = data.detail.map((err: any) => {
              if (typeof err === 'string') return err
              return err.msg || JSON.stringify(err)
            }).join('\n')
          } else if (typeof data.detail === 'string') {
            errorMessage = data.detail
          } else if (typeof data.detail === 'object' && data.detail.msg) {
            errorMessage = data.detail.msg
          } else {
            errorMessage = JSON.stringify(data.detail)
          }
          throw new Error(errorMessage)
        }
        throw new Error(data.error || 'Error al actualizar el usuario')
      }

      // Log detallado de la respuesta del PUT
      console.log('🔄 Respuesta del PUT:', data)
      console.log('👤 Usuario actualizado recibido:', data.user)
      
      // NO usar la respuesta del PUT, siempre recargar desde GET
      // setUsuarioData(data.user)
      setEditando(false)
      
      // Mostrar mensaje de éxito (opcional)
      console.log('✅ Usuario actualizado correctamente')
      
      // Marcar que el usuario fue actualizado para refrescar la lista
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('userUpdated', 'true')
      }
      
      // También refrescar los datos actuales por si algo cambió en el servidor
      console.log('🔄 Refrescando datos después de guardar...')
      // Pequeña pausa para asegurar que la BD se ha actualizado
      await new Promise(resolve => setTimeout(resolve, 100))
      await fetchUsuario(false)
      // limpiar snapshot tras guardar correctamente
      setUsuarioSnapshot(null)
      console.log('🔄 Datos refrescados. Estado actual:', usuarioData)
      
    } catch (error) {
      console.error('Error actualizando usuario:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setGuardando(false)
    }
  }

  if (!user || user.role !== "admin") {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-lg">Cargando usuario...</span>
        </div>
      </div>
    )
  }

  if (!usuarioData) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="h-8 w-8" />
          <span className="text-lg">Usuario no encontrado</span>
        </div>
      </div>
    )
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <Crown className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        )
      case "entrenador":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Dumbbell className="h-3 w-3 mr-1" />
            Entrenador
          </Badge>
        )
      case "clientepro":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            <UserCheck className="h-3 w-3 mr-1" />
            Cliente Pro
          </Badge>
        )
      case "cliente":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <Users className="h-3 w-3 mr-1" />
            Cliente
          </Badge>
        )
      case "basico":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            <Users className="h-3 w-3 mr-1" />
            Básico
          </Badge>
        )
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }



  return (
    <div className="min-h-screen bg-background p-6">
      {/* Modal de Error */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-semibold">Error</h3>
            </div>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={closeErrorModal}
              >
                Aceptar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Detalle de Usuario</h1>
                <p className="text-white/90">Información y configuración del usuario</p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/admin/usuarios")}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>

        {/* Información del usuario */}
        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-full">
                  <User className="h-5 w-5 text-primary" />
                </div>
                {usuarioData.name}
                {getRoleBadge(usuarioData.role)}
              </CardTitle>
              <div className="flex gap-2">
                {editando && (
                  <Button
                    onClick={handleGuardar}
                    disabled={guardando}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {guardando ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar
                      </>
                    )}
                  </Button>
                )}
                <Button
                  onClick={() => {
                    // manejar entrada/salida de modo edición y snapshot
                    if (!editando) {
                      // entrar en modo edición: guardar snapshot
                      setUsuarioSnapshot(usuarioData ? JSON.parse(JSON.stringify(usuarioData)) : null)
                      setEditando(true)
                    } else {
                      // salir de modo edición (cancelar): restaurar snapshot
                      if (usuarioSnapshot) {
                        setUsuarioData(usuarioSnapshot)
                      }
                      setUsuarioSnapshot(null)
                      setEditando(false)
                    }
                  }}
                  variant={editando ? "outline" : "default"}
                  className={editando ? "" : "bg-primary hover:bg-primary/90"}
                  disabled={guardando}
                >
                  {editando ? "Cancelar" : "Editar"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Campos de cliente: mostrar tanto al crear como al editar (si el rol es cliente) */}
            {editando && usuarioData.role === "cliente" && (
              <div className="border-b pb-6 mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Información de cliente</span>
                  </div>
                  <p className="text-yellow-700 mt-1">
                    Los campos marcados con * son obligatorios al crear un cliente. Si el cliente ya existe, puedes editarlos libremente.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Información personal */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Información Personal</h3>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dni" className="font-medium flex items-center gap-1">
                      DNI/NIE
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="dni"
                      value={usuarioData.cliente?.dni || ""}
                      onChange={(e) => setUsuarioData({
                        ...usuarioData,
                        cliente: { ...usuarioData.cliente!, dni: e.target.value }
                      })}
                      required={!usuarioData.cliente?.id}
                      className="font-mono"
                      placeholder="12345678A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="flex items-center gap-1">
                      Teléfono
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="telefono"
                      type="tel"
                      value={usuarioData.cliente?.numero_telefono || ""}
                      onChange={(e) => setUsuarioData({
                        ...usuarioData,
                        cliente: { ...usuarioData.cliente!, numero_telefono: e.target.value }
                      })}
                      placeholder="600123456"
                      required={!usuarioData.cliente?.id}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fechaNacimiento">Fecha de Nacimiento
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fechaNacimiento"
                      type="date"
                      value={usuarioData.cliente?.fecha_nacimiento || ""}
                      onChange={(e) => setUsuarioData({
                        ...usuarioData,
                        cliente: { ...usuarioData.cliente!, fecha_nacimiento: e.target.value }
                      })}
                      required={!usuarioData.cliente?.id}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genero">Género <span className="text-red-500">*</span></Label>
                    <Select
                      value={usuarioData.cliente?.genero || ""}
                      onValueChange={(value) => setUsuarioData({
                        ...usuarioData,
                        cliente: { ...usuarioData.cliente!, genero: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un género" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="femenino">Femenino</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Plan y Membresía */}
                  <div className="md:col-span-2 mt-4">
                    <h3 className="text-lg font-semibold mb-4">Plan y Membresía</h3>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan" className="font-medium flex items-center gap-1">
                      Plan
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={usuarioData.cliente?.plan_id?.toString() || ""}
                      onValueChange={(value) => setUsuarioData({
                        ...usuarioData,
                        cliente: { ...usuarioData.cliente!, plan_id: parseInt(value) }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingPlanes ? "Cargando planes..." : "Selecciona un plan"} />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingPlanes ? (
                          <SelectItem value="" disabled>Cargando planes...</SelectItem>
                        ) : planes.length > 0 ? (
                          planes.map(plan => (
                            <SelectItem key={plan.id} value={plan.id.toString()}>
                              {plan.nombre}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>No hay planes disponibles</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Información de Pago */}
                  <div className="md:col-span-2 mt-4">
                    <h3 className="text-lg font-semibold mb-4">Información de Pago</h3>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numTarjeta">Número de Tarjeta <span className="text-red-500">*</span></Label>
                    <Input
                      id="numTarjeta"
                      value={usuarioData.cliente?.num_tarjeta || ""}
                      onChange={(e) => setUsuarioData({
                        ...usuarioData,
                        cliente: { ...usuarioData.cliente!, num_tarjeta: e.target.value }
                      })}
                      className="font-mono"
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fechaTarjeta">Fecha de Caducidad <span className="text-red-500">*</span></Label>
                    <Input
                      id="fechaTarjeta"
                      value={usuarioData.cliente?.fecha_tarjeta || ""}
                      onChange={(e) => setUsuarioData({
                        ...usuarioData,
                        cliente: { ...usuarioData.cliente!, fecha_tarjeta: e.target.value }
                      })}
                      placeholder="MM/YY"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV <span className="text-red-500">*</span></Label>
                    <Input
                      id="cvv"
                      type="text"
                      maxLength={4}
                      value={usuarioData.cliente?.cvv || ""}
                      onChange={(e) => setUsuarioData({
                        ...usuarioData,
                        cliente: { ...usuarioData.cliente!, cvv: e.target.value }
                      })}
                      className="font-mono w-24"
                      placeholder="123"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={usuarioData.name}
                  onChange={(e) => setUsuarioData({...usuarioData, name: e.target.value})}
                  disabled={!editando}
                  className={editando ? "" : "bg-muted"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="correo">Correo Electrónico</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="correo"
                    type="email"
                    value={usuarioData.email}
                    onChange={(e) => setUsuarioData({...usuarioData, email: e.target.value})}
                    disabled={!editando}
                    className={`flex-1 ${editando ? "" : "bg-muted"}`}
                  />
                  {usuarioData.email_verified ? (
                    <div title="Email verificado">
                      <MailCheck className="h-5 w-5 text-green-600" />
                    </div>
                  ) : (
                    <div title="Email no verificado">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                {editando ? (
                  <Select
                    value={usuarioData.role}
                    onValueChange={(value) => {
                      if (value === "cliente" && usuarioData.role === "usuario") {
                        // Inicializar campos de cliente cuando se cambia a rol cliente
                        setUsuarioData({
                          ...usuarioData,
                          role: value,
                          cliente: {
                            id: 0,
                            dni: "",
                            numero_telefono: "",
                            plan_id: 0,
                            plan_name: "",
                            fecha_nacimiento: "",
                            genero: "",
                            fecha_inscripcion: new Date().toISOString().split('T')[0],
                            estado: "activo",
                            created_at: "",
                            updated_at: ""
                          }
                        })
                      } else {
                        setUsuarioData({...usuarioData, role: value})
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usuario">Usuario</SelectItem>
                      <SelectItem value="cliente">Cliente</SelectItem>
                      <SelectItem value="entrenador">Entrenador</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="role"
                    value={usuarioData.role}
                    disabled
                    className="bg-muted"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>ID de Usuario</Label>
                <Input 
                  value={usuarioData.id.toString().padStart(3, "0")} 
                  disabled 
                  className="bg-muted font-mono" 
                />
              </div>

              <div className="space-y-2">
                <Label>Estado de Email</Label>
                <Input 
                  value={usuarioData.email_verified ? "Verificado" : "Pendiente de verificación"}
                  disabled 
                  className="bg-muted" 
                />
              </div>
            </div>

            {/* Información de timestamps del usuario */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Información Temporal del Usuario
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Usuario Creado</Label>
                  <Input 
                    value={usuarioData.created_at ? new Date(usuarioData.created_at).toLocaleString() : 'No disponible'}
                    disabled 
                    className="bg-muted text-xs" 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Última Actualización</Label>
                  <Input 
                    value={usuarioData.updated_at ? new Date(usuarioData.updated_at).toLocaleString() : 'No disponible'}
                    disabled 
                    className="bg-muted text-xs" 
                  />
                </div>
              </div>
            </div>

            {/* Información de cliente si aplica y no está en modo edición */}
            {usuarioData.cliente && !editando && (
              <div className="space-y-4">
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Información de Cliente
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Plan Contratado</Label>
                      <Input 
                        value={usuarioData.cliente.plan_name}
                        disabled 
                        className="bg-muted" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Input 
                        value={usuarioData.cliente.estado}
                        disabled 
                        className={`bg-muted capitalize ${
                          usuarioData.cliente.estado === 'activo' ? 'text-green-600' : 'text-gray-600'
                        }`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Fecha de Inscripción</Label>
                      <Input 
                        value={new Date(usuarioData.cliente.fecha_inscripcion).toLocaleDateString()}
                        disabled 
                        className="bg-muted" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Creado</Label>
                      <Input 
                        value={usuarioData.cliente.created_at ? new Date(usuarioData.cliente.created_at).toLocaleString() : 'No disponible'}
                        disabled 
                        className="bg-muted text-xs" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Última Actualización</Label>
                      <Input 
                        value={usuarioData.cliente.updated_at ? new Date(usuarioData.cliente.updated_at).toLocaleString() : 'No disponible'}
                        disabled 
                        className="bg-muted text-xs" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje para usuarios sin plan */}
            {usuarioData.role === "usuario" && (
              <div className="border-t pt-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Usuario sin plan</span>
                  </div>
                  <p className="text-yellow-700 mt-1">
                    Este usuario no ha contratado ningún plan de gimnasio aún.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
