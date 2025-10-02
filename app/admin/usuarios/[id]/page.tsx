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
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "administrador")) {
      router.push("/")
    }
  }, [user, router])

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
    if (user && (user.role === "admin" || user.role === "administrador") && userId) {
      fetchUsuario()
    }
  }, [user, userId])

  const handleGuardar = async () => {
    if (!usuarioData) return
    
    try {
      setGuardando(true)
      setError(null)
      
      const updateData = {
        name: usuarioData.name,
        email: usuarioData.email,
        role: usuarioData.role,
        // Incluir datos de cliente si aplica
        ...(usuarioData.cliente && {
          dni: usuarioData.cliente.dni,
          numero_telefono: usuarioData.cliente.numero_telefono,
          fecha_nacimiento: usuarioData.cliente.fecha_nacimiento,
          genero: usuarioData.cliente.genero
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
      console.log('🔄 Datos refrescados. Estado actual:', usuarioData)
      
    } catch (error) {
      console.error('Error actualizando usuario:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setGuardando(false)
    }
  }

  if (!user || (user.role !== "admin" && user.role !== "administrador")) {
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

  if (error || !usuarioData) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="h-8 w-8" />
          <span className="text-lg">{error || 'Usuario no encontrado'}</span>
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
                  onClick={() => setEditando(!editando)}
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
                    onValueChange={(value) => setUsuarioData({...usuarioData, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usuario">Usuario</SelectItem>
                      <SelectItem value="cliente">Cliente</SelectItem>
                      <SelectItem value="clientepro">Cliente Pro</SelectItem>
                      <SelectItem value="entrenador">Entrenador</SelectItem>
                      <SelectItem value="administrador">Administrador</SelectItem>
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

            {/* Información de cliente si aplica */}
            {usuarioData.cliente && (
              <div className="space-y-4">
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Información de Cliente
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>DNI/NIE</Label>
                      <Input 
                        value={usuarioData.cliente.dni}
                        onChange={(e) => setUsuarioData({
                          ...usuarioData, 
                          cliente: {...usuarioData.cliente!, dni: e.target.value}
                        })}
                        disabled={!editando}
                        className={`font-mono ${editando ? "" : "bg-muted"}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Teléfono</Label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <Input 
                          value={usuarioData.cliente.numero_telefono}
                          onChange={(e) => setUsuarioData({
                            ...usuarioData, 
                            cliente: {...usuarioData.cliente!, numero_telefono: e.target.value}
                          })}
                          disabled={!editando}
                          className={`flex-1 ${editando ? "" : "bg-muted"}`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Plan Contratado</Label>
                      <Input 
                        value={usuarioData.cliente.plan_name}
                        disabled 
                        className="bg-muted" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Fecha de Nacimiento</Label>
                      {editando ? (
                        <Input 
                          type="date"
                          value={usuarioData.cliente.fecha_nacimiento}
                          onChange={(e) => setUsuarioData({
                            ...usuarioData, 
                            cliente: {...usuarioData.cliente!, fecha_nacimiento: e.target.value}
                          })}
                        />
                      ) : (
                        <Input 
                          value={new Date(usuarioData.cliente.fecha_nacimiento).toLocaleDateString()}
                          disabled 
                          className="bg-muted" 
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Género</Label>
                      {editando ? (
                        <Select
                          value={usuarioData.cliente.genero}
                          onValueChange={(value) => setUsuarioData({
                            ...usuarioData, 
                            cliente: {...usuarioData.cliente!, genero: value}
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="masculino">Masculino</SelectItem>
                            <SelectItem value="femenino">Femenino</SelectItem>
                            <SelectItem value="otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input 
                          value={usuarioData.cliente.genero}
                          disabled 
                          className="bg-muted capitalize" 
                        />
                      )}
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
