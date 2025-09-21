"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Activity, BarChart3, Calendar, Users, LogOut } from "lucide-react"

interface Cliente {
  id: number
  name: string
  email: string
  lastActivity: string
  totalWorkouts: number
  status: "activo" | "inactivo"
  avatar?: string
}

export default function EntrenadorPage() {
  const { user, isTrainer, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    if (!isTrainer()) {
      router.push("/")
      return
    }

    const clientesSimulados: Cliente[] = [
      {
        id: 1,
        name: "Ana García",
        email: "ana.garcia@email.com",
        lastActivity: "2024-01-15",
        totalWorkouts: 24,
        status: "activo",
      },
      {
        id: 2,
        name: "Carlos López",
        email: "carlos.lopez@email.com",
        lastActivity: "2024-01-10",
        totalWorkouts: 18,
        status: "activo",
      },
      {
        id: 3,
        name: "María Rodríguez",
        email: "maria.rodriguez@email.com",
        lastActivity: "2023-12-28",
        totalWorkouts: 8,
        status: "inactivo",
      },
      {
        id: 4,
        name: "David Martín",
        email: "david.martin@email.com",
        lastActivity: "2024-01-14",
        totalWorkouts: 31,
        status: "activo",
      },
    ]

    setClientes(clientesSimulados)
    setIsLoading(false)
  }, [isAuthenticated, isTrainer, router])

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
        <div className="text-lg">Cargando panel de entrenador...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <Card className="border-border shadow-lg bg-card rounded-lg">
          <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-white/20 rounded-full">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-white">Panel de Entrenador</CardTitle>
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
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="p-2 bg-primary rounded-full">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{clientes.length}</p>
                  <p className="text-sm text-muted-foreground">Clientes asignados</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="p-2 bg-green-600 rounded-full">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {clientes.filter((c) => c.status === "activo").length}
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
                    {clientes.filter((c) => c.status === "inactivo").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Clientes inactivos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-lg bg-card rounded-lg">
          <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2 text-white">
              <div className="p-2 bg-white/20 rounded-full">
                <Users className="h-4 w-4 text-white" />
              </div>
              <span>Mis Clientes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
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
                        <span className="text-xs text-muted-foreground">Última actividad: {cliente.lastActivity}</span>
                        <span className="text-xs text-primary font-medium">{cliente.totalWorkouts} entrenamientos</span>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
