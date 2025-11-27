"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { API_CONFIG } from "@/lib/config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Activity, BarChart3, Calendar, Users, LogOut, RefreshCw } from "lucide-react"

interface Cliente {
  id: number
  cliente_id: number
  name: string
  email: string
  fecha_inscripcion: string
  estado: string
  plan_nombre: string
  plan_color: string
  fecha_asignacion: string
  notas?: string
  asignacion_id: number
  last_activity: string
  total_workouts: number
  status: "activo" | "inactivo"
  avatar?: string
}

interface EstadisticasEntrenador {
  total_clientes: number
  clientes_activos: number
  clientes_inactivos: number
}

export default function EntrenadorPage() {
  const { user, isTrainer, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasEntrenador | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClientesData = async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      setError(null)
      
  const response = await fetch(`${API_CONFIG.BASE_URL}/entrenador/${user.id}/clientes`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Error al obtener clientes")
      }

      const data = await response.json()
      
      if (data.success) {
        setClientes(data.clientes)
        setEstadisticas(data.estadisticas)
      } else {
        throw new Error("Error en la respuesta del servidor")
      }
    } catch (error) {
      console.error("Error al obtener clientes:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
      // Si es error de entrenador no encontrado, mostrar datos vacíos
      if (error instanceof Error && error.message.includes("no encontrado")) {
        setClientes([])
        setEstadisticas({ total_clientes: 0, clientes_activos: 0, clientes_inactivos: 0 })
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    if (!isTrainer()) {
      router.push("/")
      return
    }

    fetchClientesData()
  }, [isAuthenticated, isTrainer, router, user?.id])

  const handleAsignarEntrenamiento = (clienteId: number) => {
    console.log("[v0] Asignar entrenamiento a cliente:", clienteId)
    router.push(`/entrenador/asignar-entrenamiento/${clienteId}`)
  }

  const handleVerEstadisticas = (clienteId: number) => {
    console.log("[v0] Ver estadísticas de cliente:", clienteId)
    router.push(`/entrenador/estadisticas/${clienteId}`)
  }

  const handleLogout = () => {
    logout() // Limpiar la sesión del usuario
    router.push("/") // Redirigir a la landing page
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <div className="text-lg">Cargando panel de entrenador...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={fetchClientesData} className="mb-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
          <div>
            <Button variant="outline" onClick={() => router.push("/")}>
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white/20 rounded-full">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Panel de Entrenador</h2>
                <p className="text-orange-100">Bienvenido, {user?.name}</p>
                <p className="text-sm text-orange-100">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Stats under header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="p-2 bg-primary rounded-full">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{estadisticas?.total_clientes || 0}</p>
              <p className="text-sm text-muted-foreground">Clientes asignados</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="p-2 bg-green-600 rounded-full">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {estadisticas?.clientes_activos || 0}
              </p>
              <p className="text-sm text-muted-foreground">Clientes activos</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="p-2 bg-red-600 rounded-full">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {estadisticas?.clientes_inactivos || 0}
              </p>
              <p className="text-sm text-muted-foreground">Clientes inactivos</p>
            </div>
          </div>
        </div>

        <Card className="border-border shadow-lg bg-card rounded-lg">
          <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-white/20 rounded-full">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <span>Mis Clientes</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                onClick={fetchClientesData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {clientes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium mb-2">No tienes clientes asignados</p>
                <p className="text-sm">Cuando se te asignen clientes, aparecerán aquí.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clientes.map((cliente) => (
                <div
                  key={cliente.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted hover:border-primary/50 transition-all duration-200 shadow-sm"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="border-2 border-primary/20">
                      <AvatarImage src={cliente.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                        {cliente.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">{cliente.name}</h3>
                      <p className="text-sm text-muted-foreground">{cliente.email}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-muted-foreground">Asignado: {cliente.fecha_asignacion}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={cliente.status === "activo" ? "default" : "secondary"}
                      className={
                        cliente.status === "activo"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      }
                    >
                      {cliente.status}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-white"
                        onClick={() => handleAsignarEntrenamiento(cliente.id)}
                      >
                        <Activity className="h-4 w-4 mr-1" />
                        <span className="sm:inline hidden">Asignar Entrenamiento</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-white bg-transparent"
                        onClick={() => handleVerEstadisticas(cliente.id)}
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        <span className="sm:inline hidden">Ver Estadísticas</span>
                      </Button>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
